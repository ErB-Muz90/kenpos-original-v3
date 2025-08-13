import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface EmailModalProps {
    documentType: 'Receipt' | 'Quotation' | 'Proforma-Invoice' | 'SupplierInvoice' | 'PurchaseOrder';
    documentId: string;
    recipientName: string;
    defaultEmail: string;
    onSend: (email: string) => void;
    onClose: () => void;
}

const formatDocumentType = (docType: EmailModalProps['documentType']): string => {
    if (docType === 'Proforma-Invoice') return 'Proforma Invoice';
    if (docType === 'SupplierInvoice') return 'Supplier Invoice';
    if (docType === 'PurchaseOrder') return 'Purchase Order';
    return docType;
};


const EmailModal: React.FC<EmailModalProps> = ({ documentType, documentId, recipientName, defaultEmail, onSend, onClose }) => {
    const [email, setEmail] = useState(defaultEmail !== 'walkin@kenpos.co.ke' ? defaultEmail : '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple email validation
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setError('');
        onSend(email);
    };
    
    const formattedDocType = formatDocumentType(documentType);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-8"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Email {formattedDocType}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                 <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-6 space-y-1">
                    <p className="text-sm text-slate-600 dark:text-slate-300">You are emailing {formattedDocType} <span className="font-bold text-slate-800 dark:text-slate-100">{documentId}</span> to <span className="font-bold text-slate-800 dark:text-slate-100">{recipientName}</span>.</p>
                 </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Recipient's Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            placeholder="Enter email address..."
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-lg dark:text-slate-200"
                        />
                         {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                    </div>
                    
                    <div className="pt-4 flex justify-end space-x-3">
                        <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</motion.button>
                        <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Send Email
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EmailModal;