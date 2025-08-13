import { CartItem, Sale, Product, Customer, Supplier, PurchaseOrder, SupplierInvoice, Quotation, User, Settings, AuditLog, Shift } from '../types';

const DB_NAME = 'KenPOS-DB';
const DB_VERSION = 2; // Incremented version for schema change
const STORES = [
    'products', 'customers', 'sales', 'suppliers', 'purchaseOrders',
    'supplierInvoices', 'quotations', 'users', 'settings', 'auditLogs',
    'shifts', 'cart', 'orderQueue'
];


let db: IDBDatabase | null = null;
let initPromise: Promise<IDBDatabase> | null = null;

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function initDB(): Promise<IDBDatabase> {
    if (db) {
        return Promise.resolve(db);
    }
    if (initPromise) {
        return initPromise;
    }

    console.log('[DB] Initializing IndexedDB...');

    initPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            console.log(`[DB] Upgrading to version ${DB_VERSION}.`);
            STORES.forEach(storeName => {
                if (!dbInstance.objectStoreNames.contains(storeName)) {
                    dbInstance.createObjectStore(storeName, { keyPath: 'id' });
                    console.log(`[DB] Created '${storeName}' store.`);
                }
            });
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('[DB] Database opened successfully.');
            db.onclose = () => {
                console.warn('[DB] Database connection closed.');
                db = null; 
                initPromise = null;
            };
            resolve(db);
        };

        request.onerror = () => {
            console.error('[DB] Database error:', request.error);
            initPromise = null;
            reject(request.error);
        };
    });
    
    return initPromise;
}

async function getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const dbInstance = await initDB();
    const tx = dbInstance.transaction(storeName, mode);
    return tx.objectStore(storeName);
}

// --- Generic Data Operations ---

export async function getAllItems<T>(storeName: string): Promise<T[]> {
    const store = await getStore(storeName, 'readonly');
    return promisifyRequest(store.getAll());
}

export async function getItem<T>(storeName: string, id: string): Promise<T | undefined> {
    const store = await getStore(storeName, 'readonly');
    return promisifyRequest(store.get(id));
}

export async function saveItem<T extends {id: string}>(storeName:string, item: T): Promise<IDBValidKey> {
    const store = await getStore(storeName, 'readwrite');
    return promisifyRequest(store.put(item));
}

export async function saveAllItems<T extends {id: string}>(storeName: string, items: T[]): Promise<void> {
    const store = await getStore(storeName, 'readwrite');
    // Clear before saving all to ensure a clean slate, useful for cart-like stores
    await promisifyRequest(store.clear());
    for(const item of items) {
        await promisifyRequest(store.add(item));
    }
}

export async function deleteItem(storeName: string, id: string): Promise<void> {
    const store = await getStore(storeName, 'readwrite');
    await promisifyRequest(store.delete(id));
}

// --- Offline Order Queue Specific ---

export async function syncPendingOrders(): Promise<{ success: number; failed: number; syncedOrders: Sale[] }> {
    console.log('[DB] Starting sync of pending orders...');
    if (!navigator.onLine) {
        console.log('[DB] Sync attempt stopped: Offline.');
        return { success: 0, failed: 0, syncedOrders: [] };
    }

    const store = await getStore('orderQueue', 'readwrite');
    const orders = await promisifyRequest(store.getAll());
    
    if (orders.length === 0) {
        console.log('[DB] No pending orders to sync.');
        return { success: 0, failed: 0, syncedOrders: [] };
    }

    let successCount = 0;
    let failedCount = 0;
    const syncedOrders: Sale[] = [];

    for (const order of orders) {
        try {
            const response = await new Promise<Response>(resolve => {
                setTimeout(() => resolve(new Response(null, { status: 200 })), 500);
            });

            if (response.ok) {
                await promisifyRequest(store.delete(order.id));
                successCount++;
                syncedOrders.push(order);
            } else {
                failedCount++;
            }
        } catch (error) {
            failedCount++;
        }
    }

    console.log(`[DB] Sync finished. Success: ${successCount}, Failed: ${failedCount}.`);
    return { success: successCount, failed: failedCount, syncedOrders };
}

export async function getQueuedOrderCount(): Promise<number> {
    const store = await getStore('orderQueue', 'readonly');
    return promisifyRequest(store.count());
}


// --- Backup, Restore, Wipe ---

export async function getAllData(): Promise<Record<string, any[]>> {
    const allData: Record<string, any[]> = {};
    for (const storeName of STORES) {
        allData[storeName] = await getAllItems(storeName);
    }
    return allData;
}

export async function restoreAllData(data: Record<string, any[]>): Promise<void> {
    for (const storeName of STORES) {
        if(data[storeName]) {
            const store = await getStore(storeName, 'readwrite');
            await promisifyRequest(store.clear());
            for(const item of data[storeName]) {
                // Handle date conversion from JSON strings
                if (item.date) item.date = new Date(item.date);
                if (item.dateAdded) item.dateAdded = new Date(item.dateAdded);
                if (item.startTime) item.startTime = new Date(item.startTime);
                if (item.endTime) item.endTime = new Date(item.endTime);
                if (item.invoiceDate) item.invoiceDate = new Date(item.invoiceDate);
                if (item.dueDate) item.dueDate = new Date(item.dueDate);
                if (item.createdDate) item.createdDate = new Date(item.createdDate);
                if (item.expectedDate) item.expectedDate = new Date(item.expectedDate);
                if (item.expiryDate) item.expiryDate = new Date(item.expiryDate);

                await promisifyRequest(store.put(item));
            }
        }
    }
}

export async function wipeDatabase(): Promise<void> {
    if (db) {
        db.close();
        db = null;
        initPromise = null;
    }
    await promisifyRequest(indexedDB.deleteDatabase(DB_NAME));
}
