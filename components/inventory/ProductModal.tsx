import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Settings } from '../../types';
import { getPriceBreakdown } from '../../utils/vatCalculator';

interface ProductModalProps {
    onClose: () => void;
    onSave: (product: Omit<Product, 'id' | 'stock'> | Product) => void;
    product?: Product;
    categories: string[];
    settings: Settings;
}

const ProductModal = ({ onClose, onSave, product, categories, settings }: ProductModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        ean: '',
        category: '',
        price: 0,
        costPrice: 0,
        pricingType: 'exclusive' as 'inclusive' | 'exclusive',
        productType: 'Inventory' as 'Inventory' | 'Service',
        stock: 0,
        description: '',
        imageUrl: '',
        unitOfMeasure: 'pc(s)',
    });
    
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                ean: product.ean || '',
                category: product.category,
                price: product.price,
                costPrice: product.costPrice || 0,
                pricingType: product.pricingType,
                productType: product.productType || 'Inventory',
                stock: product.stock,
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                unitOfMeasure: product.unitOfMeasure || 'pc(s)',
            });
            const productCategoryExists = categories.includes(product.category);
            setIsAddingNewCategory(!productCategoryExists);
            if (!productCategoryExists && product.category) {
                setNewCategoryName(product.category);
            } else {
                setNewCategoryName('');
            }
        } else {
            // Reset for new product
            setFormData({
                name: '', sku: '', ean: '', category: '', price: 0, costPrice: 0, 
                pricingType: settings.tax.pricingType, productType: 'Inventory', stock: 0, description: '', imageUrl: '',
                unitOfMeasure: 'pc(s)',
            });
            setIsAddingNewCategory(false);
            setNewCategoryName('');
        }
    }, [product, categories, settings.tax.pricingType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const isNumericField = ['price', 'stock', 'costPrice'].includes(name);
            const newFormData = { ...prev, [name]: isNumericField ? parseFloat(value) || 0 : value };

            if (name === 'productType' && value === 'Service') {
                newFormData.stock = 9999;
            }
            return newFormData;
        });
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '__ADD_NEW__') {
            setIsAddingNewCategory(true);
            setNewCategoryName('');
            setFormData(prev => ({ ...prev, category: '' }));
        } else {
            setIsAddingNewCategory(false);
            setNewCategoryName('');
            setFormData(prev => ({ ...prev, category: value }));
        }
    };
    
    const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewCategoryName(value);
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (isAddingNewCategory) {
            if (!dataToSave.category.trim()) {
                alert('New category name cannot be empty.');
                return;
            }
        }
        if (!dataToSave.imageUrl) {
            dataToSave.imageUrl = `https://placehold.co/300x300/e2e8f0/475569?text=${dataToSave.name.charAt(0)}`;
        }
        
        if (product) {
            onSave({ ...product, ...dataToSave });
        } else {
            onSave(dataToSave);
        }
    };

    const priceBreakdown = useMemo(() => {
        if (!formData.price) return { basePrice: 0, vatAmount: 0, total: 0 };
        const { basePrice, vatAmount } = getPriceBreakdown(formData.price, formData.pricingType, settings.tax.vatRate / 100);
        return { basePrice, vatAmount, total: basePrice + vatAmount };
    }, [formData.price, formData.pricingType, settings.tax.vatRate]);

    const profitAnalysis = useMemo(() => {
        if (!priceBreakdown.basePrice || !formData.costPrice) return { profit: 0, margin: 0 };
        const profit = priceBreakdown.basePrice - formData.costPrice;
        const margin = priceBreakdown.basePrice > 0 ? (profit / priceBreakdown.basePrice) * 100 : 0;
        return { profit, margin };
    }, [priceBreakdown.basePrice, formData.costPrice]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 max-h-full overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div className="md:col-span-2 space-y-4">
                            {/* Product Image Upload */}
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Product Image</label>
                                <div className="mt-1 flex items-center space-x-6">
                                    <div className="shrink-0">
                                        <img className="h-24 w-24 object-cover rounded-md" src={formData.imageUrl || `https://placehold.co/100x100/e2e8f0/475569?text=?`} alt="Current product" />
                                    </div>
                                    <label className="block">
                                        <span className="sr-only">Choose profile photo</span>
                                        <input type="file" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Product Name</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-x-6">
                                <div>
                                    <label htmlFor="sku" className="block text-sm font-medium text-slate-700">SKU (Internal Code)</label>
                                    <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="ean" className="block text-sm font-medium text-slate-700">EAN / Barcode</label>
                                    <input type="text" name="ean" id="ean" value={formData.ean} onChange={handleChange} placeholder="Click and scan barcode" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                                </div>
                            </div>
                             <div>
                                 <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category</label>
                                <select
                                    name="category-select"
                                    id="category"
                                    value={isAddingNewCategory ? '__ADD_NEW__' : formData.category}
                                    onChange={handleCategoryChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    <option value="__ADD_NEW__">-- Add New Category --</option>
                                </select>
                                <AnimatePresence>
                                    {isAddingNewCategory && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                                            <input
                                                type="text"
                                                name="category"
                                                placeholder="New category name"
                                                value={newCategoryName}
                                                onChange={handleNewCategoryChange}
                                                required
                                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div>
                                <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-slate-700">Unit of Measure</label>
                                <input 
                                    type="text" 
                                    name="unitOfMeasure" 
                                    id="unitOfMeasure" 
                                    value={formData.unitOfMeasure} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="e.g. pc(s), kg, m"
                                    list="unit-list"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
                                />
                                {settings.measurements.enabled && (
                                    <datalist id="unit-list">
                                        {settings.measurements.units.map(unit => <option key={unit} value={unit} />)}
                                    </datalist>
                                )}
                            </div>
                             <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"></textarea>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Product Type</label>
                                <div className="mt-1 flex space-x-4">
                                    <label className="flex items-center">
                                        <input type="radio" name="productType" value="Inventory" checked={formData.productType === 'Inventory'} onChange={handleChange} className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-slate-300" />
                                        <span className="ml-2 text-sm text-slate-700">Inventory (Stocked)</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="productType" value="Service" checked={formData.productType === 'Service'} onChange={handleChange} className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-slate-300" />
                                        <span className="ml-2 text-sm text-slate-700">Service</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-1 bg-slate-50 p-4 rounded-lg space-y-4">
                            <div>
                                <label htmlFor="costPrice" className="block text-sm font-medium text-slate-700">Cost Price (Ksh)</label>
                                <input type="number" name="costPrice" id="costPrice" value={formData.costPrice} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-slate-700">Selling Price (Ksh)</label>
                                <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Pricing Type</label>
                                <div className="mt-1 flex space-x-4">
                                    <label className="flex items-center">
                                        <input type="radio" name="pricingType" value="exclusive" checked={formData.pricingType === 'exclusive'} onChange={handleChange} className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-slate-300" />
                                        <span className="ml-2 text-sm text-slate-700">Exclusive</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="pricingType" value="inclusive" checked={formData.pricingType === 'inclusive'} onChange={handleChange} className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-slate-300" />
                                        <span className="ml-2 text-sm text-slate-700">Inclusive</span>
                                    </label>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-slate-700">Stock Quantity</label>
                                <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required min="0" disabled={formData.productType === 'Service' || !!product} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm disabled:bg-slate-100" />
                                <p className="text-xs text-slate-500 mt-1">Stock for existing products should be updated via the Inventory list or Purchase Orders.</p>
                            </div>
                        </div>

                        <div className="md:col-span-3 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="text-md font-bold text-slate-700 mb-2">Pricing Analysis</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="p-2 bg-white rounded">
                                    <p className="text-slate-500">Base Price</p>
                                    <p className="font-mono font-bold text-slate-800">Ksh {priceBreakdown.basePrice.toFixed(2)}</p>
                                </div>
                                <div className="p-2 bg-white rounded">
                                    <p className="text-slate-500">VAT ({settings.tax.vatRate}%)</p>
                                    <p className="font-mono font-bold text-slate-800">Ksh {priceBreakdown.vatAmount.toFixed(2)}</p>
                                </div>
                                <div className="p-2 bg-white rounded">
                                    <p className="text-slate-500">Profit</p>
                                    <p className={`font-mono font-bold ${profitAnalysis.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Ksh {profitAnalysis.profit.toFixed(2)}</p>
                                </div>
                                <div className="p-2 bg-white rounded">
                                    <p className="text-slate-500">Margin</p>
                                    <p className={`font-mono font-bold ${profitAnalysis.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{profitAnalysis.margin.toFixed(1)}%</p>
                                </div>
                            </div>
                            <div className="mt-3 bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex justify-between items-center">
                                 <span className="font-bold text-emerald-800 text-md">Final Shelf Price</span>
                                 <span className="font-mono font-extrabold text-emerald-700 text-xl">Ksh {priceBreakdown.total.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-center">
                                {formData.pricingType === 'inclusive' 
                                ? "You've entered the final shelf price. The base price is calculated from it."
                                : "You've entered the base (pre-tax) price. VAT will be added to it."
                                }
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Cancel</motion.button>
                        <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">Save Product</motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ProductModal;