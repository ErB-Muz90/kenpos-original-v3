import React, { useState } from 'react';
import { Customer, Settings } from '../../types';
import { motion } from 'framer-motion';

interface CustomerMeasurementsProps {
    customer: Customer;
    settings: Settings;
    onUpdateCustomer: (customer: Customer) => void;
}

const CustomerMeasurements: React.FC<CustomerMeasurementsProps> = ({ customer, settings, onUpdateCustomer }) => {
    const [measurements, setMeasurements] = useState(customer.measurements || {});
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    const handleTemplateSelect = (templateName: string) => {
        if (!templateName) return;
        const template = settings.measurements.templates.find(t => t.name === templateName);
        if (template) {
            const newMeasurementsFromTemplate = template.fields.reduce((acc, field) => {
                if (!measurements.hasOwnProperty(field)) {
                    acc[field] = '';
                }
                return acc;
            }, {} as {[key: string]: string});
            
            const newMeasurements = { ...measurements, ...newMeasurementsFromTemplate };
            setMeasurements(newMeasurements);
            setHasChanges(true);
        }
    };
    
    const handleMeasurementChange = (field: string, value: string) => {
        setMeasurements(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleAddNewField = () => {
        if(newFieldName && !measurements.hasOwnProperty(newFieldName)) {
            setMeasurements(prev => ({ ...prev, [newFieldName]: newFieldValue }));
            setNewFieldName('');
            setNewFieldValue('');
            setHasChanges(true);
        }
    };

    const handleRemoveField = (field: string) => {
        const { [field]: _, ...rest } = measurements;
        setMeasurements(rest);
        setHasChanges(true);
    };

    const handleSaveChanges = () => {
        onUpdateCustomer({ ...customer, measurements });
        setHasChanges(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Customer Measurements</h3>
                 {hasChanges && (
                    <motion.button 
                        onClick={handleSaveChanges} 
                        className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
                        whileTap={{ scale: 0.95 }}
                    >
                        Save Changes
                    </motion.button>
                )}
            </div>
            
            <div className="flex gap-2">
                <select 
                    onChange={e => handleTemplateSelect(e.target.value)}
                    className="flex-grow block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                >
                    <option value="">-- Apply a Template --</option>
                    {settings.measurements.templates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(measurements).sort().map((field) => (
                    <div key={field} className="relative group">
                        <label className="block text-sm font-medium text-slate-700">{field}</label>
                        <input
                            type="text"
                            value={measurements[field]}
                            onChange={e => handleMeasurementChange(field, e.target.value)}
                            placeholder={`Enter ${field}...`}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        />
                         <button onClick={() => handleRemoveField(field)} className="absolute top-0 right-0 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t space-y-2">
                <h4 className="font-semibold text-slate-700">Add Custom Field</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <input value={newFieldName} onChange={e => setNewFieldName(e.target.value)} placeholder="Field Name (e.g., Shoulder)" className="md:col-span-1 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
                    <input value={newFieldValue} onChange={e => setNewFieldValue(e.target.value)} placeholder="Value (e.g., 18 in)" className="md:col-span-1 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
                    <motion.button onClick={handleAddNewField} whileTap={{scale: 0.95}} className="bg-slate-600 text-white font-semibold py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors">Add Field</motion.button>
                </div>
            </div>
        </div>
    );
};

export default CustomerMeasurements;
