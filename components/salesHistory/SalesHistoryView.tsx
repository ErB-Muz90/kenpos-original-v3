import React, { useState, useMemo } from 'react';
import { Sale, Customer, User } from '../../types';

interface SalesHistoryViewProps {
    sales: Sale[];
    customers: Customer[];
    users: User[];
    onViewSaleRequest: (sale: Sale) => void;
}

const ITEMS_PER_PAGE = 15;

const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ sales, customers, users, onViewSaleRequest }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);

    const filteredSales = useMemo(() => {
        const start = dateFrom ? new Date(dateFrom) : null;
        if(start) start.setHours(0,0,0,0);
        
        const end = dateTo ? new Date(dateTo) : null;
        if(end) end.setHours(23,59,59,999);
        
        return sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                if (start && saleDate < start) return false;
                if (end && saleDate > end) return false;
                return true;
            })
            .filter(sale => {
                const customerName = customerMap.get(sale.customerId) || '';
                const searchTermLower = searchTerm.toLowerCase();
                return (
                    sale.id.toLowerCase().includes(searchTermLower) ||
                    customerName.toLowerCase().includes(searchTermLower) ||
                    sale.cashierName.toLowerCase().includes(searchTermLower)
                );
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, searchTerm, dateFrom, dateTo, customerMap]);
    
    const paginatedSales = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredSales, currentPage]);

    const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
    
    const summary = useMemo(() => {
        return {
            totalRevenue: filteredSales.reduce((acc, s) => acc + s.total, 0),
            transactionCount: filteredSales.length,
        };
    }, [filteredSales]);

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Sales History</h1>
            
            <div className="my-6 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <input
                        type="text"
                        placeholder="Search by ID, Customer, Cashier..."
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200" />
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Total Revenue</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Ksh {summary.totalRevenue.toFixed(2)}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Transactions</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.transactionCount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                     <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700/50 font-bold">
                        <tr>
                            <th scope="col" className="px-6 py-3">Receipt ID</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Cashier</th>
                            <th scope="col" className="px-6 py-3 text-right">Total (Ksh)</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSales.map(sale => (
                            <tr key={sale.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer" onClick={() => onViewSaleRequest(sale)}>
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 font-mono text-xs">
                                    {sale.id}
                                    {!sale.synced && <span className="ml-2 text-xs font-semibold text-amber-800 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-0.5 rounded-full">Queued</span>}
                                </td>
                                <td className="px-6 py-4">{new Date(sale.date).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' })}</td>
                                <td className="px-6 py-4">{customerMap.get(sale.customerId) || 'Unknown'}</td>
                                <td className="px-6 py-4">{sale.cashierName}</td>
                                <td className="px-6 py-4 text-right font-mono font-semibold">{sale.total.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                     <button className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 text-sm">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">Previous</button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesHistoryView;