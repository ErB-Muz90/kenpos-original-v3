import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface StartShiftModalProps {
    onStartShift: (startingFloat: number) => void;
    cashierName: string;
}

const StartShiftModal: React.FC<StartShiftModalProps> = ({ onStartShift, cashierName }) => {
    const [startingFloat, setStartingFloat] = useState<number | ''>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStartShift(Number(startingFloat) || 0);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center"
            >
                <div className="mx-auto bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Start New Shift</h2>
                <p className="text-slate-500 mt-2">Welcome, <span className="font-semibold">{cashierName}</span>. Please enter your starting cash float to begin.</p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="startingFloat" className="sr-only">Starting Cash Float (KES)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold">KES</div>
                            <input
                                type="number"
                                id="startingFloat"
                                value={startingFloat}
                                onChange={(e) => setStartingFloat(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                placeholder="e.g., 5000"
                                autoFocus
                                className="block w-full text-center text-2xl font-bold pl-12 pr-4 py-3 bg-slate-100 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-emerald-700 transition-colors shadow-lg"
                    >
                        Start Shift
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default StartShiftModal;
