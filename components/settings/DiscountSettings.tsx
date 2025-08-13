import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from '../../types';

interface DiscountSettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
}

const DiscountSettings: React.FC<DiscountSettingsProps> = ({ settings, onUpdateSettings }) => {
    const [formData, setFormData] = useState(settings.discount);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }));
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as 'percentage' | 'fixed' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({ discount: formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Enable Discounts</span>
                <label htmlFor="discount-toggle" className="inline-flex relative items-center cursor-pointer">
                    <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleChange} id="discount-toggle" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
            </div>
            
            {formData.enabled && (
                 <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                 >
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Discount Type</label>
                        <div className="mt-2 flex space-x-4">
                            <label className="flex items-center">
                                <input type="radio" name="type" value="percentage" checked={formData.type === 'percentage'} onChange={handleRadioChange} className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-slate-300" />
                                <span className="ml-2 text-sm text-slate-700">Percentage (%)</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="type" value="fixed" checked={formData.type === 'fixed'} onChange={handleRadioChange} className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-slate-300" />
                                <span className="ml-2 text-sm text-slate-700">Fixed Amount (KES)</span>
                            </label>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="maxValue" className="block text-sm font-medium text-slate-700">
                            Maximum Discount Value ({formData.type === 'percentage' ? '%' : 'KES'})
                        </label>
                        <input
                            type="number"
                            name="maxValue"
                            id="maxValue"
                            value={formData.maxValue}
                            onChange={handleChange}
                            min="0"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-slate-500">Set the maximum discount a cashier can apply.</p>
                    </div>
                </motion.div>
            )}

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                 <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
                    Save Discount Settings
                </motion.button>
            </div>
        </form>
    );
};

export default DiscountSettings;
