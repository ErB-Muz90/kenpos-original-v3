import { CartItem } from '../types';

// Helper for rounding to 2 decimal places to avoid floating point issues
export const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * Calculates the base price and VAT amount for a given price and pricing type.
 * @param price - The price of the item.
 * @param pricingType - Whether the price is 'inclusive' or 'exclusive' of VAT.
 * @param vatRate - The VAT rate as a decimal (e.g., 0.16 for 16%).
 * @returns An object with basePrice and vatAmount.
 */
export const getPriceBreakdown = (price: number, pricingType: 'inclusive' | 'exclusive', vatRate: number) => {
    if (pricingType === 'inclusive') {
        const basePrice = price / (1 + vatRate);
        const vatAmount = price - basePrice;
        return { basePrice, vatAmount };
    } else { // 'exclusive'
        const basePrice = price;
        const vatAmount = basePrice * vatRate;
        return { basePrice, vatAmount };
    }
};


/**
 * Calculates cart totals based on items, a discount, and settings.
 * Correctly handling both VAT-inclusive and VAT-exclusive product pricing,
 * and supporting both percentage and fixed amount discounts.
 * @param cartItems - Array of items in the cart.
 * @param discount - An object with the discount type and value.
 * @param vatRate - The VAT rate from settings as a decimal (e.g., 0.16 for 16%).
 * @returns An object with subtotal, discountAmount, taxableAmount, tax, and total.
 */
export const calculateCartTotals = (
    cartItems: CartItem[], 
    discount: { type: 'percentage' | 'fixed', value: number },
    vatRate: number
) => {
    const preTaxSubtotal = cartItems.reduce((acc, item) => {
        const { basePrice } = getPriceBreakdown(item.price, item.pricingType, vatRate);
        return acc + (basePrice * item.quantity);
    }, 0);

    let discountAmount = 0;
    if (discount.type === 'percentage') {
        discountAmount = preTaxSubtotal * (discount.value / 100);
    } else {
        discountAmount = discount.value;
    }
    
    // Ensure discount doesn't exceed the subtotal
    discountAmount = Math.min(preTaxSubtotal, discountAmount);

    const taxableAmount = preTaxSubtotal - discountAmount;
    const tax = taxableAmount * vatRate;
    const total = taxableAmount + tax;

    return { 
        subtotal: round(preTaxSubtotal), 
        discountAmount: round(discountAmount), 
        taxableAmount: round(taxableAmount), 
        tax: round(tax), 
        total: round(total) 
    };
};