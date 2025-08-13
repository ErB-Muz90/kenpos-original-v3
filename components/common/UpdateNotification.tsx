import React from 'react';
import { motion } from 'framer-motion';

interface UpdateNotificationProps {
    onUpdate: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="fixed bottom-5 right-5 z-50 flex items-center w-full max-w-sm p-4 text-gray-800 bg-white dark:bg-slate-800 rounded-lg shadow-lg border dark:border-slate-700"
            role="alert"
        >
            <div className="flex-grow">
                <p className="font-bold text-slate-800 dark:text-slate-100">A new update is available!</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Refresh the app to get the latest features.</p>
            </div>
            <motion.button
                onClick={onUpdate}
                whileTap={{ scale: 0.95 }}
                className="ml-4 px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
                Refresh
            </motion.button>
        </motion.div>
    );
};

export default UpdateNotification;