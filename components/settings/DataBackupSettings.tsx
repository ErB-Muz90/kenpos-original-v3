
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastData } from '../../types';
import ConfirmationModal from '../common/ConfirmationModal';

interface DataBackupSettingsProps {
    showToast: (message: string, type: ToastData['type']) => void;
    onBackup: () => void;
    onRestore: (data: any) => void;
}

const DataBackupSettings: React.FC<DataBackupSettingsProps> = ({ showToast, onBackup, onRestore }) => {
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/json') {
            setBackupFile(file);
            setIsRestoreModalOpen(true);
        } else if (file) {
            showToast("Invalid file type. Please select a .json backup file.", 'error');
        }
        // Reset file input to allow re-selection of the same file
        event.target.value = '';
    };
    
    const handleConfirmRestore = () => {
        if (!backupFile) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);
                onRestore(data);
            } catch (error) {
                showToast("Failed to parse backup file. It may be corrupted.", 'error');
            }
        };
        reader.readAsText(backupFile);
        
        setIsRestoreModalOpen(false);
        setBackupFile(null);
    };


    return (
        <div className="space-y-6">
            <AnimatePresence>
                {isRestoreModalOpen && backupFile && (
                    <ConfirmationModal
                        title="Restore from Backup?"
                        message={`This will overwrite ALL current data with the contents of "${backupFile.name}". This action is irreversible.`}
                        confirmText="Restore"
                        onConfirm={handleConfirmRestore}
                        onClose={() => setIsRestoreModalOpen(false)}
                        isDestructive
                    />
                )}
            </AnimatePresence>
            
            <input 
                type="file" 
                ref={importInputRef} 
                onChange={handleFileSelect} 
                accept=".json" 
                className="hidden" 
            />
            
            <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-800">System Backup & Restore</h4>
                <p className="text-sm text-slate-500 mt-1 mb-4">Download a full backup of all system data, or restore the system from a previously saved backup file.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button 
                        onClick={onBackup}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Backup File
                    </motion.button>
                     <motion.button 
                        onClick={() => importInputRef.current?.click()}
                        whileTap={{ scale: 0.95 }}
                        className="bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Restore from Backup
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default DataBackupSettings;
