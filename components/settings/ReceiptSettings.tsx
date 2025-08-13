import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from '../../types';

interface ReceiptSettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
}

const ReceiptSettings: React.FC<ReceiptSettingsProps> = ({ settings, onUpdateSettings }) => {
    const [formData, setFormData] = useState(settings.receipt);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({ receipt: formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="footer" className="block text-sm font-medium text-slate-700">Receipt Footer Text</label>
                <textarea name="footer" id="footer" value={formData.footer} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"></textarea>
                <p className="mt-2 text-xs text-slate-500">This text will appear at the bottom of all receipts and invoices.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Number Prefixes</label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="invoicePrefix" className="block text-xs font-medium text-slate-600">Invoice Prefix</label>
                        <input type="text" name="invoicePrefix" id="invoicePrefix" value={formData.invoicePrefix} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="quotePrefix" className="block text-xs font-medium text-slate-600">Quotation Prefix</label>
                        <input type="text" name="quotePrefix" id="quotePrefix" value={formData.quotePrefix} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="poNumberPrefix" className="block text-xs font-medium text-slate-600">Purchase Order Prefix</label>
                        <input type="text" name="poNumberPrefix" id="poNumberPrefix" value={formData.poNumberPrefix} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                 <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
                    Save Receipt Settings
                </motion.button>
            </div>
        </form>
    );
};

export default ReceiptSettings;