import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Sale, User, Settings } from '../../types';
import Receipt from '../pos/Receipt';
import { ICONS } from '../../constants';

interface ReceiptDetailViewProps {
    sale: Sale;
    onBack: () => void;
    currentUser: User;
    settings: Settings;
    onEmailReceiptRequest: (documentType: 'Receipt', saleId: string, customerId: string) => void;
    onWhatsAppReceiptRequest: (saleId: string, customerId: string) => void;
}

const ReceiptDetailView: React.FC<ReceiptDetailViewProps> = ({ sale, onBack, currentUser, settings, onEmailReceiptRequest, onWhatsAppReceiptRequest }) => {
    const pdfRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!pdfRef.current || isDownloading) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', [80, 297]); // Standard receipt paper width
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Receipt_${sale.id}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Sorry, there was an error generating the PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-900 p-4 md:p-8 md:items-center md:justify-center">
            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 h-full md:h-auto">
                <div className="flex-shrink-0 md:flex-grow bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Receipt Details</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-mono text-sm">ID: {sale.id}</p>
                    
                     <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <motion.button
                            onClick={onBack}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-slate-600 dark:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-md text-lg"
                        >
                            &larr; Back to List
                        </motion.button>
                        <motion.button
                            onClick={handleDownloadPDF}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isDownloading}
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg flex items-center disabled:bg-slate-400"
                        >
                            {isDownloading ? 'Downloading...' : 'Download PDF'}
                        </motion.button>
                         <motion.button
                            onClick={() => onEmailReceiptRequest('Receipt', sale.id, sale.customerId)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg flex items-center"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Email
                        </motion.button>
                         <motion.button
                            onClick={() => onWhatsAppReceiptRequest(sale.id, sale.customerId)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-[#25D366] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#1EAE53] transition-colors shadow-md text-lg flex items-center"
                        >
                            <div className="w-5 h-5 mr-2">{ICONS.whatsapp}</div>
                            WhatsApp
                        </motion.button>
                        <motion.button
                            onClick={handlePrint}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors shadow-md text-lg flex items-center"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2v-6a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                            Print
                        </motion.button>
                    </div>
                </div>
                <div className="flex-grow w-full md:w-96 md:flex-grow-0 flex-shrink-0 overflow-y-auto">
                   <div id="receipt-container">
                     <div ref={pdfRef}>
                        <Receipt sale={sale} cashierName={currentUser.name} settings={settings} />
                     </div>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptDetailView;
