import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem, Customer, Settings, Shift } from '../../types';
import { calculateCartTotals } from '../../utils/vatCalculator';

interface CartProps {
    cartItems: CartItem[];
    customers: Customer[];
    selectedCustomerId: string;
    onCustomerChange: (id: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeItem: (productId:string) => void;
    onCharge: (discount: {type: 'percentage' | 'fixed', value: number}) => void;
    isOnline: boolean;
    settings: Settings;
    activeShift: Shift | null;
    onStartShift: (startingFloat: number) => void;
    onEndShiftRequest: () => void;
}

const FRACTIONAL_UNITS = ['m', 'kg', 'g', 'ltr', 'sq ft'];

const Cart = ({ 
    cartItems, 
    customers, 
    selectedCustomerId,
    onCustomerChange,
    updateQuantity, 
    removeItem, 
    onCharge, 
    isOnline,
    settings,
    activeShift,
    onStartShift,
    onEndShiftRequest
}: CartProps) => {
    const [discountValue, setDiscountValue] = useState(0);
    const [isFloatPromptOpen, setIsFloatPromptOpen] = useState(false);
    const [startingFloat, setStartingFloat] = useState<number | ''>('');

    const discountSettings = settings.discount;
    
    const discount = {
        type: discountSettings.type,
        value: discountValue
    };
    
    const { subtotal, discountAmount, taxableAmount, tax, total } = useMemo(
        () => calculateCartTotals(cartItems, discount, settings.tax.vatRate / 100),
        [cartItems, discount, settings.tax.vatRate]
    );

    const handleQuantityChange = (id: string, currentQuantity: number, change: number) => {
        const newQuantity = currentQuantity + change;
        updateQuantity(id, newQuantity);
    };

    const handleQuantityInputChange = (id: string, value: string) => {
        const newQuantity = parseFloat(value);
        if (!isNaN(newQuantity)) {
            updateQuantity(id, newQuantity);
        }
    };
    
    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseFloat(e.target.value) || 0;
        value = Math.max(0, Math.min(discountSettings.maxValue, value));
        setDiscountValue(value);
    };

    const handleToggleClick = () => {
        if (activeShift) {
            onEndShiftRequest();
        } else {
            setIsFloatPromptOpen(true);
        }
    };

