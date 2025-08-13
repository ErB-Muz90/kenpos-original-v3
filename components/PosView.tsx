
import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Product, CartItem, Customer, Sale, User, SaleData, Settings, Shift } from '../types';
import ProductGrid from './pos/ProductGrid';
import Cart from './pos/Cart';
import PaymentModal from './pos/PaymentModal';
import SaleSuccessView from './pos/SaleSuccessView';
import EndShiftModal from './pos/EndShiftModal';
import ZReportView from './pos/ZReportView';

interface PosViewProps {
    products: Product[];
    cart: CartItem[];
    customers: Customer[];
    selectedCustomerId: string;
    onCustomerChange: (id: string) => void;
    addToCart: (product: Product) => void;
    updateCartItemQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    completeSale: (saleData: SaleData) => Sale;
    isOnline: boolean;
    currentUser: User;
    settings: Settings;
    sales: Sale[];
    activeShift: Shift | null;
    onStartShift: (startingFloat: number) => void;
    onEndShiftRequest: () => void;
    isEndingShift: boolean;
    onConfirmEndShift: (actualCash: number) => void;
    onCancelEndShift: () => void;
    shiftReportToShow: Shift | null;
    onCloseShiftReport: () => void;
    onEmailReceiptRequest: (saleId: string, customerId: string) => void;
    onWhatsAppReceiptRequest: (saleId: string, customerId: string) => void;
}

const MotionButton = motion.button;
const MotionSpan = motion.span;
const MotionDiv = motion.div;

const PosView = ({ 
    products, 
    cart, 
    customers, 
    selectedCustomerId,
    onCustomerChange,
    addToCart, 
    updateCartItemQuantity, 
    removeFromCart,
    clearCart,
    completeSale,
    isOnline,
    currentUser,
    settings,
    sales,
    activeShift,
    onStartShift,
    onEndShiftRequest,
    isEndingShift,
    onConfirmEndShift,
    onCancelEndShift,
    shiftReportToShow,
    onCloseShiftReport,
    onEmailReceiptRequest,
    onWhatsAppReceiptRequest
}: PosViewProps) => {
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [chargeDiscount, setChargeDiscount] = useState<{type: 'percentage' | 'fixed', value: number}>({type: 'percentage', value: 0});
    const [lastSale, setLastSale] = useState<Sale | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [shouldAutoPrint, setShouldAutoPrint] = useState(false);

    const selectedCustomer = useMemo(() => {
        return customers.find(c => c.id === selectedCustomerId);
    }, [customers, selectedCustomerId]);

    const handleCharge = (discount: {type: 'percentage' | 'fixed', value: number}) => {
        if (cart.length === 0) return;
        setChargeDiscount(discount);
        setPaymentModalOpen(true);
    };

    const handleCompleteSale = (saleData: SaleData, options?: { autoPrint?: boolean }) => {
        const newSale = completeSale(saleData);
        setPaymentModalOpen(false);
        setIsCartOpen(false); // Close cart on mobile after sale
        setLastSale(newSale);
        if (options?.autoPrint) {
            setShouldAutoPrint(true);
        }
    };

    const handleNewSale = () => {
        clearCart();
        setLastSale(null);
        setShouldAutoPrint(false);
    };

    const isPosActive = !!activeShift && !isEndingShift && !shiftReportToShow;

    if (lastSale) {
        return <SaleSuccessView 
            sale={lastSale} 
            onNewSale={handleNewSale} 
            currentUser={currentUser} 
            settings={settings} 
            onEmailReceiptRequest={onEmailReceiptRequest} 
            onWhatsAppReceiptRequest={onWhatsAppReceiptRequest}
            shouldAutoPrint={shouldAutoPrint}
            onAutoPrintDone={() => setShouldAutoPrint(false)}
        />;
    }
    
    const cartProps = {
        cartItems: cart,
        customers,
        selectedCustomerId,
        onCustomerChange,
        updateQuantity: updateCartItemQuantity,
        removeItem: removeFromCart,
        onCharge: handleCharge,
        isOnline,
        settings,
        activeShift,
        onStartShift,
        onEndShiftRequest,
    };

    return (
        <div className="h-full flex flex-col md:grid md:grid-cols-[1fr_auto] md:overflow-hidden relative">
            <AnimatePresence>
                 {isEndingShift && activeShift && (
                    <EndShiftModal
                        activeShift={activeShift}
                        sales={sales}
                        onConfirmEndShift={onConfirmEndShift}
                        onCancel={onCancelEndShift}
                    />
                )}
                {shiftReportToShow && (
                     <ZReportView
                        shift={shiftReportToShow}
                        sales={sales}
                        onClose={onCloseShiftReport}
                        settings={settings}
                     />
                )}
            </AnimatePresence>

            {/* Product Grid Area: Main column, now scrolls on all screen sizes */}
            <div className={`flex-1 p-4 overflow-y-auto transition-opacity duration-300 ${!isPosActive ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                <ProductGrid products={products} onAddToCart={addToCart} />
            </div>

            {/* --- Cart Area --- */}

            {/* Desktop Cart (visible on medium screens and up) */}
            <div className={`hidden md:flex md:w-96 bg-card dark:bg-dark-card shadow-lg flex-col transition-opacity duration-300 ${!activeShift ? 'opacity-50' : 'opacity-100'}`}>
                <Cart {...cartProps} />
            </div>

            {/* Mobile Cart FAB (visible on small screens) */}
            <div className="md:hidden fixed bottom-6 right-6 z-20">
                <MotionButton
                    onClick={() => setIsCartOpen(true)}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary dark:bg-dark-primary text-white rounded-full p-4 shadow-lg flex items-center justify-center"
                    aria-label={`View Cart (${cart.length} items)`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    {cart.length > 0 && (
                        <MotionSpan 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-danger text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-dark-background">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </MotionSpan>
                    )}
                </MotionButton>
            </div>
            
            {/* Mobile Cart Panel (visible on small screens when isCartOpen is true) */}
            <AnimatePresence>
                {isCartOpen && (
                    <div className="md:hidden fixed inset-0 z-30" aria-modal="true" role="dialog">
                        {/* Backdrop */}
                        <MotionDiv
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-black bg-opacity-50"
                            onClick={() => setIsCartOpen(false)}
                        />
                        
                        {/* Panel */}
                        <MotionDiv
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                            className="absolute bottom-0 left-0 right-0 max-h-[90vh] h-auto bg-card dark:bg-dark-card rounded-t-2xl flex flex-col"
                        >
                            {/* Dragger handle to close */}
                            <div className="p-4 flex-shrink-0 cursor-grab" onPointerDown={() => setIsCartOpen(false)}>
                                <div className="mx-auto block w-12 h-1.5 bg-border dark:bg-dark-border/50 rounded-full"></div>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto">
                                <Cart {...cartProps} />
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {isPaymentModalOpen && selectedCustomer && isPosActive && (
                    <PaymentModal 
                        cartItems={cart}
                        discount={chargeDiscount}
                        onClose={() => setPaymentModalOpen(false)}
                        onCompleteSale={handleCompleteSale}
                        customer={selectedCustomer}
                        settings={settings}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PosView;
