
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sale, User, Settings } from '../../types';
import Receipt from './Receipt';
import { ICONS } from '../../constants';
import * as escpos from '../../utils/escpos';

interface SaleSuccessViewProps {
    sale: Sale;
    onNewSale: () => void;
    currentUser: User;
    settings: Settings;
    onEmailReceiptRequest: (saleId: string, customerId: string) => void;
    onWhatsAppReceiptRequest: (saleId: string, customerId: string) => void;
    shouldAutoPrint?: boolean;
    onAutoPrintDone?: () => void;
}

const SaleSuccessView = ({ sale, onNewSale, currentUser, settings, onEmailReceiptRequest, onWhatsAppReceiptRequest, shouldAutoPrint, onAutoPrintDone }: SaleSuccessViewProps) => {
    
    const handlePrint = async () => {
        if (settings.hardware.printer.type === 'ESC/POS') {
            try {
                // Assuming device is connected and managed in the escpos utility
                await escpos.printDirect(sale, settings, currentUser.name);
            } catch (error) {
                console.error("Direct print failed:", error);
                alert("Direct print failed. Please ensure the printer is connected and try again.");
            }
        } else {
            window.print();
        }
    };

    useEffect(() => {
        if (shouldAutoPrint) {
            const timer = setTimeout(() => {
                handlePrint();
                if (onAutoPrintDone) onAutoPrintDone();
            }, 500); // Small delay for component to render and for API state to be certain
            return () => clearTimeout(timer);
        }
    }, [shouldAutoPrint, onAutoPrintDone, settings.hardware.printer.type]);


    return (
        <div className="h-full flex flex-col bg-background dark:bg-dark-background p-4 md:p-8 md:items-center md:justify-center">
            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 h-full md:h-auto">
                <div className="flex-shrink-0 md:flex-grow bg-card dark:bg-dark-card p-8 rounded-xl shadow-lg text-center flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                        className="bg-green-100 dark:bg-green-900/50 rounded-full p-4 mb-4"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </motion.div>
                    <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">Sale Complete!</h1>
                    <p className="text-foreground/70 dark:text-dark-foreground/70 mt-2">Transaction ID: {sale.id}</p>
                    {!sale.synced && (
                        <div className="mt-4 bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full">
                            This sale was completed offline and is queued for syncing.
                        </div>
                    )}
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <motion.button
                            onClick={onNewSale}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary dark:bg-dark-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-accent dark:hover:bg-dark-accent transition-colors shadow-md text-lg"
                        >
                            New Sale
                        </motion.button>
                         <motion.button
                            onClick={() => onEmailReceiptRequest(sale.id, sale.customerId)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg flex items-center"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Email Receipt
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
                            className="bg-foreground/80 dark:bg-dark-border text-white font-bold py-3 px-6 rounded-lg hover:bg-foreground dark:hover:bg-dark-border/80 transition-colors shadow-md text-lg flex items-center"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2v-6a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                            Print Receipt
                        </motion.button>
                    </div>
                </div>

                <div className="flex-grow w-full md:w-96 md:flex-grow-0 flex-shrink-0 overflow-y-auto">
                   <div id="receipt-container">
                     <Receipt sale={sale} cashierName={currentUser.name} settings={settings} />
                   </div>
                </div>
            </div>
        </div>
    );
};

export default SaleSuccessView;
