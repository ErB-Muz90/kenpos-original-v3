import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ToastData } from '../../types';

interface EmailSettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
    showToast: (message: string, type: ToastData['type']) => void;
}

const InputField: React.FC<{ label: string, name: string, value?: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string }> = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
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


const EmailSettings: React.FC<EmailSettingsProps> = ({ settings, onUpdateSettings, showToast }) => {
    const [formData, setFormData] = useState(settings.communication.email);
    const [testEmail, setTestEmail] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'port' ? parseInt(value, 10) || undefined : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({ 
            communication: {
                ...settings.communication,
                email: formData
            }
        });
    };
    
    const handleSendTestEmail = () => {
        if (!testEmail || !/^\S+@\S+\.\S+$/.test(testEmail)) {
            showToast('Please enter a valid email address to send a test to.', 'error');
            return;
        }
        // This simulates a backend call
        console.log("Simulating sending test email to:", testEmail, "with settings:", formData);
        showToast(`Test email has been sent to ${testEmail}. Please check your inbox.`, 'success');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <SelectField label="Email Provider (Mailer)" name="mailer" value={formData.mailer} onChange={handleChange}>
                    <option value="smtp">SMTP</option>
                    <option value="sendgrid">SendGrid (API Key)</option>
                    <option value="mailgun">Mailgun (API Key)</option>
                </SelectField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="From Name" name="fromName" value={formData.fromName} onChange={handleChange} placeholder="KenPOS Sales" />
                <InputField label="From Email Address" name="fromAddress" type="email" value={formData.fromAddress} onChange={handleChange} placeholder="sales@yourcompany.com" />
            </div>

            <AnimatePresence>
                {formData.mailer === 'smtp' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">SMTP Server Details</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="SMTP Host" name="host" value={formData.host} onChange={handleChange} placeholder="smtp.mailgun.org" />
                                    <InputField label="SMTP Port" name="port" type="number" value={formData.port} onChange={handleChange} placeholder="587" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="SMTP Username" name="username" value={formData.username} onChange={handleChange} />
                                    <InputField label="SMTP Password" name="password" type="password" value={formData.password} onChange={handleChange} />
                                </div>
                                <div>
                                    <SelectField label="Encryption" name="encryption" value={formData.encryption} onChange={handleChange}>
                                        <option value="tls">TLS</option>
                                        <option value="ssl">SSL</option>
                                        <option value="none">None</option>
                                    </SelectField>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {(formData.mailer === 'sendgrid' || formData.mailer === 'mailgun') && (
                     <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                         <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">{formData.mailer === 'sendgrid' ? 'SendGrid' : 'Mailgun'} API Details</h3>
                            <div>
                               <InputField 
                                 label="API Key" 
                                 name="password" // Reusing password field for the API key
                                 type="password" 
                                 value={formData.password} 
                                 onChange={handleChange} 
                                 placeholder={`Enter your ${formData.mailer} API Key`}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

             <div className="p-4 border-t border-slate-200 mt-6 space-y-4">
                <h4 className="font-semibold text-slate-800">Send a Test Email</h4>
                <div className="flex items-center space-x-2">
                    <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className="flex-grow block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                     <motion.button 
                        type="button" 
                        onClick={handleSendTestEmail}
                        whileTap={{ scale: 0.95 }} 
                        className="bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                        Send Test
                    </motion.button>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                 <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
                    Save Email Settings
                </motion.button>
            </div>
        </form>
    );
};

export default EmailSettings;