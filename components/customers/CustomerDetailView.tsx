import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Customer, Sale, Settings } from '../../types';
import CustomerMeasurements from './CustomerMeasurements';

interface CustomerDetailViewProps {
    customer: Customer;
    sales: Sale[];
    onBack: () => void;
    settings: Settings;
    onUpdateCustomer: (customer: Customer) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-slate-100 p-4 rounded-lg text-center">
        <p className="text-sm text-slate-500 font-bold">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
);

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-bold rounded-t-md relative transition-colors ${
            isActive 
            ? 'text-emerald-600' 
            : 'text-slate-600 hover:text-slate-800'
        }`}
    >
        {label}
        {isActive && (
            <motion.div layoutId="customer-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
        )}
    </button>
);


const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ customer, sales, onBack, settings, onUpdateCustomer }) => {
    const [activeTab, setActiveTab] = useState<'history' | 'measurements'>('history');

    const customerStats = useMemo(() => {
        const totalSpent = sales.reduce((acc, s) => acc + s.total, 0);
        const totalOrders = sales.length;
        const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        return { totalSpent, totalOrders, avgOrderValue };
    }, [sales]);

    const formatCurrency = (amount: number) => `Ksh ${amount.toFixed(2)}`;

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
            <div className="mb-6">
                <button onClick={onBack} className="flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Back to All Customers
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start">
                    <div>
                         <h1 className="text-3xl font-bold text-slate-800">{customer.name}</h1>
                         <div className="mt-2 space-y-1 text-slate-600">
                             <p><strong>Phone:</strong> {customer.phone}</p>
                             <p><strong>Email:</strong> {customer.email}</p>
                             <p><strong>Address:</strong> {customer.address}, {customer.city}</p>
                             <p><strong>Customer Since:</strong> {new Date(customer.dateAdded).toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })}</p>
                         </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 md:mt-0 w-full md:w-auto">
                        <StatCard title="Total Spent" value={formatCurrency(customerStats.totalSpent)} />
                        <StatCard title="Total Orders" value={customerStats.totalOrders} />
                        <StatCard title="Avg. Order" value={formatCurrency(customerStats.avgOrderValue)} />
                        <div className="bg-indigo-100 p-4 rounded-lg text-center">
                            <p className="text-sm text-indigo-500 font-bold">Loyalty Points</p>
                            <p className="text-2xl font-bold text-indigo-800">{customer.loyaltyPoints}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex space-x-2 border-b border-slate-200 mb-4">
                <TabButton label="Purchase History" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                {settings.measurements.enabled && (
                    <TabButton label="Measurements" isActive={activeTab === 'measurements'} onClick={() => setActiveTab('measurements')} />
                )}
            </div>
            
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'history' ? (
                    <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 font-bold">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Receipt ID</th>
                                    <th scope="col" className="px-6 py-3">Items</th>
                                    <th scope="col" className="px-6 py-3 text-right">Total (Ksh)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map(sale => (
                                    <tr key={sale.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{new Date(sale.date).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' })}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{sale.id}</td>
                                        <td className="px-6 py-4">
                                            <ul className="list-disc list-inside">
                                                {sale.items.map(item => <li key={item.id}>{item.name} (x{item.quantity})</li>)}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-right font-bold">{sale.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {sales.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-slate-500">No purchase history found for this customer.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <CustomerMeasurements customer={customer} settings={settings} onUpdateCustomer={onUpdateCustomer} />
                )}
            </motion.div>
        </div>
    );
};

export default CustomerDetailView;