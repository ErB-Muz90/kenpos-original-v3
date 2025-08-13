import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Sale, Settings } from '../../types';

interface ReceiptProps {
    sale: Sale;
    cashierName: string;
    settings: Settings;
}

const Receipt = ({ sale, cashierName, settings }: ReceiptProps) => {
    const taxableAmount = sale.subtotal - sale.discountAmount;
    const grossTotal = sale.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (qrCanvasRef.current && settings.tax.showEtrQrCode) {
            const qrData = JSON.stringify({
                receiptNo: sale.id,
                date: new Date(sale.date).toISOString(),
                total: sale.total,
                pin: settings.businessInfo.kraPin,
            });
            QRCode.toCanvas(qrCanvasRef.current, qrData, { width: 128, margin: 1 }, (error) => {
                if (error) console.error("QR Code Error:", error);
            });
        }
    }, [sale, settings]);


    return (
        <div className="bg-white p-4 rounded-lg shadow-lg font-mono text-xs text-black w-full max-w-sm mx-auto">
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold">{settings.businessInfo.name}</h2>
                <p>{settings.businessInfo.location}</p>
                <p>Tel: {settings.businessInfo.phone}</p>
                <p>VAT PIN: {settings.businessInfo.kraPin}</p>
            </div>
            <div className="border-t border-b border-dashed border-black py-1 mb-2">
                <div className="flex justify-between">
                    <span>Date: {new Date(sale.date).toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })}</span>
                    <span>Time: {new Date(sale.date).toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi' })}</span>
                </div>
                <p>Receipt No: {sale.id}</p>
                <p>Cashier: {cashierName}</p>
            </div>
            <table className="w-full mb-2">
                <thead>
                    <tr className="border-b border-dashed border-black">
                        <th className="text-left py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map(item => (
                        <tr key={item.id}>
                            <td className="py-1">{item.name}</td>
                            <td className="text-center py-1">{item.quantity}</td>
                            <td className="text-right py-1">{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="space-y-1 my-2 pt-2 border-t border-dashed border-black">
                <div className="flex justify-between">
                    <span>Gross Total:</span>
                    <span>{grossTotal.toFixed(2)}</span>
                </div>
                {sale.discountAmount > 0 && (
                    <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{sale.discountAmount.toFixed(2)}</span>
                    </div>
                )}
                 <div className="flex justify-between font-bold text-sm border-y border-dashed border-black py-1 my-1">
                    <span>TOTAL:</span>
                    <span>KSH {sale.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div className="space-y-1 mb-2">
                <p className="font-bold">VAT Breakdown:</p>
                 <div className="flex justify-between">
                    <span>Taxable Amount:</span>
                    <span>{taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>VAT (16%):</span>
                    <span>{sale.tax.toFixed(2)}</span>
                </div>
            </div>

            <div className="border-t border-dashed border-black pt-1 mb-4">
                <p className="font-bold mb-1">Payment Details:</p>
                {sale.payments.map((p, i) => (
                    <div key={i}>
                        <div className="flex justify-between">
                            <span>{p.method === 'Points' ? 'Loyalty Points' : p.method}:</span>
                            <span>{p.method === 'Points' ? `-${p.amount.toFixed(2)}` : p.amount.toFixed(2)}</span>
                        </div>
                        {p.method === 'M-Pesa' && p.details && (
                            <>
                                <div className="flex justify-between pl-4 text-slate-600">
                                    <span>Ref:</span>
                                    <span>{p.details.transactionCode}</span>
                                </div>
                                <div className="flex justify-between pl-4 text-slate-600">
                                    <span>Phone:</span>
                                    <span>{p.details.phoneNumber}</span>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {sale.change > 0 && (
                    <div className="flex justify-between font-bold">
                        <span>Change:</span>
                        <span>{sale.change.toFixed(2)}</span>
                    </div>
                )}
            </div>
             
            {(sale.pointsEarned > 0 || sale.pointsUsed > 0) && (
                 <div className="border-t border-dashed border-black pt-1 mb-4">
                    <p className="font-bold mb-1">Loyalty Summary:</p>
                    <div className="flex justify-between">
                        <span>Points Earned:</span>
                        <span>+{sale.pointsEarned}</span>
                    </div>
                    {sale.pointsUsed > 0 && (
                        <div className="flex justify-between">
                            <span>Points Redeemed:</span>
                            <span>-{sale.pointsUsed}</span>
                        </div>
                    )}
                     <div className="flex justify-between font-bold">
                        <span>New Balance:</span>
                        <span>{sale.pointsBalanceAfter} pts</span>
                    </div>
                </div>
            )}
            
            {settings.tax.showEtrQrCode && (
                <div className="flex justify-center my-4">
                    <canvas ref={qrCanvasRef}></canvas>
                </div>
            )}
            
            <div className="text-center">
                <p>{settings.receipt.footer}</p>
                <p>Bidhaa zilizouzwa hazirudishwi.</p>
            </div>
        </div>
    );
};

export default Receipt;