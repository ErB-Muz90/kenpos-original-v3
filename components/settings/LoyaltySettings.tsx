import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from '../../types';

interface LoyaltySettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
}

const LoyaltySettings: React.FC<LoyaltySettingsProps> = ({ settings, onUpdateSettings }) => {
    const [formData, setFormData] = useState(settings.loyalty);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseFloat(value) || 0
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({ loyalty: formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Enable Loyalty Program</span>
                <label htmlFor="loyalty-toggle" className="inline-flex relative items-center cursor-pointer">
                    <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleChange} id="loyalty-toggle" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
            </div>
            
            {formData.enabled && (
                 <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                 >
                    {/* Points Accumulation */}
                    <div>
                        <label htmlFor="pointsPerKsh" className="block text-sm font-medium text-slate-700">Points Earning Rule</label>
                        <div className="mt-1 flex items-center space-x-2">
                            <span>1 point per every</span>
                            <input type="number" name="pointsPerKsh" id="pointsPerKsh" value={formData.pointsPerKsh} onChange={handleChange} className="block w-24 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            <span>KES spent</span>
                        </div>
                    </div>

                    {/* Points Redemption */}
                     <div>
                        <label htmlFor="redemptionRate" className="block text-sm font-medium text-slate-700">Points Redemption Rate</label>
                        <div className="mt-1 flex items-center space-x-2">
                             <span>100 points =</span>
                            <input type="number" name="redemptionRate" id="redemptionRate" value={formData.redemptionRate * 100} onChange={e => handleChange({ target: { name: 'redemptionRate', value: String(parseFloat(e.target.value) / 100), type: 'number' } } as any)} className="block w-24 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            <span>KES discount</span>
                        </div>
                    </div>

                    {/* Redemption Rules */}
                    <div>
                        <label htmlFor="minRedeemablePoints" className="block text-sm font-medium text-slate-700">Minimum Points to Redeem</label>
                        <input type="number" name="minRedeemablePoints" id="minRedeemablePoints" value={formData.minRedeemablePoints} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>

                    <div>
                        <label htmlFor="maxRedemptionPercentage" className="block text-sm font-medium text-slate-700">Max Redemption per Purchase (%)</label>
                        <input type="number" name="maxRedemptionPercentage" id="maxRedemptionPercentage" value={formData.maxRedemptionPercentage} onChange={handleChange} min="0" max="100" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        <p className="mt-1 text-xs text-slate-500">Maximum % of transaction that can be paid with points.</p>
                    </div>
                </motion.div>
            )}

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                 <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
                    Save Loyalty Settings
                </motion.button>
            </div>
        </form>
    );
};

export default LoyaltySettings;
