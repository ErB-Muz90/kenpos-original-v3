// Type declarations for WebUSB API to fix TypeScript errors.
// In a real project, this would be handled by tsconfig.json "lib": ["webusb"] or by installing @types/w3c-web-usb.
declare global {
    interface USBDevice {
        readonly vendorId: number;
        readonly productId: number;
        readonly productName?: string;
        readonly configuration: USBConfiguration | null;
        open(): Promise<void>;
        selectConfiguration(configurationValue: number): Promise<void>;
        claimInterface(interfaceNumber: number): Promise<void>;
        transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
    }

    interface USBConfiguration {
        readonly interfaces: ReadonlyArray<USBInterface>;
    }

    interface USBInterface {
        readonly alternates: ReadonlyArray<USBAlternateInterface>;
    }

    interface USBAlternateInterface {
        readonly endpoints: ReadonlyArray<USBEndpoint>;
    }

    interface USBEndpoint {
        readonly direction: 'in' | 'out';
        readonly endpointNumber: number;
    }

    interface USBOutTransferResult {
        readonly bytesWritten: number;
        readonly status: 'ok' | 'stall';
    }

    interface USB {
        getDevices(): Promise<USBDevice[]>;
        requestDevice(options?: { filters: any[] }): Promise<USBDevice>;
    }

    interface Navigator {
        readonly usb: USB;
    }
}

import { Sale, Settings } from '../types';

// --- WebUSB Device Management ---

let device: USBDevice | null = null;
let endpointNumber: number | null = null;

/**
 * Requests a USB device from the user and establishes a connection.
 * @returns The connected USBDevice instance.
 * @throws If no device is selected or connection fails.
 */
export async function requestAndConnectDevice(): Promise<USBDevice> {
    try {
        const selectedDevice = await navigator.usb.requestDevice({
            filters: [] // No filters to allow user to select any USB device initially
        });

        if (!selectedDevice) {
            throw new Error("No device selected.");
        }
        
        await selectedDevice.open();
        
        // Use the first configuration
        if (selectedDevice.configuration === null) {
            await selectedDevice.selectConfiguration(1);
        }

        // Claim the first interface
        await selectedDevice.claimInterface(0);

        // Find the OUT endpoint
        const iface = selectedDevice.configuration?.interfaces[0];
        const outEndpoint = iface?.alternates[0].endpoints.find(e => e.direction === 'out');

        if (!outEndpoint) {
            throw new Error("Could not find an OUT endpoint on the printer.");
        }
        
        device = selectedDevice;
        endpointNumber = outEndpoint.endpointNumber;

        console.log("Printer connected:", device.productName);
        return device;

    } catch (error) {
        console.error("WebUSB connection error:", error);
        throw error;
    }
}

/**
 * Reconnects to a previously authorized device without user interaction.
 * @param vendorId - The vendor ID of the device to connect to.
 * @param productId - The product ID of the device to connect to.
 * @returns True if reconnection was successful, false otherwise.
 */
export async function reconnectDevice(vendorId: number, productId: number): Promise<boolean> {
     try {
        const devices = await navigator.usb.getDevices();
        const foundDevice = devices.find(d => d.vendorId === vendorId && d.productId === productId);

        if (foundDevice) {
            device = foundDevice;
            await device.open();
            if (device.configuration === null) await device.selectConfiguration(1);
            await device.claimInterface(0);
            const iface = device.configuration?.interfaces[0];
            const outEndpoint = iface?.alternates[0].endpoints.find(e => e.direction === 'out');
            if (!outEndpoint) throw new Error("Could not find OUT endpoint on reconnect.");
            
            endpointNumber = outEndpoint.endpointNumber;
            console.log("Reconnected to printer:", device.productName);
            return true;
        }
        return false;
    } catch (error) {
        console.error("WebUSB reconnection error:", error);
        device = null;
        endpointNumber = null;
        return false;
    }
}

// --- ESC/POS Command Generation ---

