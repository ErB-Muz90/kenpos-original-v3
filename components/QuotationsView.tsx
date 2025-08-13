import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Quotation, Permission, Sale } from '../types';

interface QuotationsViewProps {
    quotations: Quotation[];
    sales: Sale[];
    onSelectQuotation: (quotation: Quotation) => void;
    onCreateQuoteRequest: () => void;
    permissions: Permission[];
}

type DisplayStatus = Quotation['status'] | 'Paid';

const StatusBadge: React.FC<{ status: DisplayStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
        case 'Paid':
            return <span className={`${baseClasses} text-purple-800 bg-purple-100`}>Paid</span>;
        case 'Sent':
            return <span className={`${baseClasses} text-blue-800 bg-blue-100`}>Sent</span>;
        case 'Draft':
            return <span className={`${baseClasses} text-yellow-800 bg-yellow-100`}>Draft</span>;
        case 'Invoiced':
            return <span className={`${baseClasses} text-green-800 bg-green-100`}>Invoiced</span>;
        case 'Expired':
            return <span className={`${baseClasses} text-red-800 bg-red-100`}>Expired</span>;
        default:
            return <span className={`${baseClasses} text-slate-800 bg-slate-100`}>Unknown</span>;
    }
};

const QuotationsView: React.FC<QuotationsViewProps> = ({ quotations, sales, onSelectQuotation, onCreateQuoteRequest, permissions }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const canManage = permissions.includes('manage_quotations');

    const salesByQuotationId = useMemo(() => {
        const map = new Map<string, Sale>();
        sales.forEach(s => {
            if (s.quotationId) {
                map.set(s.quotationId, s);
            }
        });
        return map;
    }, [sales]);

    const filteredQuotations = useMemo(() => {
        return quotations.filter(q => 
            q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [quotations, searchTerm]);

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Quotations</h1>
                {canManage && (
                    <motion.button 
                        onClick={onCreateQuoteRequest}
                        whileTap={{ scale: 0.95 }}
                        className="bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Create New Quote
                    </motion.button>
                )}
            </div>

            <div className="mb-4">
                 <input
                    type="text"
                    placeholder="Search quotations by number or customer..."
                    className="w-full max-w-sm px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Quote #</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Expires</th>
                            <th scope="col" className="px-6 py-3 text-right">Total (Ksh)</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuotations.map(quote => {
                            const displayedStatus: DisplayStatus = salesByQuotationId.has(quote.id) ? 'Paid' : quote.status;
                            return (
                                <tr key={quote.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => onSelectQuotation(quote)}>
                                    <td className="px-6 py-4 font-bold text-slate-900">{quote.quoteNumber}</td>
                                    <td className="px-6 py-4">{quote.customerName}</td>
                                    <td className="px-6 py-4"><StatusBadge status={displayedStatus} /></td>
                                    <td className="px-6 py-4">{new Date(quote.createdDate).toLocaleDateString('en-GB', {timeZone: 'Africa/Nairobi'})}</td>
                                    <td className="px-6 py-4">{new Date(quote.expiryDate).toLocaleDateString('en-GB', {timeZone: 'Africa/Nairobi'})}</td>
                                    <td className="px-6 py-4 text-right font-mono">{quote.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onSelectQuotation(quote); }}
                                            className="font-medium text-emerald-600 hover:underline"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuotationsView;