import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmText?: string;
    isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    title,
    message,
    onConfirm,
    onClose,
    confirmText,
    isDestructive = false
}) => {
    const [inputValue, setInputValue] = useState('');
    const isConfirmed = confirmText ? inputValue === confirmText : true;

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
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6"
            >
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
                
                {confirmText && (
                    <div className="mt-4">
                        <label htmlFor="confirm-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            To confirm, please type "<span className="font-bold">{confirmText}</span>"
                        </label>
                        <input
                            type="text"
                            id="confirm-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                    </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                    <motion.button 
                        onClick={onClose} 
                        whileTap={{ scale: 0.95 }} 
                        className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                        Cancel
                    </motion.button>
                     <motion.button 
                        onClick={onConfirm} 
                        disabled={!isConfirmed}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-md transition-colors ${
                            isDestructive 
                            ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300' 
                            : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300'
                        } disabled:cursor-not-allowed`}
                    >
                        {confirmText || 'Confirm'}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConfirmationModal;