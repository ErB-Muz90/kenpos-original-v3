

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from '../../types';

interface TaxSettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
}

const TaxSettings: React.FC<TaxSettingsProps> = ({ settings, onUpdateSettings }) => {
    const [formData, setFormData] = useState(settings.tax);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: name === 'vatRate' ? parseFloat(value) : value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({ tax: formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Enable VAT Calculations</span>
                <label htmlFor="vat-toggle" className="inline-flex relative items-center cursor-pointer">
                    <input type="checkbox" name="vatEnabled" checked={formData.vatEnabled} onChange={handleChange} id="vat-toggle" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
            </div>

            <AnimatePresence>
                {formData.vatEnabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 overflow-hidden"
                    >
                        <div>
                            <label htmlFor="vatRate" className="block text-sm font-medium text-slate-700">Default VAT Rate (%)</label>
                            <input type="number" name="vatRate" id="vatRate" value={formData.vatRate} onChange={handleChange} className="mt-1 block w-full max-w-xs px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Default Pricing Type</label>
                            <div className="mt-2">
                                <select name="pricingType" value={formData.pricingType} onChange={handleChange} className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                                    <option value="exclusive">Exclusive (VAT is added to price)</option>
                                    <option value="inclusive">Inclusive (VAT is included in price)</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                             <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">Enable ETR/TIMS QR Code</span>
                                <label htmlFor="qr-toggle" className="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" name="showEtrQrCode" checked={formData.showEtrQrCode} onChange={handleChange} id="qr-toggle" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                Enable this if your annual revenue exceeds KES 5 million, as required by KRA for ETR compliance. This will add a scannable QR code to all receipts.
                            </p>
                        </div>
                         <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800">ETR/iTax Integration</h4>
                            <p className="text-sm text-blue-700 mt-1">This section will contain settings for connecting to KRA-compliant Electronic Tax Registers or iTax systems.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                 <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
                    Save Tax Settings
                </motion.button>
            </div>
        </form>
    );
};

export default TaxSettings;