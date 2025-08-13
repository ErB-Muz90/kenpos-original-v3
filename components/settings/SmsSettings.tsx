import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ToastData } from '../../types';

interface SmsSettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
    showToast: (message: string, type: ToastData['type']) => void;
}

const InputField: React.FC<{ label: string, name: string, value?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string, disabled?: boolean }> = ({ label, name, value, onChange, type = 'text', placeholder = '', disabled = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm disabled:bg-slate-100"
        />
    </div>
);

const SelectField: React.FC<{ label: string, name: string, value?: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode }> = ({ label, name, value, onChange, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
        >
            {children}
        </select>
    </div>
);

const Toggle: React.FC<{ label: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, checked, onChange }) => (
     <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <label htmlFor={name} className="inline-flex relative items-center cursor-pointer">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} id={name} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
    </div>
);


const SmsSettings: React.FC<SmsSettingsProps> = ({ settings, onUpdateSettings, showToast }) => {
    const [formData, setFormData] = useState(settings.communication.sms);
    const [testRecipient, setTestRecipient] = useState('');

     useEffect(() => {
        // When sandbox mode is toggled for Africa's Talking, update the username automatically
        if (formData.provider === 'africastalking') {
            const newUsername = formData.useSandbox ? 'sandbox' : '';
            if (formData.username !== newUsername) {
                setFormData(prev => ({ ...prev, username: newUsername }));
            }
        }
    }, [formData.useSandbox, formData.provider]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({ 
            communication: {
                ...settings.communication,
                sms: formData
            }
        });
        showToast('SMS settings saved successfully!', 'success');
    };

    const handleSendTestSms = () => {
        if (!testRecipient.trim() || !/^\+?[0-9]{10,14}$/.test(testRecipient)) {
            showToast('Please enter a valid phone number to send a test to.', 'error');
            return;
        }
        console.log("Simulating sending test SMS to:", testRecipient, "with settings:", formData);
        showToast(`Test SMS has been sent to ${testRecipient}.`, 'success');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <SelectField label="SMS Provider" name="provider" value={formData.provider} onChange={handleChange}>
                    <option value="none">None (Disabled)</option>
                    <option value="africastalking">Africa's Talking</option>
                </SelectField>
            </div>

            <AnimatePresence>
                {formData.provider === 'africastalking' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 border-t border-slate-200 space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800">Africa's Talking Configuration</h3>
                            <Toggle label="Use Sandbox for Testing" name="useSandbox" checked={formData.useSandbox} onChange={handleChange} />
                            <InputField 
                                label="Username" 
                                name="username" 
                                value={formData.username} 
                                onChange={handleChange} 
                                placeholder={formData.useSandbox ? "sandbox" : "Your AT Username"}
                                disabled={formData.useSandbox}
                            />
                             <InputField 
                                label="API Key" 
                                name="apiKey" 
                                type="password"
                                value={formData.apiKey} 
                                onChange={handleChange} 
                                placeholder="Enter your API Key"
                            />
                            <InputField 
                                label="Sender ID / Shortcode" 
                                name="senderId" 
                                value={formData.senderId} 
                                onChange={handleChange} 
                                placeholder="e.g., KENPOS or 22XXX"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
             <div className="p-4 border-t border-slate-200 mt-6 space-y-4">
                <h4 className="font-semibold text-slate-800">Send a Test SMS</h4>
                <p className="text-xs text-slate-500">Note: This will use your configured provider and may incur charges.</p>
                <div className="flex items-center space-x-2">
                    <input
                        type="tel"
                        value={testRecipient}
                        onChange={(e) => setTestRecipient(e.target.value)}
                        placeholder="e.g., 0712345678"
                        className="flex-grow block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        disabled={formData.provider === 'none'}
                    />
                     <motion.button 
                        type="button" 
                        onClick={handleSendTestSms}
                        whileTap={{ scale: 0.95 }} 
                        className="bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap disabled:bg-slate-400 disabled:cursor-not-allowed"
                        disabled={formData.provider === 'none'}
                    >
                        Send Test
                    </motion.button>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                 <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
                    Save SMS Settings
                </motion.button>
            </div>
        </form>
    );
};

export default SmsSettings;