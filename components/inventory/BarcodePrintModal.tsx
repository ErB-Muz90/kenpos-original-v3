import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import JsBarcode from 'jsbarcode';
import { Product } from '../../types';

interface BarcodePrintModalProps {
    product: Product;
    onClose: () => void;
}

const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({ product, onClose }) => {
    const barcodeRef = useRef<SVGSVGElement>(null);
    const [barcodeType, setBarcodeType] = useState<'sku' | 'ean'>(product.ean ? 'ean' : 'sku');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (barcodeRef.current) {
            // Clear previous content
            barcodeRef.current.innerHTML = '';
            setError(null);

            const codeToPrint = (barcodeType === 'ean' && product.ean) ? product.ean : product.sku;

            if (codeToPrint) {
                try {
                    JsBarcode(barcodeRef.current, codeToPrint, {
                        format: barcodeType === 'ean' ? "EAN13" : "CODE128",
                        displayValue: true,
                        fontSize: 14,
                        margin: 10,
                        valid: (valid) => {
                            if (!valid) {
                                setError(`The provided ${barcodeType.toUpperCase()} is not valid for this barcode type.`);
                            }
                        }
                    });
                } catch (e: any) {
                    console.error("Barcode generation failed:", e);
                    setError(e.message || `Failed to generate ${barcodeType.toUpperCase()} barcode.`);
                }
            } else {
                 setError(`No ${barcodeType.toUpperCase()} code available for this product.`);
            }
        }
    }, [product, barcodeType]);
    
    const handlePrint = () => {
        window.print();
    };

    return (
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 dark:bg-slate-800"
            >
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Print Barcode</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {product.ean && (
                    <div className="mb-4 flex justify-center bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                        <button onClick={() => setBarcodeType('sku')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors w-1/2 ${barcodeType === 'sku' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>
                            Print SKU
                        </button>
                        <button onClick={() => setBarcodeType('ean')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors w-1/2 ${barcodeType === 'ean' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>
                            Print EAN
                        </button>
                    </div>
                )}


                <div id="barcode-to-print" className="text-center p-4 border rounded-lg bg-white">
                    <h3 className="font-bold text-lg text-black">{product.name}</h3>
                    <p className="font-bold text-emerald-600 mb-2 text-black">Ksh {product.price.toFixed(2)}</p>
                    {error ? (
                        <div className="h-16 flex items-center justify-center text-red-500 font-semibold text-sm p-2 text-center">
                           {error}
                        </div>
                    ) : (
                        <svg ref={barcodeRef} className="mx-auto"></svg>
                    )}
                </div>

                 <div className="mt-8 flex justify-end space-x-3">
                    <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</motion.button>
                    <motion.button onClick={handlePrint} disabled={!!error} whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center disabled:bg-slate-400 disabled:cursor-not-allowed">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2v-6a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                        Print
                    </motion.button>
                </div>

            </motion.div>
        </motion.div>
    );
};

export default BarcodePrintModal;