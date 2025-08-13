import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SupplierInvoice, SupplierPayment } from '../../types';

interface PaymentModalProps {
    onClose: () => void;
    onSave: (payment: Omit<SupplierPayment, 'id' | 'invoiceId'>) => void;
    invoice: SupplierInvoice;
    supplierName: string;
}

const PaymentModal = ({ onClose, onSave, invoice, supplierName }: PaymentModalProps) => {
    const amountDue = invoice.totalAmount - invoice.paidAmount;
    const [amount, setAmount] = useState<number | ''>(amountDue);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<SupplierPayment['method']>('Bank Transfer');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof amount !== 'number' || amount <= 0 || amount > amountDue) {
            alert(`Payment amount must be between 0 and ${amountDue.toFixed(2)}.`);
            return;
        }
        onSave({
            amount: amount,
            paymentDate: new Date(paymentDate),
            method,
        });
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
                    <h2 className="text-2xl font-bold text-slate-800">Record Payment</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-600">Invoice:</span>
                        <span className="font-semibold text-slate-800">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-600">Supplier:</span>
                        <span className="font-semibold text-slate-800">{supplierName}</span>
                    </div>
                    <div className="border-t border-slate-200 !my-2"></div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-mono text-slate-800">Ksh {invoice.subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tax (VAT):</span>
                        <span className="font-mono text-slate-800">Ksh {invoice.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-700">Invoice Total:</span>
                        <span className="font-mono text-slate-800">Ksh {invoice.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-dashed border-slate-300 !my-2"></div>
                     <div className="flex justify-between text-lg">
                        <span className="font-bold text-slate-600">Amount Due:</span>
                        <span className="font-bold text-red-600">Ksh {amountDue.toFixed(2)}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Payment Amount (Ksh)</label>
                        <input
                            type="number"
                            name="amount"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            required
                            max={amountDue}
                            min="0.01"
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-lg"
                        />
                    </div>
                     <div>
                        <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-700">Payment Date</label>
                        <input
                            type="date"
                            name="paymentDate"
                            id="paymentDate"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="method" className="block text-sm font-medium text-slate-700">Payment Method</label>
                        <select
                            name="method"
                            id="method"
                            value={method}
                            onChange={(e) => setMethod(e.target.value as SupplierPayment['method'])}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                        >
                            <option>Bank Transfer</option>
                            <option>Cash</option>
                            <option>M-Pesa</option>
                        </select>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Cancel</motion.button>
                        <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">Confirm Payment</motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default PaymentModal;