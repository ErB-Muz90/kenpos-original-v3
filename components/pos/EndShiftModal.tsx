
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shift, Sale, Payment } from '../../types';

interface EndShiftModalProps {
    activeShift: Shift;
    sales: Sale[];
    onConfirmEndShift: (actualCashInDrawer: number) => void;
    onCancel: () => void;
}

const ReconciliationRow: React.FC<{ label: string; value: number; isNegative?: boolean; isBold?: boolean }> = ({ label, value, isNegative, isBold }) => (
    <div className={`flex justify-between items-center py-2 ${isBold ? 'font-bold' : ''}`}>
        <span className="text-foreground/70 dark:text-dark-foreground/70">{label}</span>
        <span className={`font-mono ${isNegative ? 'text-danger' : 'text-foreground dark:text-dark-foreground'}`}>
            {isNegative ? '-' : ''}Ksh {Math.abs(value).toFixed(2)}
        </span>
    </div>
);

const EndShiftModal: React.FC<EndShiftModalProps> = ({ activeShift, sales, onConfirmEndShift, onCancel }) => {
    const [actualCash, setActualCash] = useState<number | ''>('');

    const shiftData = useMemo(() => {
        const shiftSales = sales.filter(s => activeShift.salesIds.includes(s.id));
        const paymentBreakdown: { [key in Payment['method']]?: number } = {};
        let cashChange = 0;

        shiftSales.forEach(sale => {
            sale.payments.forEach(p => {
                paymentBreakdown[p.method] = (paymentBreakdown[p.method] || 0) + p.amount;
            });
            cashChange += sale.change;
        });

        const expectedCash = activeShift.startingFloat + (paymentBreakdown['Cash'] || 0) - cashChange;
        
        return { breakdown: paymentBreakdown, expectedCash, cashChange, cashSales: paymentBreakdown['Cash'] || 0 };
    }, [activeShift, sales]);

    const variance = useMemo(() => {
        if (actualCash === '') return 0;
        const v = Number(actualCash) - shiftData.expectedCash;
        // Round to 2 decimal places to avoid floating point issues and handle -0
        return Number(v.toFixed(2));
    }, [actualCash, shiftData.expectedCash]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirmEndShift(Number(actualCash) || 0);
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
                className="bg-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg p-8"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-foreground dark:text-dark-foreground">End Shift & Reconcile</h2>
                    <button onClick={onCancel} className="text-foreground/60 hover:text-foreground dark:text-dark-foreground/60 dark:hover:text-dark-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="bg-background dark:bg-dark-background/50 p-4 rounded-lg space-y-1 text-sm">
                    <h3 className="font-bold text-foreground dark:text-dark-foreground mb-2">Cash Reconciliation</h3>
                    <ReconciliationRow label="Starting Float" value={activeShift.startingFloat} />
                    <ReconciliationRow label="Cash Sales" value={shiftData.cashSales} />
                    <ReconciliationRow label="Change Given" value={shiftData.cashChange} isNegative />
                    <div className="border-t border-border dark:border-dark-border !my-2"></div>
                    <ReconciliationRow label="Expected in Drawer" value={shiftData.expectedCash} isBold />
                </div>
                
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="actualCash" className="block text-sm font-medium text-foreground/80 dark:text-dark-foreground/80">Actual Counted Cash in Drawer</label>
                         <input
                            type="number"
                            id="actualCash"
                            value={actualCash}
                            onChange={(e) => setActualCash(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            placeholder="Enter counted amount"
                            required
                            autoFocus
                            className="mt-1 block w-full text-lg font-bold p-3 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {actualCash !== '' && (
                        <div className={`p-4 rounded-lg font-bold text-center text-lg
                            ${variance === 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'}`}>
                            {variance === 0 && 'Drawer is Balanced'}
                            {variance > 0 && `Overage: Ksh ${variance.toFixed(2)}`}
                            {variance < 0 && `Shortage: Ksh ${Math.abs(variance).toFixed(2)}`}
                        </div>
                    )}
                    
                    <div className="pt-4 flex justify-end space-x-3">
                         <motion.button type="button" onClick={onCancel} whileTap={{ scale: 0.95 }} className="bg-background dark:bg-dark-border text-foreground dark:text-dark-foreground font-semibold px-4 py-2 rounded-lg hover:bg-border dark:hover:bg-dark-border/50 transition-colors">Cancel</motion.button>
                        <motion.button
                            type="submit"
                            whileTap={{ scale: 0.98 }}
                            disabled={actualCash === ''}
                            className="bg-primary dark:bg-dark-primary text-white font-bold py-2 px-6 rounded-lg text-lg hover:bg-accent dark:hover:bg-dark-accent transition-colors shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            Finalize Shift
                        </motion.button>
                    </div>
                </form>

            </motion.div>
        </motion.div>
    );
};

export default EndShiftModal;
