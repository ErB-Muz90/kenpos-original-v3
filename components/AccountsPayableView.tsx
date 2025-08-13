import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SupplierInvoice, Supplier, SupplierPayment } from '../../types';
import PaymentModal from './accountsPayable/PaymentModal';

interface AccountsPayableViewProps {
    invoices: SupplierInvoice[];
    suppliers: Supplier[];
    onRecordPayment: (invoiceId: string, payment: Omit<SupplierPayment, 'id' | 'invoiceId'>) => void;
    onViewInvoice: (invoice: SupplierInvoice) => void;
}

const StatCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
    <motion.div 
        className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md"
        whileHover={{ y: -3, scale: 1.03, boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.05)" }}
    >
        <p className={`text-sm font-bold ${color}`}>{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
    </motion.div>
);

const StatusBadge = ({ status }: { status: SupplierInvoice['status'] }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
        case 'Paid':
            return <span className={`${baseClasses} text-green-800 bg-green-100 dark:bg-green-900/50 dark:text-green-300`}>Paid</span>;
        case 'Partially Paid':
            return <span className={`${baseClasses} text-blue-800 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300`}>Partially Paid</span>;
        case 'Unpaid':
            return <span className={`${baseClasses} text-amber-800 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300`}>Unpaid</span>;
        default:
            return <span className={`${baseClasses} text-slate-800 bg-slate-100`}>Unknown</span>;
    }
};

const AccountsPayableView = ({ invoices, suppliers, onRecordPayment, onViewInvoice }: AccountsPayableViewProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);

    const supplierMap = useMemo(() => {
        return suppliers.reduce((acc, supplier) => {
            acc[supplier.id] = supplier.name;
            return acc;
        }, {} as Record<string, string>);
    }, [suppliers]);

    const agingData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const buckets = {
            current: 0,
            due1_30: 0,
            due31_60: 0,
            due60_plus: 0,
        };

        invoices.forEach(inv => {
            if (inv.status === 'Paid') return;
            
            const amountDue = inv.totalAmount - inv.paidAmount;
            const dueDate = new Date(inv.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            if (dueDate < today) {
                const diffTime = today.getTime() - dueDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 30) buckets.due1_30 += amountDue;
                else if (diffDays <= 60) buckets.due31_60 += amountDue;
                else buckets.due60_plus += amountDue;
            } else {
                buckets.current += amountDue;
            }
        });
        return buckets;
    }, [invoices]);

    const handleRecordPaymentClick = (invoice: SupplierInvoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleSavePayment = (payment: Omit<SupplierPayment, 'id'|'invoiceId'>) => {
        if(selectedInvoice) {
            onRecordPayment(selectedInvoice.id, payment);
        }
        setIsModalOpen(false);
        setSelectedInvoice(null);
    };

    const formatCurrency = (amount: number) => `Ksh ${amount.toFixed(2)}`;

    return (
        <div className="p-4 md:p-8 space-y-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Accounts Payable</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Current" value={formatCurrency(agingData.current)} color="text-green-600" />
                <StatCard title="Overdue 1-30 Days" value={formatCurrency(agingData.due1_30)} color="text-yellow-600" />
                <StatCard title="Overdue 31-60 Days" value={formatCurrency(agingData.due31_60)} color="text-orange-600" />
                <StatCard title="Overdue 60+ Days" value={formatCurrency(agingData.due60_plus)} color="text-red-600" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700/50 font-bold">
                        <tr>
                            <th scope="col" className="px-6 py-3">Invoice #</th>
                            <th scope="col" className="px-6 py-3">Supplier</th>
                            <th scope="col" className="px-6 py-3">Due Date</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Amount Due</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(invoice => {
                            const amountDue = invoice.totalAmount - invoice.paidAmount;
                            return (
                                <tr key={invoice.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{invoice.invoiceNumber}</td>
                                    <td className="px-6 py-4">{supplierMap[invoice.supplierId] || 'Unknown'}</td>
                                    <td className="px-6 py-4">{new Date(invoice.dueDate).toLocaleDateString('en-GB', {timeZone: 'Africa/Nairobi'})}</td>
                                    <td className="px-6 py-4 font-mono">{formatCurrency(invoice.totalAmount)}</td>
                                    <td className="px-6 py-4 font-mono font-bold">{formatCurrency(amountDue)}</td>
                                    <td className="px-6 py-4"><StatusBadge status={invoice.status} /></td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button 
                                            onClick={() => onViewInvoice(invoice)}
                                            className="font-medium text-slate-600 dark:text-slate-300 hover:underline"
                                        >
                                            View
                                        </button>
                                        {invoice.status !== 'Paid' && (
                                            <button 
                                                onClick={() => handleRecordPaymentClick(invoice)}
                                                className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800"
                                            >
                                                Record Payment
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            
            <AnimatePresence>
                {isModalOpen && selectedInvoice && (
                    <PaymentModal
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSavePayment}
                        invoice={selectedInvoice}
                        supplierName={supplierMap[selectedInvoice.supplierId]}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccountsPayableView;