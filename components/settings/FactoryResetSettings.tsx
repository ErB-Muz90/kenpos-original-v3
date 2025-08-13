import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastData } from '../../types';
import ConfirmationModal from '../common/ConfirmationModal';

interface FactoryResetSettingsProps {
    showToast: (message: string, type: ToastData['type']) => void;
    onFactoryReset: () => void;
}

const FactoryResetSettings: React.FC<FactoryResetSettingsProps> = ({ showToast, onFactoryReset }) => {
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);

    const handleResetDemoData = () => {
        setIsResetModalOpen(false);
        showToast("This feature is for demonstration and would reset data in a real app.", 'info');
        // In a real app, this would trigger a backend API call.
    };
    
    const handleWipeSystem = () => {
        setIsWipeModalOpen(false);
        onFactoryReset();
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {isResetModalOpen && (
                    <ConfirmationModal
                        title="Reset Demo Data?"
                        message="This will reset all products, sales, and other data back to the original demo state. This action cannot be undone."
                        confirmText="Reset"
                        onConfirm={handleResetDemoData}
                        onClose={() => setIsResetModalOpen(false)}
                    />
                )}
                 {isWipeModalOpen && (
                    <ConfirmationModal
                        title="Wipe All System Data?"
                        message="This is a highly destructive action. It will permanently delete ALL data, including sales, products, and settings. The system will be returned to a clean, factory-default state. Please type 'WIPE' to confirm."
                        confirmText="WIPE"
                        onConfirm={handleWipeSystem}
                        onClose={() => setIsWipeModalOpen(false)}
                        isDestructive
                    />
                )}
            </AnimatePresence>

            <div className="p-4 border border-amber-300 bg-amber-50 rounded-lg">
                <h4 className="font-semibold text-amber-800">Reset Demo Data</h4>
                <p className="text-sm text-amber-700 mt-1 mb-4">
                    Restores the application to its initial state with default products and sales data. Useful for demonstration purposes.
                </p>
                <motion.button 
                    onClick={() => setIsResetModalOpen(true)}
                    whileTap={{ scale: 0.95 }}
                    className="bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
                >
                    Reset Demo Data
                </motion.button>
            </div>
            
            <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-800">Factory Reset</h4>
                <p className="text-sm text-red-700 mt-1 mb-4">
                    Permanently deletes all data in the system. This includes all sales, inventory, customers, and settings. This action cannot be undone.
                </p>
                <motion.button 
                    onClick={() => setIsWipeModalOpen(true)}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                    Wipe System Data
                </motion.button>
            </div>
        </div>
    );
};

export default FactoryResetSettings;