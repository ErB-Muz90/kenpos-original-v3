import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PurchaseOrder, Supplier, Product, Settings } from '../../types';
import PurchaseOrderDocument from './PurchaseOrderDocument';

interface PODetailViewProps {
    purchaseOrder: PurchaseOrder;
    supplier?: Supplier;
    products: Product[];
    onBack: () => void;
    onEmailRequest: (poId: string, supplierId: string) => void;
    onWhatsAppRequest: (poId: string, supplierId: string) => void;
    settings: Settings;
}

const PODetailView: React.FC<PODetailViewProps> = ({ purchaseOrder, supplier, products, onBack, onEmailRequest, onWhatsAppRequest, settings }) => {
    const pdfRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const { id, poNumber } = purchaseOrder;

    const handleDownload = async () => {
        if (!pdfRef.current || isDownloading) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(pdfRef.current!, {
                scale: 2,
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`PurchaseOrder_${poNumber}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Sorry, there was an error generating the PDF.");
        } finally {
            setIsDownloading(false);
        }
    };
    
    const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

    return (
        <div className="h-full overflow-y-auto bg-slate-200 dark:bg-slate-900">
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <button onClick={onBack} className="flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to All Purchases
                    </button>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                         <motion.button 
                            onClick={handleDownload}
                            whileTap={{ scale: 0.95 }}
                            disabled={isDownloading}
                            className="bg-blue-600 text-white font-bold px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center text-xs disabled:bg-slate-400"
                        >
                            <DownloadIcon/> {isDownloading ? 'Downloading...' : 'Download PDF'}
                        </motion.button>
                         <motion.button 
                            onClick={() => onEmailRequest(id, purchaseOrder.supplierId)}
                            whileTap={{ scale: 0.95 }}
                            className="bg-slate-700 text-white font-bold px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center text-xs"
                        >
                            <EmailIcon /> Email PO
                        </motion.button>
                    </div>
                </div>
                
                <div id="pdf-content-wrapper">
                    <PurchaseOrderDocument
                        ref={pdfRef}
                        purchaseOrder={purchaseOrder}
                        supplier={supplier}
                        products={products}
                        settings={settings}
                    />
                </div>
            </div>
        </div>
    );
};

export default PODetailView;