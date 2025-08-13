import React from 'react';
import { PurchaseOrder, Supplier, Product, Settings } from '../../types';

interface PurchaseOrderDocumentProps {
    purchaseOrder: PurchaseOrder;
    supplier?: Supplier;
    products: Product[];
    settings: Settings;
}

const PurchaseOrderDocument = React.forwardRef<HTMLDivElement, PurchaseOrderDocumentProps>(({ purchaseOrder, supplier, products, settings }, ref) => {
    const { poNumber, createdDate, expectedDate, totalCost, items } = purchaseOrder;

    return (
        <div ref={ref} className="bg-white p-8 font-sans text-sm text-black w-full max-w-4xl mx-auto shadow-lg border">
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
                    <h1 className="text-3xl font-bold uppercase text-slate-700 tracking-wide">Purchase Order</h1>
                    <div className="mt-2 text-xs">
                        <p className="flex justify-end gap-2"><span className="text-slate-500">PO Number:</span> <span className="font-semibold">{poNumber}</span></p>
                        <p className="flex justify-end gap-2"><span className="text-slate-500">Date Issued:</span> <span className="font-semibold">{new Date(createdDate).toLocaleDateString('en-GB', {timeZone: 'Africa/Nairobi'})}</span></p>
                        <p className="flex justify-end gap-2"><span className="text-slate-500">Expected By:</span> <span className="font-semibold">{new Date(expectedDate).toLocaleDateString('en-GB', {timeZone: 'Africa/Nairobi'})}</span></p>
                    </div>
                </div>
            </header>
            
            {/* Supplier Info */}
            <section className="mt-8">
                <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">Vendor / Supplier</h3>
                <p className="font-bold text-slate-800">{supplier?.name || 'N/A'}</p>
                <p className="text-slate-600">{supplier?.contact}</p>
                <p className="text-slate-600">{supplier?.email}</p>
            </section>

            {/* Items Table */}
            <section className="mt-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 uppercase text-xs">
                            <th className="p-3 font-semibold">Item Description</th>
                            <th className="p-3 font-semibold text-center">Qty</th>
                            <th className="p-3 font-semibold text-right">Unit Cost</th>
                            <th className="p-3 font-semibold text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.productId} className="border-b">
                                <td className="p-3">{item.productName} ({item.unitOfMeasure})</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right font-mono">{item.cost.toFixed(2)}</td>
                                <td className="p-3 text-right font-mono font-semibold">{(item.cost * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            
            {/* Total */}
            <section className="flex justify-end mt-8">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                        <span className="text-slate-800">Total Amount</span>
                        <span className="font-mono text-slate-800">Ksh {totalCost.toFixed(2)}</span>
                    </div>
                </div>
            </section>

             {/* Footer */}
            <footer className="mt-16 pt-4 border-t text-xs text-slate-500 text-center">
                <p>Thank you for your business!</p>
                <p>{settings.receipt.footer}</p>
            </footer>
        </div>
    );
});

export default PurchaseOrderDocument;