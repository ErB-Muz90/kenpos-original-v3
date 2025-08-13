
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Supplier } from '../../types';

interface SupplierModalProps {
    onClose: () => void;
    onSave: (supplier: Omit<Supplier, 'id'>) => void;
    supplier?: Supplier;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ onClose, onSave, supplier }) => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        creditTerms: 'Net 30',
    });

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name,
                contact: supplier.contact,
                email: supplier.email,
                creditTerms: supplier.creditTerms,
            });
        }
    }, [supplier]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
            >
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Supplier Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required autoFocus className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="contact" className="block text-sm font-medium text-slate-700">Contact Phone</label>
                            <input type="tel" name="contact" id="contact" value={formData.contact} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Contact Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="creditTerms" className="block text-sm font-medium text-slate-700">Credit Terms</label>
                        <select
                            name="creditTerms"
                            id="creditTerms"
                            value={formData.creditTerms}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                        >
                            <option>On Delivery</option>
                            <option>Net 15</option>
                            <option>Net 30</option>
                            <option>Net 45</option>
                            <option>Net 60</option>
                        </select>
                    </div>
                     <div className="mt-8 flex justify-end space-x-3">
                        <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Cancel</motion.button>
                        <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">Save Supplier</motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default SupplierModal;
