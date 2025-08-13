import React from 'react';
import { SupplierInvoice, Supplier, PurchaseOrder, Settings } from '../../types';

interface SupplierInvoiceDocumentProps {
    invoice: SupplierInvoice;
    supplier?: Supplier;
    purchaseOrder?: PurchaseOrder;
    settings: Settings;
}

const SupplierInvoiceDocument = React.forwardRef<HTMLDivElement, SupplierInvoiceDocumentProps>(({ invoice, supplier, purchaseOrder, settings }, ref) => {
    return (
        <div ref={ref} className="relative bg-white p-8 font-sans text-sm text-black w-full max-w-4xl mx-auto shadow-lg border">
            {invoice.status === 'Paid' && (
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
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold uppercase text-slate-700 tracking-wide">Supplier Invoice</h1>
                        <div className="mt-2 text-xs">
                            <p className="flex justify-end gap-2"><span className="text-slate-500">Invoice #:</span> <span className="font-semibold">{invoice.invoiceNumber}</span></p>
                            <p className="flex justify-end gap-2"><span className="text-slate-500">PO Ref:</span> <span className="font-semibold">{purchaseOrder?.poNumber}</span></p>
                            <p className="flex justify-end gap-2"><span className="text-slate-500">Invoice Date:</span> <span className="font-semibold">{new Date(invoice.invoiceDate).toLocaleDateString('en-GB', {timeZone: 'Africa/Nairobi'})}</span></p>
                            <p className="flex justify-end gap-2"><span className="text-slate-500">Due Date:</span> <span className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString('en-GB', {timeZone: 'Africa/Nairobi'})}</span></p>
                        </div>
                    </div>
                </header>

                {/* Bill To */}
                <section className="mt-8">
                    <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">Supplier</h3>
                    <p className="font-bold text-slate-800">{supplier?.name}</p>
                    <p className="text-slate-600">{supplier?.contact}</p>
                    <p className="text-slate-600">{supplier?.email}</p>
                </section>

                {/* Items Table */}
                <section className="mt-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 uppercase text-xs">
                                <th className="p-3 font-semibold">Item Description</th>
                                <th className="p-3 font-semibold text-center">Qty Received</th>
                                <th className="p-3 font-semibold text-right">Unit Cost</th>
                                <th className="p-3 font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrder?.items.map(item => (
                                <tr key={item.productId} className="border-b">
                                    <td className="p-3">{item.productName}</td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-right font-mono">{item.cost.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono font-semibold">{(item.cost * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Totals */}
                <section className="flex justify-end mt-8">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-mono text-slate-800">{invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">VAT ({settings.tax.vatRate}%)</span>
                            <span className="font-mono text-slate-800">{invoice.taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                            <span className="text-slate-800">Invoice Total</span>
                            <span className="font-mono text-slate-800">Ksh {invoice.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Amount Paid</span>
                            <span className="font-mono text-slate-800">- {invoice.paidAmount.toFixed(2)}</span>
                        </div>
                        <div className={`flex justify-between text-lg font-bold pt-2 mt-2 ${invoice.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Balance Due</span>
                            <span className="font-mono">Ksh {(invoice.totalAmount - invoice.paidAmount).toFixed(2)}</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
});

export default SupplierInvoiceDocument;