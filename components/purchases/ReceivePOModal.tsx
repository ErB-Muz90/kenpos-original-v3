import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PurchaseOrder, Supplier, ReceivedPOItem, Product } from '../../types';

interface ReceivePOModalProps {
    purchaseOrder: PurchaseOrder;
    supplier?: Supplier;
    products: Product[];
    onConfirm: (receivedItems: ReceivedPOItem[]) => void;
    onClose: () => void;
}

interface ModalItemState {
    productId: string;
    productName: string;
    quantityOrdered: number;
    quantityPreviouslyReceived: number;
    quantityReceivingNow: number;
    cost: number;
    category: string;
    ean: string;
}

const ReceivePOModal: React.FC<ReceivePOModalProps> = ({ purchaseOrder, supplier, products, onConfirm, onClose }) => {
    const [items, setItems] = useState<ModalItemState[]>([]);
    
    const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))].sort(), [products]);

    useEffect(() => {
        const itemsToReceive = purchaseOrder.items.map(poItem => {
            const product = products.find(p => p.id === poItem.productId);
            const previouslyReceived = poItem.quantityReceived || 0;
            const outstanding = poItem.quantity - previouslyReceived;
            return {
                productId: poItem.productId,
                productName: poItem.productName,
                quantityOrdered: poItem.quantity,
                quantityPreviouslyReceived: previouslyReceived,
                quantityReceivingNow: Math.max(0, outstanding), // Default to receiving what's left
                cost: poItem.cost,
                category: product?.category || '',
                ean: product?.ean || '',
            };
        });
        setItems(itemsToReceive);
    }, [purchaseOrder, products]);

    const handleItemChange = (productId: string, field: keyof Omit<ModalItemState, 'productId' | 'productName' | 'cost'>, value: string | number) => {
        setItems(prev => prev.map(item => {
            if (item.productId === productId) {
                if (field === 'quantityReceivingNow') {
                    const maxReceivable = item.quantityOrdered - item.quantityPreviouslyReceived;
                    const receivedValue = Math.max(0, Math.min(Number(value), maxReceivable));
                    return { ...item, [field]: receivedValue };
                }
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const newInvoiceTotal = useMemo(() => {
        return items.reduce((acc, item) => acc + (item.cost * item.quantityReceivingNow), 0);
    }, [items]);

    const handleConfirm = () => {
        const itemsForConfirmation: ReceivedPOItem[] = items
            .filter(item => item.quantityReceivingNow > 0 || (item.category !== products.find(p=>p.id === item.productId)?.category) || (item.ean !== products.find(p=>p.id === item.productId)?.ean))
            .map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantityOrdered: item.quantityOrdered,
                quantityReceived: item.quantityReceivingNow, // Pass "receiving now" as "quantityReceived"
                cost: item.cost,
                category: item.category,
                ean: item.ean,
            }));
        onConfirm(itemsForConfirmation);
    };
    
    const formatCurrency = (amount: number) => `Ksh ${amount.toFixed(2)}`;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
            >
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Receive Purchase Order</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Confirm quantities and details for items received from <span className="font-semibold text-slate-700 dark:text-slate-200">{supplier?.name}</span> for PO <span className="font-semibold text-slate-700 dark:text-slate-200">{purchaseOrder.poNumber}</span>.
                    </p>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={item.productId} className="grid grid-cols-12 gap-4 items-end bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Product</label>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{item.productName}</p>
                                </div>
                                <div className="col-span-4 md:col-span-1 text-center md:text-left">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Ordered</label>
                                    <p className="text-slate-800 dark:text-slate-100 font-mono">{item.quantityOrdered}</p>
                                </div>
                                 <div className="col-span-4 md:col-span-1 text-center md:text-left">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Received</label>
                                    <p className="text-slate-800 dark:text-slate-100 font-mono">{item.quantityPreviouslyReceived}</p>
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <label htmlFor={`qty-${index}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Receiving Now</label>
                                    <input
                                        id={`qty-${index}`}
                                        type="number"
                                        value={item.quantityReceivingNow}
                                        onChange={(e) => handleItemChange(item.productId, 'quantityReceivingNow', parseInt(e.target.value) || 0)}
                                        max={item.quantityOrdered - item.quantityPreviouslyReceived}
                                        min="0"
                                        className="mt-1 block w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <label htmlFor={`cat-${index}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                                    <input
                                        type="text"
                                        id={`cat-${index}`}
                                        list="categories-list"
                                        value={item.category}
                                        onChange={(e) => handleItemChange(item.productId, 'category', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <label htmlFor={`ean-${index}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">EAN / Barcode</label>
                                    <input
                                        id={`ean-${index}`}
                                        type="text"
                                        value={item.ean}
                                        onChange={(e) => handleItemChange(item.productId, 'ean', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                         <datalist id="categories-list">
                            {categories.map(cat => <option key={cat} value={cat} />)}
                        </datalist>
                    </div>
                </div>
                
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-slate-200 dark:border-slate-700 mt-auto">
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">New Invoice Total (for this batch)</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(newInvoiceTotal)}</p>
                    </div>
                    <div className="flex space-x-3">
                        <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</motion.button>
                        <motion.button onClick={handleConfirm} whileTap={{ scale: 0.98 }} className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg text-lg hover:bg-emerald-700 transition-colors shadow-lg">Confirm & Receive</motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ReceivePOModal;