const encoder = new TextEncoder();

const ESC = 0x1B;
const GS = 0x1D;

const COMMANDS = {
    // Feed control
    CTL_LF: [0x0A], // Print and line feed
    
    // Printer hardware
    HW_INIT: [ESC, 0x40], // Initialize printer

    // Paper
    PAPER_FULL_CUT: [GS, 0x56, 0x00],
    PAPER_PART_CUT: [GS, 0x56, 0x01],
    
    // Cash Drawer
    CD_KICK_2: [ESC, 0x70, 0x00, 0x19, 0xFA], // Pin 2
    CD_KICK_5: [ESC, 0x70, 0x01, 0x19, 0xFA], // Pin 5
};


/**
 * Sends raw data to the connected printer.
 * @param data - The Uint8Array of data to send.
 */
async function sendData(data: Uint8Array): Promise<USBOutTransferResult> {
    if (!device || !endpointNumber) {
        throw new Error("Printer is not connected.");
    }
    return device.transferOut(endpointNumber, data);
}

/**
 * Creates a formatted receipt as a Uint8Array.
 * @param sale - The sale object.
 * @param settings - The application settings.
 * @param cashierName - The name of the cashier.
 * @returns A Uint8Array containing the full receipt commands.
 */
function buildReceipt(sale: Sale, settings: Settings, cashierName: string): Uint8Array {
    const lines: (string | Uint8Array)[] = [];

    lines.push(new Uint8Array(COMMANDS.HW_INIT));
    lines.push(settings.businessInfo.name + '\n');
    lines.push(settings.businessInfo.location + '\n');
    lines.push(`Tel: ${settings.businessInfo.phone}\n`);
    lines.push(`PIN: ${settings.businessInfo.kraPin}\n`);
    lines.push('--------------------------------\n');
    lines.push(`Date: ${new Date(sale.date).toLocaleString()}\n`);
    lines.push(`Receipt: ${sale.id}\n`);
    lines.push(`Cashier: ${cashierName}\n`);
    lines.push('--------------------------------\n');

    sale.items.forEach(item => {
        const total = (item.price * item.quantity).toFixed(2);
        const name = item.name.padEnd(20);
        lines.push(`${name} ${item.quantity} x ${total}\n`);
    });
    
    lines.push('--------------------------------\n');
    lines.push(`TOTAL: KSH ${sale.total.toFixed(2)}\n`);
    lines.push('--------------------------------\n');

    sale.payments.forEach(p => {
        lines.push(`${p.method}: ${p.amount.toFixed(2)}\n`);
    });
    
    if (sale.change > 0) {
        lines.push(`Change: ${sale.change.toFixed(2)}\n`);
    }

    lines.push('\n');
    lines.push(settings.receipt.footer + '\n\n\n');
    
    // Combine text and command arrays into a single Uint8Array
    const encodedLines = lines.map(line => typeof line === 'string' ? encoder.encode(line) : line);
    
    const finalCommands = [
        ...encodedLines,
        new Uint8Array(COMMANDS.PAPER_FULL_CUT)
    ];

    const totalLength = finalCommands.reduce((acc, val) => acc + val.length, 0);
    const combined = new Uint8Array(totalLength);

    let offset = 0;
    finalCommands.forEach(arr => {
        combined.set(arr, offset);
        offset += arr.length;
    });

    return combined;
}

/**
 * Generates receipt commands and sends them to the printer.
 * Also kicks the cash drawer.
 * @param sale - The sale to print.
 * @param settings - The application settings.
 * @param cashierName - The cashier's name.
 */
export async function printDirect(sale: Sale, settings: Settings, cashierName: string) {
    if (!device) throw new Error("Printer not connected");

    // 1. Kick the cash drawer
    await sendData(new Uint8Array(COMMANDS.CD_KICK_2));
    
    // 2. Build and print the receipt
    const receiptData = buildReceipt(sale, settings, cashierName);
    await sendData(receiptData);
}
