import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem, SaleData, Payment, Customer, Settings } from '../../types';
import { calculateCartTotals } from '../../utils/vatCalculator';

interface PaymentModalProps {
    cartItems: CartItem[];
    discount: { type: 'percentage' | 'fixed', value: number };
    onClose: () => void;
    onCompleteSale: (sale: SaleData, options?: { autoPrint?: boolean }) => void;
    customer: Customer;
    settings: Settings;
}

type PaymentType = 'M-Pesa' | 'Cash' | 'Card' | 'Split';
type StkState = 'prompting' | 'sending' | 'waiting' | 'success' | 'failure';

const PaymentModal = ({ cartItems, discount, onClose, onCompleteSale, customer, settings }: PaymentModalProps) => {
    const [paymentType, setPaymentType] = useState<PaymentType>('Cash');
    const [splitPayments, setSplitPayments] = useState<Payment[]>([{ method: 'Cash', amount: 0 }]);
    const [cashReceived, setCashReceived] = useState<number | ''>('');
    
    // M-Pesa STK Push State
    const [stkState, setStkState] = useState<StkState>('prompting');
    const [phoneNumber, setPhoneNumber] = useState(customer.phone !== 'N/A' ? customer.phone : '');
    const [transactionCode, setTransactionCode] = useState<string | null>(null);
    const [stkError, setStkError] = useState<string | null>(null);

    // Loyalty Points State
    const [pointsToRedeem, setPointsToRedeem] = useState<number | ''>('');
    const [autoPrint, setAutoPrint] = useState(true);

    const { total } = useMemo(() => calculateCartTotals(cartItems, discount, settings.tax.vatRate / 100), [cartItems, discount, settings.tax.vatRate]);
    
    const maxRedeemableValue = useMemo(() => {
        if (!settings.loyalty.enabled || !customer || customer.id === 'cust001') return 0;

        const maxFromPercentage = total * (settings.loyalty.maxRedemptionPercentage / 100);
        const maxFromPoints = customer.loyaltyPoints * settings.loyalty.redemptionRate;
        
        return Math.min(maxFromPercentage, maxFromPoints);
    }, [customer, total, settings.loyalty]);

    const pointsValue = useMemo(() => {
        if (!settings.loyalty.enabled || pointsToRedeem === '') return 0;
        const value = Number(pointsToRedeem) * settings.loyalty.redemptionRate;
        return Math.min(value, maxRedeemableValue);
    }, [pointsToRedeem, maxRedeemableValue, settings.loyalty]);
    
    const totalAfterPoints = total - pointsValue;

    const change = useMemo(() => {
        if (cashReceived === '') return 0;
        const paid = cashReceived;
        return Math.max(0, paid - totalAfterPoints);
    }, [cashReceived, totalAfterPoints]);

    const cashSuggestions = useMemo(() => {
        const total = totalAfterPoints;
        if (total <= 0) return [];
        
        const suggestions: number[] = [];
        const exactAmount = Math.ceil(total);
        suggestions.push(exactAmount);

        const denominations = [100, 200, 500, 1000, 2000, 5000];
        for (const denom of denominations) {
            if (denom > exactAmount) {
                suggestions.push(denom);
            }
        }

        if (exactAmount > 100) {
            const nextHundred = Math.ceil(exactAmount / 100) * 100;
            if(nextHundred > exactAmount) suggestions.push(nextHundred);
        }
         if (exactAmount > 1000) {
            const nextThousand = Math.ceil(exactAmount / 1000) * 1000;
            if(nextThousand > exactAmount) suggestions.push(nextThousand);
        }

        return [...new Set(suggestions)].sort((a,b) => a - b).slice(0, 4);
    }, [totalAfterPoints]);

    const handleComplete = () => {
        const { subtotal, discountAmount, tax } = calculateCartTotals(cartItems, discount, settings.tax.vatRate / 100);

        let payments: Payment[] = [];
        if (paymentType === 'Cash') {
            payments.push({ method: 'Cash', amount: Number(cashReceived) || totalAfterPoints });
        } else if (paymentType === 'M-Pesa') {
            payments.push({ 
                method: 'M-Pesa', 
                amount: totalAfterPoints,
                details: { transactionCode: transactionCode || 'N/A_MANUAL', phoneNumber }
            });
        } else if (paymentType === 'Card') {
            payments.push({ method: 'Card', amount: totalAfterPoints });
        }
        
        if (pointsValue > 0) {
            payments.push({ method: 'Points', amount: pointsValue });
        }

        const saleData: SaleData = {
            items: cartItems,
            subtotal,
            discountAmount,
            tax,
            total,
            payments,
            change,
            customerId: customer.id,
            date: new Date(),
            pointsUsed: Number(pointsToRedeem) || 0,
            pointsValue: pointsValue || 0,
        };
        onCompleteSale(saleData, { autoPrint });
    };

    const handleStkPush = async () => {
        setStkState('sending');
        setStkError(null);
        
        // In a real app, this would be an API call to your backend
        // to initiate the STK Push via Daraja API.
        console.log('Initiating STK Push to', phoneNumber, 'for', totalAfterPoints);
        
        setTimeout(() => {
             // Simulate waiting for user to enter PIN
            setStkState('waiting');
            
            // Simulate a response from M-Pesa
            setTimeout(() => {
                 const isSuccess = Math.random() > 0.2; // 80% success rate
                 if(isSuccess) {
                    setStkState('success');
                    const mockCode = `R${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
                    setTransactionCode(mockCode);
                 } else {
                    setStkState('failure');
                    setStkError('The transaction was cancelled by the user.');
                 }
            }, 5000);
        }, 1000);
    };

    const paymentButtons: { type: PaymentType, name: string }[] = [
        { type: 'Cash', name: 'Cash' },
        { type: 'M-Pesa', name: 'M-Pesa' },
        { type: 'Card', name: 'Card' },
    ];
    
    const renderPaymentContent = () => {
        switch (paymentType) {
            case 'Cash':
                return (
                    <div className="space-y-4">
                        <label htmlFor="cashReceived" className="block text-sm font-medium text-foreground dark:text-dark-foreground">Cash Received</label>
                        <input 
                            id="cashReceived"
                            type="number"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value === '' ? '' : Number(e.target.value))}
                            className="block w-full text-center text-2xl font-bold p-3 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary"
                            placeholder={totalAfterPoints.toFixed(2)}
                            autoFocus
                        />
                         <div className="flex flex-wrap gap-2 justify-center pt-2">
                            {cashSuggestions.map(amount => (
                                <motion.button
                                    key={amount}
                                    type="button"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setCashReceived(amount)}
                                    className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-1 px-4 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-500"
                                >
                                    {amount}
                                </motion.button>
                            ))}
                        </div>
                        {change > 0 && <div className="text-center font-bold text-lg text-primary dark:text-dark-primary">Change Due: Ksh {change.toFixed(2)}</div>}
                    </div>
                );
            case 'M-Pesa':
                 return (
                    <div className="space-y-4 text-center">
                        {stkState === 'prompting' && (
                            <>
                                <p className="text-sm text-foreground/70 dark:text-dark-foreground/70">Enter customer's phone number to trigger STK push.</p>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="block w-full text-center text-lg font-bold p-2 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm"
                                    placeholder="0712345678"
                                />
                                <motion.button whileTap={{scale:0.95}} onClick={handleStkPush} className="w-full bg-accent dark:bg-dark-accent text-white font-bold py-2 rounded-lg">Send STK Push</motion.button>
                            </>
                        )}
                         {(stkState === 'sending' || stkState === 'waiting') && (
                             <div className="flex flex-col items-center p-4 space-y-2">
                                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-4 border-accent dark:border-dark-accent border-t-transparent rounded-full" />
                                 <p className="font-semibold">{stkState === 'sending' ? 'Sending request to phone...' : 'Waiting for customer to enter M-Pesa PIN...'}</p>
                             </div>
                         )}
                         {stkState === 'success' && (
                             <div className="p-4 bg-accent/10 text-accent dark:text-dark-accent rounded-lg space-y-1">
                                 <h4 className="font-bold">Payment Successful!</h4>
                                 <p className="text-sm">Ref: {transactionCode}</p>
                             </div>
                         )}
                         {stkState === 'failure' && (
                             <div className="p-4 bg-danger/10 text-danger rounded-lg space-y-1">
                                 <h4 className="font-bold">Payment Failed</h4>
                                 <p className="text-sm">{stkError}</p>
                                 <button onClick={() => setStkState('prompting')} className="text-sm font-bold underline">Try Again</button>
                             </div>
                         )}
                    </div>
                );
            case 'Card':
                return <div className="text-center p-4 bg-accent/10 dark:bg-dark-accent/20 text-accent dark:text-dark-accent rounded-lg font-semibold">Please use your card terminal to process Ksh {totalAfterPoints.toFixed(2)}.</div>;
            default:
                return null;
        }
    }

    const canComplete = (paymentType === 'Cash' && cashReceived !== '' && Number(cashReceived) >= totalAfterPoints) || 
                       (paymentType === 'M-Pesa' && stkState === 'success') || 
                       paymentType === 'Card';

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
                className="bg-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl flex flex-col"
            >
                <div className="flex justify-between items-center p-6 border-b border-border dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Payment</h2>
                    <button onClick={onClose} className="text-foreground/70 hover:text-foreground dark:text-dark-foreground/70 dark:hover:text-dark-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Totals and Loyalty */}
                    <div className="space-y-4">
                        <div className="p-4 bg-background dark:bg-dark-background rounded-lg text-center">
                            <p className="text-lg font-bold text-foreground dark:text-dark-foreground">Total Due</p>
                            <p className="text-5xl font-extrabold text-primary dark:text-dark-primary tracking-tight">Ksh {total.toFixed(2)}</p>
                        </div>

                         {settings.loyalty.enabled && customer.id !== 'cust001' && (
                             <div className="p-4 border border-border dark:border-dark-border rounded-lg">
                                <h4 className="font-bold text-foreground dark:text-dark-foreground">Use Loyalty Points</h4>
                                <p className="text-xs text-foreground/70 dark:text-dark-foreground/70">Balance: {customer.loyaltyPoints} points (worth Ksh { (customer.loyaltyPoints * settings.loyalty.redemptionRate).toFixed(2) })</p>
                                <div className="mt-2 flex items-center space-x-2">
                                    <input 
                                        type="number"
                                        value={pointsToRedeem}
                                        onChange={e => setPointsToRedeem(e.target.value === '' ? '' : Math.min(Number(e.target.value), customer.loyaltyPoints))}
                                        max={customer.loyaltyPoints}
                                        min="0"
                                        placeholder="Points to use"
                                        className="w-full p-2 border border-border dark:border-dark-border rounded-md"
                                    />
                                </div>
                                {pointsValue > 0 && <p className="text-sm font-bold text-accent dark:text-dark-accent mt-2">- Ksh {pointsValue.toFixed(2)}</p>}
                             </div>
                         )}

                         {pointsValue > 0 && (
                             <div className="p-4 bg-background dark:bg-dark-background rounded-lg text-center">
                                 <p className="text-lg font-bold text-foreground dark:text-dark-foreground">Remaining Amount</p>
                                 <p className="text-3xl font-extrabold text-primary dark:text-dark-primary tracking-tight">Ksh {totalAfterPoints.toFixed(2)}</p>
                             </div>
                         )}
                    </div>

                    {/* Right: Payment Method */}
                    <div className="space-y-4">
                        <div className="flex bg-background dark:bg-dark-background p-1 rounded-lg">
                            {paymentButtons.map(btn => (
                                <button key={btn.type} onClick={() => setPaymentType(btn.type)} className={`w-full py-2 rounded-md font-bold text-sm transition-colors ${paymentType === btn.type ? 'bg-card dark:bg-dark-card shadow text-primary dark:text-dark-primary' : 'text-foreground/70 dark:text-dark-foreground/70 hover:bg-card/50 dark:hover:bg-dark-card/50'}`}>
                                    {btn.name}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 border border-border dark:border-dark-border rounded-lg min-h-[150px]">
                            {renderPaymentContent()}
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-between items-center p-6 border-t border-border dark:border-dark-border bg-background dark:bg-dark-background/50 rounded-b-xl">
                     <div className="flex items-center">
                        <input id="autoPrint" type="checkbox" checked={autoPrint} onChange={e => setAutoPrint(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="autoPrint" className="ml-2 block text-sm text-foreground dark:text-dark-foreground">Print receipt after sale</label>
                    </div>
                    <motion.button 
                        onClick={handleComplete} 
                        disabled={!canComplete}
                        whileTap={{ scale: 0.98 }}
                        className="bg-primary dark:bg-dark-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-accent dark:hover:bg-dark-accent transition-colors shadow-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        Complete Sale
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PaymentModal;