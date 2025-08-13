import React from 'react';
import { Quotation, Settings } from '../../types';

interface QuoteDocumentProps {
    quotation: Quotation;
    settings: Settings;
    documentType: 'Quotation' | 'Proforma-Invoice';
    isPaid?: boolean;
    linkedSaleId?: string;
}

const QuoteDocument = React.forwardRef<HTMLDivElement, QuoteDocumentProps>(({ quotation, settings, documentType, isPaid, linkedSaleId }, ref) => {
    return (
        <div ref={ref} className="relative bg-white p-8 font-sans text-sm text-black w-full max-w-4xl mx-auto shadow-lg border">
            {isPaid && (
                <div 
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                        color: 'rgba(34, 197, 94, 0.15)',
                        fontSize: '8rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        zIndex: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    Paid
                </div>
            )}
            <div className="relative z-10">
                {/* Header */}
                <header className="flex justify-between items-start pb-4 border-b">
                    <div>
                        {settings.businessInfo.logoUrl && (
                            <img src={settings.businessInfo.logoUrl} alt="Company Logo" className="h-16 max-w-xs object-contain mb-4"/>
                        )}
                        <h2 className="text-xl font-bold text-slate-800">{settings.businessInfo.name}</h2>
                        <p className="text-slate-600">{settings.businessInfo.location}</p>
                        <p className="text-slate-600">Tel: {settings.businessInfo.phone}</p>
                        <p className="text-slate-600">PIN: {settings.businessInfo.kraPin}</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold uppercase text-slate-700 tracking-wide">{documentType.replace('-', ' ')}</h1>
                        <div className="mt-2 text-xs">
                            <p className="flex justify-end gap-2"><span className="text-slate-500">Number:</span> <span className="font-semibold">{quotation.quoteNumber}</span></p>
                            <p className="flex justify-end gap-2"><span className="text-slate-500">Date:</span> <span className="font-semibold">{new Date(quotation.createdDate).toLocaleDateString('en-GB', {timeZone: 'Africa/Nairobi'})}</span></p>
                            <p className="flex justify-end gap-2"><span className="text-slate-500">Expires:</span> <span className="font-semibold">{new Date(quotation.expiryDate).toLocaleDateString('en-GB', {timeZone: 'Africa/Nairobi'})}</span></p>
                             {isPaid && linkedSaleId && (
                                <p className="flex justify-end gap-2"><span className="text-slate-500">Invoice Ref:</span> <span className="font-semibold">{linkedSaleId}</span></p>
                            )}
                        </div>
                    </div>
                </header>

                {/* Bill To */}
                <section className="mt-8">
                    <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">Bill To</h3>
                    <p className="font-bold text-slate-800">{quotation.customerName}</p>
                </section>

                {/* Items Table */}
                <section className="mt-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 uppercase text-xs">
                                <th className="p-3 font-semibold">Item Description</th>
                                <th className="p-3 font-semibold text-center">Qty</th>
                                <th className="p-3 font-semibold text-right">Unit Price</th>
                                <th className="p-3 font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotation.items.map(item => (
                                <tr key={item.productId} className="border-b">
                                    <td className="p-3">{item.productName}</td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-right font-mono">{item.price.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono font-semibold">{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Totals */}
                <section className="flex justify-end mt-8">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Subtotal (Excl. VAT)</span>
                            <span className="font-mono text-slate-800">{quotation.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">VAT ({settings.tax.vatRate}%)</span>
                            <span className="font-mono text-slate-800">{quotation.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                            <span className="text-slate-800">Total Amount</span>
                            <span className="font-mono text-slate-800">Ksh {quotation.total.toFixed(2)}</span>
                        </div>
                    </div>
                </section>
                
                {/* Footer */}
                <footer className="mt-16 pt-4 border-t text-xs text-slate-500 text-center">
                    <p>{settings.receipt.footer}</p>
                </footer>
            </div>
        </div>
    );
});

export default QuoteDocument;