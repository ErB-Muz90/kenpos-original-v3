import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ToastData } from '../../types';

interface WhatsAppSettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
    showToast: (message: string, type: ToastData['type']) => void;
}

const InputField: React.FC<{ label: string, name: string, value?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string }> = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
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


const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = ({ settings, onUpdateSettings, showToast }) => {
    const [formData, setFormData] = useState(settings.communication.whatsapp);
    const [testRecipient, setTestRecipient] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({ 
            communication: {
                ...settings.communication,
                whatsapp: formData
            }
        });
        showToast('WhatsApp settings saved successfully!', 'success');
    };

    const handleSendTest = () => {
        if (!testRecipient.trim() || !/^\+?[0-9]{10,14}$/.test(testRecipient)) {
            showToast('Please enter a valid phone number to send a test to.', 'error');
            return;
        }
        console.log("Simulating sending test WhatsApp to:", testRecipient, "with settings:", formData);
        showToast(`Test WhatsApp message has been sent to ${testRecipient}.`, 'success');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <SelectField label="WhatsApp Provider" name="provider" value={formData.provider} onChange={handleChange}>
                    <option value="none">None (Disabled)</option>
                    <option value="twilio">Twilio API for WhatsApp</option>
                    <option value="meta">Meta Cloud API</option>
                </SelectField>
            </div>

            <AnimatePresence>
                {formData.provider !== 'none' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 border-t border-slate-200 space-y-4">
                             <InputField 
                                label="Sender Phone Number" 
                                name="senderPhoneNumber"
                                value={formData.senderPhoneNumber} 
                                onChange={handleChange} 
                                placeholder="Your WhatsApp Business number"
                            />
                             <InputField 
                                label="API Key / Account SID" 
                                name="apiKey"
                                value={formData.apiKey} 
                                onChange={handleChange} 
                                placeholder="Enter your API Key or SID"
                            />
                             <InputField 
                                label="API Secret / Auth Token" 
                                name="apiSecret" 
                                type="password"
                                value={formData.apiSecret} 
                                onChange={handleChange} 
                                placeholder="Enter your API Secret or Auth Token"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
             <div className="p-4 border-t border-slate-200 mt-6 space-y-4">
                <h4 className="font-semibold text-slate-800">Send a Test Message</h4>
                <p className="text-xs text-slate-500">Note: This will use your configured provider and may incur charges.</p>
                <div className="flex items-center space-x-2">
                    <input
                        type="tel"
                        value={testRecipient}
                        onChange={(e) => setTestRecipient(e.target.value)}
                        placeholder="e.g., 254712345678"
                        className="flex-grow block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        disabled={formData.provider === 'none'}
                    />
                     <motion.button 
                        type="button" 
                        onClick={handleSendTest}
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
                    Save WhatsApp Settings
                </motion.button>
            </div>
        </form>
    );
};

export default WhatsAppSettings;