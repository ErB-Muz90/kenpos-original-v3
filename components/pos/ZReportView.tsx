

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Shift, Sale, Settings } from '../../types';
import { getPriceBreakdown } from '../../utils/vatCalculator';

interface ZReportViewProps {
    shift: Shift;
    sales: Sale[];
    onClose: () => void;
    settings: Settings;
    isHistoricalView?: boolean;
}

const StatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => (
    <div className={`bg-background dark:bg-dark-card/50 p-4 rounded-lg ${className}`}>
        <p className="text-sm text-foreground/70 dark:text-dark-foreground/70 font-medium">{title}</p>
        <p className="text-xl font-bold text-foreground dark:text-dark-foreground">{value}</p>
    </div>
);

const ZReportView: React.FC<ZReportViewProps> = ({ shift, sales: allSales, onClose, settings, isHistoricalView = false }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const shiftSales = allSales.filter(s => shift.salesIds.includes(s.id));

    const totalProfit = shiftSales.reduce((total, sale) => {
        const saleProfit = sale.items.reduce((itemTotal, item) => {
            const { basePrice } = getPriceBreakdown(item.price, item.pricingType, settings.tax.vatRate / 100);
            const itemRevenue = basePrice * item.quantity;
            const itemCost = (item.costPrice || 0) * item.quantity;
            return itemTotal + (itemRevenue - itemCost);
        }, 0);
        const profitAfterDiscount = saleProfit - sale.discountAmount;
        return total + profitAfterDiscount;
    }, 0);

    const handlePrint = () => {
        window.print();
    };
    
    const handleDownloadPDF = async () => {
        if (!reportRef.current || isDownloading) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`ZReport_${shift.id}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Sorry, there was an error generating the PDF.");
        } finally {
            setIsDownloading(false);
        }
    };
    
    const formatCurrency = (amount: number) => `Ksh ${amount.toFixed(2)}`;
    const variance = shift.cashVariance || 0;
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background dark:bg-dark-background z-40 p-4 md:p-8 overflow-y-auto"
        >
            <div className="max-w-4xl mx-auto">
                <div id="shift-report-container" ref={reportRef} className="bg-card dark:bg-dark-card p-6 md:p-8 rounded-xl shadow-lg space-y-6">
                    <div className="text-center border-b dark:border-dark-border pb-4">
                        <h2 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Z-Report (Shift Summary)</h2>
                        <p className="text-foreground/70 dark:text-dark-foreground/70">
                            For: <span className="font-semibold">{shift.userName}</span> | 
                            Shift ID: <span className="font-mono text-xs">{shift.id}</span>
                        </p>
                        <p className="text-sm text-foreground/70 dark:text-dark-foreground/70">
                            {new Date(shift.startTime).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' })} - {shift.endTime ? new Date(shift.endTime).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) : 'Active'}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard title="Total Sales" value={formatCurrency(shift.totalSales || 0)} />
                        <StatCard title="Total Profit" value={formatCurrency(totalProfit)} />
                        <StatCard title="Transactions" value={String(shift.salesIds.length)} />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-foreground dark:text-dark-foreground mb-2">Shift Reconciliation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-1 bg-background dark:bg-dark-background/50 p-4 rounded-lg text-sm">
                                <p className="font-bold text-foreground dark:text-dark-foreground/90 mb-2">Total Collections by Type</p>
                                {Object.entries(shift.paymentBreakdown || {}).map(([method, amount]) => (
                                    <div key={method} className="flex justify-between">
                                        <span className="text-foreground/80 dark:text-dark-foreground/80">{method}</span>
                                        <span className="font-mono font-semibold text-foreground dark:text-dark-foreground">{formatCurrency(amount || 0)}</span>
                                    </div>
                                ))}
                                {!shift.paymentBreakdown || Object.keys(shift.paymentBreakdown).length === 0 && <p className="text-foreground/60 dark:text-dark-foreground/60">No payments recorded.</p>}
                            </div>
                            <div className="space-y-1 bg-background dark:bg-dark-background/50 p-4 rounded-lg text-sm">
                                <p className="font-bold text-foreground dark:text-dark-foreground/90 mb-2">Cash Drawer Reconciliation</p>
                                <div className="flex justify-between"><span className="text-foreground/80 dark:text-dark-foreground/80">Starting Float</span><span className="font-mono text-foreground dark:text-dark-foreground">{formatCurrency(shift.startingFloat)}</span></div>
                                <div className="flex justify-between"><span className="text-foreground/80 dark:text-dark-foreground/80">+ Cash Sales</span><span className="font-mono text-foreground dark:text-dark-foreground">{formatCurrency(shift.paymentBreakdown?.Cash || 0)}</span></div>
                                <div className="flex justify-between text-danger"><span className="dark:text-danger">- Change Given</span><span className="font-mono">{formatCurrency((shift.paymentBreakdown?.Cash || 0) - (shift.expectedCashInDrawer || 0) + shift.startingFloat)}</span></div>
                                <div className="flex justify-between font-bold border-t dark:border-dark-border pt-1 mt-1"><span className="text-foreground dark:text-dark-foreground">Expected in Drawer</span><span className="font-mono text-foreground dark:text-dark-foreground">{formatCurrency(shift.expectedCashInDrawer || 0)}</span></div>
                                <div className="flex justify-between"><span className="text-foreground/80 dark:text-dark-foreground/80">Actual in Drawer</span><span className="font-mono text-foreground dark:text-dark-foreground">{formatCurrency(shift.actualCashInDrawer || 0)}</span></div>
                                 <div className={`flex justify-between font-bold text-lg border-t dark:border-dark-border pt-1 mt-1 ${variance === 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                    <span>Variance</span>
                                    <span className="font-mono">{formatCurrency(variance)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                         <h3 className="text-lg font-semibold text-foreground dark:text-dark-foreground mb-2">Items Sold</h3>
                         <div className="overflow-x-auto rounded-lg border dark:border-dark-border max-h-60">
                            <table className="w-full text-sm text-left text-foreground/80 dark:text-dark-foreground/80">
                                <thead className="text-xs text-foreground/90 dark:text-dark-foreground/90 uppercase bg-background dark:bg-dark-card/60 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">Product</th>
                                        <th scope="col" className="px-4 py-2 text-center">Qty</th>
                                        <th scope="col" className="px-4 py-2 text-right">Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shiftSales.flatMap(s => s.items).reduce((acc, item) => {
                                        const existing = acc.find(i => i.id === item.id);
                                        if (existing) {
                                            existing.quantity += item.quantity;
                                        } else {
                                            acc.push({ ...item });
                                        }
                                        return acc;
                                    }, [] as typeof shiftSales[0]['items']).map(p => (
                                        <tr key={p.id} className="bg-card dark:bg-dark-card border-b dark:border-dark-border hover:bg-background/50 dark:hover:bg-dark-background/50">
                                            <td className="px-4 py-2 font-medium text-foreground dark:text-dark-foreground">{p.name}</td>
                                            <td className="px-4 py-2 text-center font-mono">{p.quantity}</td>
                                            <td className="px-4 py-2 text-right font-mono">{formatCurrency(p.price * p.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                 <div className="flex justify-between items-center mt-6 no-print">
                    <motion.button onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-background text-foreground font-semibold px-4 py-2 rounded-lg hover:bg-border dark:bg-dark-card dark:text-dark-foreground dark:hover:bg-dark-border transition-colors">
                        Close
                    </motion.button>
                     <div className="flex space-x-3">
                        <motion.button onClick={handlePrint} whileTap={{ scale: 0.95 }} className="bg-foreground/80 dark:bg-dark-border text-white dark:text-dark-foreground font-semibold px-4 py-2 rounded-lg hover:bg-foreground dark:hover:bg-dark-border/80 transition-colors flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2v-6a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                             Print Report
                        </motion.button>
                        <motion.button onClick={handleDownloadPDF} disabled={isDownloading} whileTap={{ scale: 0.95 }} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            {isDownloading ? 'Downloading...' : 'Download PDF'}
                        </motion.button>
                     </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ZReportView;