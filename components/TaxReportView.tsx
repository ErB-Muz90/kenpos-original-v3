import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sale, SupplierInvoice, Settings } from '../types';

interface TaxReportViewProps {
    sales: Sale[];
    supplierInvoices: SupplierInvoice[];
    settings: Settings;
}

type Tab = 'SalesVAT' | 'InputVAT';

const aggregateDataByMonth = (items: any[], dateField: string, valueFields: { key: string, label: string }[]) => {
    const monthlyData: { [key: string]: { month: string, [key: string]: any } } = {};

    items.forEach(item => {
        const date = new Date(item[dateField]);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { 
                month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
            };
            valueFields.forEach(field => monthlyData[monthKey][field.key] = 0);
        }

        valueFields.forEach(field => {
            // Special handling for taxable amount which is derived, not a direct field on sales
            if (field.key === 'taxableAmount') {
                 monthlyData[monthKey][field.key] += (item.subtotal - item.discountAmount);
            } else {
                monthlyData[monthKey][field.key] += item[field.key];
            }
        });
    });

    return Object.values(monthlyData).sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
};

const exportToCSV = (data: any[], headers: { key: string, label: string }[], filename: string) => {
    const csvRows = [
        headers.map(h => h.label).join(','), // header row
        ...data.map(row => 
            headers.map(header => {
                const value = row[header.key];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const TaxReportView = ({ sales, supplierInvoices, settings }: TaxReportViewProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('SalesVAT');

    const salesVatHeaders = [
        { key: 'month', label: 'Month' },
        { key: 'taxableAmount', label: `Taxable Sales (Ksh)` },
        { key: 'tax', label: `VAT Payable (${settings.tax.vatRate}%) (Ksh)` },
        { key: 'total', label: 'Gross Sales (Ksh)' },
    ];
    
    const inputVatHeaders = [
        { key: 'month', label: 'Month' },
        { key: 'subtotal', label: 'Net Purchases (Ksh)' },
        { key: 'taxAmount', label: `VAT Input (${settings.tax.vatRate}%) (Ksh)` },
        { key: 'totalAmount', label: 'Gross Purchases (Ksh)' },
    ];

    const salesVatData = useMemo(() => aggregateDataByMonth(sales, 'date', [
        { key: 'taxableAmount', label: '' },
        { key: 'tax', label: '' },
        { key: 'total', label: '' }
    ]), [sales]);

    const inputVatData = useMemo(() => aggregateDataByMonth(supplierInvoices, 'invoiceDate', [
        { key: 'subtotal', label: '' },
        { key: 'taxAmount', label: '' },
        { key: 'totalAmount', label: '' }
    ]), [supplierInvoices]);
    
    const formatCurrency = (amount: number) => amount.toFixed(2);
    
    const TabButton = ({ tab, label }: { tab: Tab, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold rounded-t-md relative transition-colors ${
                activeTab === tab 
                ? 'text-emerald-600' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
        >
            {label}
            {activeTab === tab && (
                <motion.div layoutId="tax-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
        </button>
    );

    const renderTable = (headers: {key:string, label:string}[], data: any[], exportFilename: string) => (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
             <div className="p-4 flex justify-end">
                <button 
                    onClick={() => exportToCSV(data, headers, exportFilename)}
                    className="bg-slate-700 text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-md flex items-center text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export to CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 font-bold">
                        <tr>
                            {headers.map(h => <th key={h.key} scope="col" className="px-6 py-3">{h.label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map(row => (
                                <tr key={row.month} className="bg-white border-b hover:bg-slate-50">
                                    {headers.map(h => (
                                        <td key={h.key} className={`px-6 py-4 ${h.key !== 'month' ? 'font-mono' : 'font-bold text-slate-900'}`}>
                                            {typeof row[h.key] === 'number' ? formatCurrency(row[h.key]) : row[h.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="text-center py-10 text-slate-500">
                                    No data available for this period.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-800">Tax Reports</h1>
            <div className="flex space-x-2 border-b border-slate-200">
                <TabButton tab="SalesVAT" label="VAT on Sales (Payable)" />
                <TabButton tab="InputVAT" label="VAT on Purchases (Input)" />
            </div>
            <div>
                {activeTab === 'SalesVAT' && renderTable(salesVatHeaders, salesVatData, 'vat-on-sales.csv')}
                {activeTab === 'InputVAT' && renderTable(inputVatHeaders, inputVatData, 'vat-input.csv')}
            </div>
        </div>
    );
};

export default TaxReportView;