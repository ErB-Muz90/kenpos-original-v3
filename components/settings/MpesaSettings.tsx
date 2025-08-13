import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ToastData } from '../../types';

interface MpesaSettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
    showToast: (message: string, type: ToastData['type']) => void;
}

const InputField: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string }> = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
        />
    </div>
);

const MpesaSettings: React.FC<MpesaSettingsProps> = ({ settings, onUpdateSettings, showToast }) => {
    const [formData, setFormData] = useState(settings.communication.mpesa);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        if (name === 'environment') {
            setFormData(prev => ({ ...prev, [name]: value as 'sandbox' | 'production' }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({ 
            communication: {
                ...settings.communication,
                mpesa: formData
            }
        });
        showToast('M-Pesa settings saved successfully!', 'success');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border border-amber-300 bg-amber-50 rounded-lg">
                <h4 className="font-semibold text-amber-800">Security Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                    This is a frontend-only application. Storing API credentials here is not secure and is for demonstration purposes only. In a production environment, these keys must be stored on a secure backend server.
                </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Enable M-Pesa Payments</span>
                <label htmlFor="mpesa-enabled-toggle" className="inline-flex relative items-center cursor-pointer">
                    <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleChange} id="mpesa-enabled-toggle" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
            </div>
            
            {formData.enabled && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Environment</label>
                        <div className="mt-2 flex space-x-4">
                             <label className="flex items-center">
                                <input type="radio" name="environment" value="sandbox" checked={formData.environment === 'sandbox'} onChange={handleChange} className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-slate-300" />
                                <span className="ml-2 text-sm text-slate-700">Sandbox (Testing)</span>
                            </label>
                             <label className="flex items-center">
                                <input type="radio" name="environment" value="production" checked={formData.environment === 'production'} onChange={handleChange} className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-slate-300" />
                                <span className="ml-2 text-sm text-slate-700">Production (Live)</span>
                            </label>
                        </div>
                    </div>
                    <InputField label="Business Shortcode" name="shortcode" value={formData.shortcode} onChange={handleChange} />
                    <InputField label="Consumer Key" name="consumerKey" value={formData.consumerKey} onChange={handleChange} type="password" />
                    <InputField label="Consumer Secret" name="consumerSecret" value={formData.consumerSecret} onChange={handleChange} type="password" />
                    <InputField label="Passkey" name="passkey" value={formData.passkey} onChange={handleChange} type="password" />
                    <InputField label="Callback URL" name="callbackUrl" value={formData.callbackUrl} onChange={handleChange} placeholder="https://your-backend.com/mpesa/callback" />
                </motion.div>
            )}

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                 <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
                    Save M-Pesa Settings
                </motion.button>
            </div>
        </form>
    );
};

export default MpesaSettings;
