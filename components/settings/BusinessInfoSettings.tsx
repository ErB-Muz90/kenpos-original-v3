import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ToastData } from '../../types';

interface BusinessInfoSettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
    showToast: (message: string, type: ToastData['type']) => void;
    isSetupWizard?: boolean;
    onWizardNext?: () => void;
}

const BusinessInfoSettings: React.FC<BusinessInfoSettingsProps> = ({ settings, onUpdateSettings, showToast, isSetupWizard = false, onWizardNext }) => {
    const [formData, setFormData] = useState(settings.businessInfo);
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.businessInfo.logoUrl);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
                // In a real app, you would upload this file and get back a URL
                showToast("Logo preview updated. Save to persist.", 'info');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({ businessInfo: { ...formData, logoUrl: logoPreview || '' } });
        if(onWizardNext) {
            onWizardNext();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Company Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="kraPin" className="block text-sm font-medium text-slate-700">KRA PIN</label>
                        <input type="text" name="kraPin" id="kraPin" value={formData.kraPin} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700">Business Location</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Business Phone</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700">Business Logo</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                             {logoPreview ? (
                                <img src={logoPreview} alt="Logo preview" className="mx-auto h-24 w-24 object-contain rounded-md" />
                            ) : (
                                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                            <div className="flex text-sm text-slate-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/*" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`flex justify-end pt-6 ${!isSetupWizard && 'border-t border-slate-200 mt-6'}`}>
                 <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
                    {isSetupWizard ? 'Save & Continue' : 'Save Business Info'}
                </motion.button>
            </div>
        </form>
    );
};

export default BusinessInfoSettings;