    const handleConfirmStartShift = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof startingFloat === 'number' && startingFloat >= 0) {
            onStartShift(startingFloat);
            setIsFloatPromptOpen(false);
            setStartingFloat('');
        }
    };

    return (
        <div className="h-full flex flex-col bg-card dark:bg-dark-card relative">
            <AnimatePresence>
                {isFloatPromptOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-card dark:bg-dark-card z-20 flex flex-col items-center justify-center p-6 space-y-4"
                    >
                        <div className="mx-auto bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary w-16 h-16 rounded-full flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <h4 className="text-lg font-bold text-foreground dark:text-dark-foreground">Enter Starting Float</h4>
                         <form onSubmit={handleConfirmStartShift} className="w-full space-y-4">
                            <input 
                                type="number" 
                                value={startingFloat} 
                                onChange={e => setStartingFloat(e.target.value === '' ? '' : Number(e.target.value))} 
                                className="block w-full text-center text-xl font-bold p-2 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                placeholder="e.g., 5000"
                                autoFocus
                            />
                            <div className="flex space-x-2">
                                <motion.button type="button" onClick={() => setIsFloatPromptOpen(false)} whileTap={{ scale: 0.95 }} className="flex-1 bg-background text-foreground dark:bg-dark-border dark:text-dark-foreground font-bold py-2 rounded-lg hover:bg-border dark:hover:bg-dark-border/50 transition-colors">Cancel</motion.button>
                                <motion.button type="submit" whileTap={{ scale: 0.95 }} className="flex-1 bg-primary dark:bg-dark-primary text-white font-bold py-2 rounded-lg hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors shadow-sm">Confirm</motion.button>
                            </div>
                         </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-4 border-b border-border dark:border-dark-border bg-background/50 dark:bg-dark-card/50">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-foreground dark:text-dark-foreground">Shift Status</h3>
                        <p className={`text-sm font-bold ${activeShift ? 'text-accent dark:text-dark-accent' : 'text-foreground/60 dark:text-dark-foreground/60'}`}>
                            {activeShift ? `Active (${new Date(activeShift.startTime).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit', timeZone: 'Africa/Nairobi'})})` : 'Inactive'}
                        </p>
                    </div>
                    <button 
                        onClick={handleToggleClick} 
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${activeShift ? 'bg-accent dark:bg-dark-accent' : 'bg-border dark:bg-dark-border'}`}
                        aria-label={activeShift ? "End Shift" : "Start Shift"}
                    >
                        <motion.span 
                            layout
                            transition={{type: "spring", stiffness: 700, damping: 30}}
                            className={`inline-block w-4 h-4 bg-white rounded-full shadow-md transform ${activeShift ? 'translate-x-6' : 'translate-x-1'}`} 
                        />
                    </button>
                </div>
            </div>

            <div className="p-4 border-b border-border dark:border-dark-border">
                <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">Current Sale</h2>
                <select 
                    value={selectedCustomerId}
                    onChange={(e) => onCustomerChange(e.target.value)}
                    className="mt-2 w-full bg-background dark:bg-dark-card border border-border dark:border-dark-border rounded-md p-2 text-sm text-foreground dark:text-dark-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                    disabled={!activeShift}
                >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="flex-grow overflow-y-auto">
                {cartItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-foreground/60 dark:text-dark-foreground/60">
                        <p>Cart is empty. Add products to start.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-border dark:divide-dark-border">
                        <AnimatePresence>
                            {cartItems.map(item => {
                                const allowFractions = FRACTIONAL_UNITS.includes(item.unitOfMeasure);
                                return (
                                <motion.li 
                                    key={item.id} 
                                    layout
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 50 }}
                                    className="p-4 flex items-center space-x-3"
                                >
                                    <div className="flex-grow">
                                        <p className="font-bold text-sm text-foreground dark:text-dark-foreground">{item.name}</p>
                                        <p className="text-xs text-foreground/70 dark:text-dark-foreground/70">Ksh {item.price.toFixed(2)} / {item.unitOfMeasure}</p>
                                    </div>
                                    <div className="flex items-center">
                                        {allowFractions ? (
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                                                step="0.01"
                                                className="w-20 p-1 text-center font-bold bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuantityChange(item.id, item.quantity, -1)} className="w-6 h-6 rounded-full bg-background text-foreground hover:bg-border dark:bg-dark-border dark:text-dark-foreground dark:hover:bg-dark-border/50">-</motion.button>
                                                <span className="font-bold w-6 text-center text-foreground dark:text-dark-foreground">{item.quantity}</span>
                                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuantityChange(item.id, item.quantity, 1)} className="w-6 h-6 rounded-full bg-background text-foreground hover:bg-border dark:bg-dark-border dark:text-dark-foreground dark:hover:bg-dark-border/50">+</motion.button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-bold w-20 text-right text-foreground dark:text-dark-foreground">Ksh {(item.price * item.quantity).toFixed(2)}</p>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeItem(item.id)} className="text-danger hover:text-red-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </motion.button>
                                </motion.li>
                            )})}
                        </AnimatePresence>
                    </ul>
                )}
            </div>
            
            <div className="p-4 border-t border-border dark:border-dark-border bg-background/50 dark:bg-dark-card/50 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-foreground/70 dark:text-dark-foreground/70">Subtotal (Pre-tax)</span>
                    <span className="font-bold text-foreground dark:text-dark-foreground">Ksh {subtotal.toFixed(2)}</span>
                </div>

                {discountSettings.enabled && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-foreground/70 dark:text-dark-foreground/70">Discount ({discount.type === 'percentage' ? '%' : 'KES'})</span>
                        <input 
                          type="number"
                          value={discountValue}
                          onChange={handleDiscountChange}
                          max={discountSettings.maxValue}
                          className="w-20 text-right font-bold text-foreground dark:text-dark-foreground bg-card dark:bg-dark-card border rounded-md px-2 py-1 dark:border-dark-border"
                        />
                    </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-danger">
                      <span>Discount Amount</span>
                      <span>- Ksh {discountAmount.toFixed(2)}</span>
                  </div>
                )}

                 <div className="flex justify-between text-sm">
                    <span className="text-foreground/70 dark:text-dark-foreground/70">Taxable Amount</span>
                    <span className="font-bold text-foreground dark:text-dark-foreground">Ksh {taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-foreground/70 dark:text-dark-foreground/70">VAT ({settings.tax.vatRate}%)</span>
                    <span className="font-bold text-foreground dark:text-dark-foreground">Ksh {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                    <span className="font-bold text-foreground dark:text-dark-foreground">Total</span>
                    <span className="font-bold text-primary dark:text-dark-primary">Ksh {total.toFixed(2)}</span>
                </div>
                 <motion.button 
                    onClick={() => onCharge(discount)}
                    disabled={cartItems.length === 0 || !activeShift}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-4 bg-primary dark:bg-dark-primary text-white font-bold py-3 rounded-lg hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-lg"
                 >
                     Charge
                     {!isOnline && <span className="text-xs ml-2">(Offline)</span>}
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                 </motion.button>
            </div>
        </div>
    );
};

export default Cart;