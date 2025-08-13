import React, { useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quotation, Settings, Permission, Sale } from '../../types';
import QuoteDocument from './QuoteDocument';

interface QuotationDetailViewProps {
    quotation: Quotation;
    settings: Settings;
    sales: Sale[];
    onBack: () => void;
    onConvertQuoteToSale: (quotation: Quotation) => void;
    onEmailRequest: (type: 'Quotation' | 'Proforma-Invoice', quoteId: string, customerId: string) => void;
    permissions: Permission[];
}

type DocumentType = 'Quotation' | 'Proforma-Invoice';

const QuotationDetailView: React.FC<QuotationDetailViewProps> = ({ quotation, settings, sales, onBack, onConvertQuoteToSale, onEmailRequest, permissions }) => {
    const pdfRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadType, setDownloadType] = useState<DocumentType | null>(null);

    const canManage = permissions.includes('manage_quotations');
    
    const linkedSale = useMemo(() => sales.find(s => s.quotationId === quotation.id), [sales, quotation.id]);

    const handleDownload = async (type: DocumentType) => {
        if (!pdfRef.current || isDownloading) return;

        setIsDownloading(true);
        setDownloadType(type);

        // Allow component to re-render with the correct title
        setTimeout(async () => {
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
                pdf.save(`${type}_${quotation.quoteNumber}.pdf`);
            } catch (error) {
                console.error("Failed to generate PDF:", error);
                alert("Sorry, there was an error generating the PDF.");
            } finally {
                setIsDownloading(false);
                setDownloadType(null);
            }
        }, 100);
    };
    
    const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

    return (
        <div className="h-full overflow-y-auto bg-slate-200">
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <button onClick={onBack} className="flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to All Quotations
                    </button>
                    {linkedSale && (
                        <div className="px-4 py-2 text-lg font-bold rounded-lg text-green-800 bg-green-100 inline-block uppercase tracking-widest">
                            Paid
                        </div>
                    )}
                    {canManage && (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                             <motion.button 
                                onClick={() => handleDownload('Quotation')} 
                                whileTap={{ scale: 0.95 }}
                                disabled={isDownloading}
                                className="bg-blue-600 text-white font-bold px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center text-xs disabled:bg-slate-400"
                            >
                                <DownloadIcon/> {isDownloading && downloadType === 'Quotation' ? 'Downloading...' : 'Quote PDF'}
                            </motion.button>
                             <motion.button 
                                onClick={() => onEmailRequest('Quotation', quotation.quoteNumber, quotation.customerId)} 
                                whileTap={{ scale: 0.95 }}
                                className="bg-blue-600 text-white font-bold px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center text-xs"
                            >
                                <EmailIcon /> Email Quote
                            </motion.button>
                             <motion.button 
                                onClick={() => handleDownload('Proforma-Invoice')} 
                                whileTap={{ scale: 0.95 }}
                                disabled={isDownloading}
                                className="bg-slate-700 text-white font-bold px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center text-xs disabled:bg-slate-400"
                            >
                                <DownloadIcon/> {isDownloading && downloadType === 'Proforma-Invoice' ? 'Downloading...' : 'Pro-forma PDF'}
                            </motion.button>
                            <motion.button 
                                onClick={() => onEmailRequest('Proforma-Invoice', quotation.quoteNumber, quotation.customerId)} 
                                whileTap={{ scale: 0.95 }}
                                className="bg-slate-700 text-white font-bold px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center text-xs"
                            >
                                <EmailIcon/> Email Pro-forma
                            </motion.button>
                            {!linkedSale && quotation.status !== 'Expired' && (
                                <motion.button 
                                    onClick={() => onConvertQuoteToSale(quotation)} 
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center text-sm"
                                >
                                    Convert to Sale
                                </motion.button>
                            )}
                        </div>
                    )}
                </div>
                
                <div id="pdf-content-wrapper">
                    <QuoteDocument 
                        ref={pdfRef}
                        quotation={quotation}
                        settings={settings}
                        documentType={downloadType || 'Quotation'}
                        isPaid={!!linkedSale}
                        linkedSaleId={linkedSale?.id}
                    />
                </div>
            </div>
        </div>
    );
};

export default QuotationDetailView;