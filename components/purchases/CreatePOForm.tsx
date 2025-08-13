

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Supplier, Product, PurchaseOrderItem, PurchaseOrderData } from '../../types';
import SupplierModal from './SupplierModal';

interface CreatePOFormProps {
    suppliers: Supplier[];
    products: Product[];
    onSave: (poData: PurchaseOrderData) => void;
    onCancel: () => void;
    onAddSupplier: (supplierData: Omit<Supplier, 'id'>) => Supplier | null;
}

interface POItem extends Omit<PurchaseOrderItem, 'quantityReceived'> {
    productName: string;
}

const CreatePOForm: React.FC<CreatePOFormProps> = ({ suppliers, products, onSave, onCancel, onAddSupplier }) => {
    const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
    const [expectedDate, setExpectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<POItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSupplierModalOpen, setSupplierModalOpen] = useState(false);

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [searchTerm, products]);
    
    const suggestedItems = useMemo(() => {
        const poItemIds = new Set(items.map(item => item.productId));
        return products
            .filter(p => p.productType === 'Inventory' && p.stock === 0 && !poItemIds.has(p.id))
            .sort((a,b) => a.name.localeCompare(b.name));
    }, [products, items]);

    const totalCost = useMemo(() => items.reduce((acc, item) => acc + item.cost * item.quantity, 0), [items]);

    const handleAddProduct = (product: Product) => {
        setItems(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) {
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, {
                productId: product.id,
                productName: product.name,
                quantity: 1,
                cost: product.costPrice || 0,
                unitOfMeasure: product.unitOfMeasure,
            }];
        });
        setSearchTerm('');
    };

    const handleSaveNewSupplier = (supplierData: Omit<Supplier, 'id'>) => {
        const newSupplier = onAddSupplier(supplierData);
        if (newSupplier) {
            setSupplierModalOpen(false);
            setSupplierId(newSupplier.id);
        }
    };

    const handleUpdateItem = (productId: string, field: 'quantity' | 'cost', value: number) => {
        setItems(prev => prev.map(i => {
            if (i.productId === productId) {
                if (field === 'quantity' && value <= 0) return null; // will be filtered out
                return { ...i, [field]: value };
            }
            return i;
        }).filter((i): i is POItem => i !== null));
    };

    const handleSave = (status: 'Draft' | 'Sent') => {
        if (!supplierId || items.length === 0) {
            alert('Please select a supplier and add at least one item.');
            return;
        }
        onSave({
            supplierId,
            items,
            status,
            expectedDate: new Date(expectedDate)
        });
    };

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
             <AnimatePresence>
                {isSupplierModalOpen && (
                    <SupplierModal
                        onClose={() => setSupplierModalOpen(false)}
                        onSave={handleSaveNewSupplier}
                    />
                )}
            </AnimatePresence>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">New Purchase Order</h1>
                <div className="flex space-x-3">
                    <motion.button onClick={onCancel} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200">Cancel</motion.button>
                    <motion.button onClick={() => handleSave('Draft')} whileTap={{ scale: 0.95 }} className="bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-700">Save as Draft</motion.button>
                    <motion.button onClick={() => handleSave('Sent')} whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 shadow-md">Send PO</motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="supplier" className="block text-sm font-medium text-slate-700">Supplier</label>
                             <div className="flex items-center space-x-2 mt-1">
                                <select id="supplier" value={supplierId} onChange={e => setSupplierId(e.target.value)} className="flex-grow block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                                    {suppliers.length === 0 && <option value="" disabled>Please add a supplier</option>}
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <motion.button type="button" onClick={() => setSupplierModalOpen(true)} whileTap={{scale: 0.95}} className="flex-shrink-0 bg-emerald-100 text-emerald-700 font-semibold px-3 py-2 rounded-lg hover:bg-emerald-200 transition-colors text-sm">
                                    + New
                                </motion.button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="expectedDate" className="block text-sm font-medium text-slate-700">Expected Delivery Date</label>
                            <input type="date" id="expectedDate" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Out of Stock Items</h3>
                        {suggestedItems.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                                {suggestedItems.map(product => (
                                    <div key={product.id} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="font-semibold text-sm text-slate-800">{product.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                                        </div>
                                        <motion.button
                                            type="button"
                                            onClick={() => handleAddProduct(product)}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-md hover:bg-emerald-200 transition-colors text-xs"
                                        >
                                            Add
                                        </motion.button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">No out-of-stock items to suggest.</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Search & Add Other Items</h3>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search all products by name or SKU..."
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                             {searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                                    {searchResults.map(p => (
                                        <li key={p.id} onClick={() => handleAddProduct(p)} className="px-4 py-2 hover:bg-slate-100 cursor-pointer">{p.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 p-6 pb-0">PO Items</h3>
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Product</th>
                                    <th scope="col" className="px-6 py-3">Quantity</th>
                                    <th scope="col" className="px-6 py-3">Unit Cost (Ksh)</th>
                                    <th scope="col" className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.productId} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{item.productName}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <input type="number" value={item.quantity} onChange={e => handleUpdateItem(item.productId, 'quantity', parseInt(e.target.value))} className="w-20 p-1 border rounded-md" />
                                                <span className="text-xs text-slate-500">{item.unitOfMeasure}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><input type="number" step="0.01" value={item.cost} onChange={e => handleUpdateItem(item.productId, 'cost', parseFloat(e.target.value))} className="w-24 p-1 border rounded-md" /></td>
                                        <td className="px-6 py-4 text-right font-mono font-semibold">{(item.cost * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-8 text-slate-400">Add items from the suggestions or search above.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6 space-y-3 sticky top-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">PO Summary</h3>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Total Items</span>
                            <span className="font-mono text-slate-800 font-semibold">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold border-t pt-3 mt-3">
                            <span className="text-slate-800">Total Cost</span>
                            <span className="text-emerald-600 font-mono">Ksh {totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePOForm;