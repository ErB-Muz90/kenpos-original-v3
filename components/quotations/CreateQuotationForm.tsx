import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Customer, Product, Settings, Quotation, QuotationItem } from '../../types';
import { getPriceBreakdown } from '../../utils/vatCalculator';

interface CreateQuotationFormProps {
    customers: Customer[];
    products: Product[];
    settings: Settings;
    onSave: (quotation: Omit<Quotation, 'id'>) => void;
    onCancel: () => void;
}

const CreateQuotationForm: React.FC<CreateQuotationFormProps> = ({ customers, products, settings, onSave, onCancel }) => {
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
    const [items, setItems] = useState<QuotationItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
    }, [searchTerm, products]);
    
    const totals = useMemo(() => {
        const vatRate = settings.tax.vatRate / 100;
        const subtotal = items.reduce((acc, item) => {
            const { basePrice } = getPriceBreakdown(item.price, item.pricingType, vatRate);
            return acc + basePrice * item.quantity;
        }, 0);
        const tax = subtotal * vatRate;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [items, settings.tax.vatRate]);

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
                price: product.price,
                pricingType: product.pricingType
            }];
        });
        setSearchTerm('');
    };

    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setItems(prev => prev.filter(i => i.productId !== productId));
        } else {
            setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: newQuantity } : i));
        }
    };

    const handleSave = () => {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer || items.length === 0) {
            alert('Please select a customer and add at least one item.');
            return;
        }
        
        const createdDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(createdDate.getDate() + 7); // 7-day validity

        const newQuote: Omit<Quotation, 'id'> = {
            quoteNumber: `${settings.receipt.quotePrefix}${Date.now().toString().slice(-6)}`,
            customerId: customer.id,
            customerName: customer.name,
            items,
            status: 'Draft',
            createdDate,
            expiryDate,
            ...totals
        };
        onSave(newQuote);
    };

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
                className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
            >
                <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white rounded-t-xl">
                    <h1 className="text-2xl font-bold text-slate-800">Create New Quotation</h1>
                    <div className="flex space-x-3">
                        <motion.button onClick={onCancel} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Cancel</motion.button>
                        <motion.button onClick={handleSave} whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">Save Quote</motion.button>
                    </div>
                </div>

                <div className="flex-grow overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
                        {/* Customer & Product Search */}
                        <div className="bg-white p-6 rounded-xl shadow-md space-y-4 flex-shrink-0">
                             <div>
                                <label htmlFor="customer" className="block text-sm font-medium text-slate-700">Customer</label>
                                <select id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="mt-1 block w-full max-w-sm pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <label htmlFor="product-search" className="block text-sm font-medium text-slate-700">Add Product</label>
                                <input
                                    id="product-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Type to search products..."
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                />
                                {searchResults.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                        {searchResults.map(p => (
                                            <li key={p.id} onClick={() => handleAddProduct(p)} className="px-4 py-2 hover:bg-slate-100 cursor-pointer">
                                                {p.name} - Ksh {p.price.toFixed(2)}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        
                        {/* Items Table */}
                        <div className="bg-white rounded-xl shadow-md overflow-y-auto flex-grow">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10 font-bold">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Product</th>
                                        <th scope="col" className="px-6 py-3 text-center">Quantity</th>
                                        <th scope="col" className="px-6 py-3 text-right">Unit Price</th>
                                        <th scope="col" className="px-6 py-3 text-right">Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.productId} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-semibold text-slate-900">{item.productName}</td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                    className="w-16 text-center bg-slate-100 border rounded-md p-1"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono">{item.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-mono font-semibold">{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-8 text-slate-400">No items added to quote.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 space-y-3 sticky top-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Summary</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Subtotal (Pre-tax)</span>
                                <span className="font-semibold text-slate-800 font-mono">Ksh {totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">VAT ({settings.tax.vatRate}%)</span>
                                <span className="font-semibold text-slate-800 font-mono">Ksh {totals.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold border-t pt-3 mt-3">
                                <span className="text-slate-800">Total</span>
                                <span className="text-emerald-600 font-mono">Ksh {totals.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CreateQuotationForm;