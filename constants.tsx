

import React from 'react';
import { Product, Customer, Supplier, PurchaseOrder, SupplierInvoice, User, Settings, AuditLog, Permission, Role, Quotation, BusinessType } from './types';

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust001', name: 'Walk-in Customer', phone: 'N/A', email: 'walkin@kenpos.co.ke', address: 'N/A', city: 'N/A', dateAdded: new Date('2023-01-01'), loyaltyPoints: 0 },
];

export const MOCK_USERS: User[] = [];

export const MOCK_SUPPLIERS: Supplier[] = [];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [];

export const MOCK_SUPPLIER_INVOICES: SupplierInvoice[] = [];

export const MOCK_QUOTATIONS: Quotation[] = [];

export const MOCK_AUDIT_LOGS: AuditLog[] = [];

export const DEFAULT_SETTINGS: Settings = {
    id: 'kenpos_settings', // Fixed ID for single settings object in DB
    isSetupComplete: false,
    businessType: 'GeneralRetail',
    businessInfo: {
        name: 'My Biashara Ltd.',
        kraPin: 'P000000000X',
        logoUrl: '',
        location: 'Biashara Street, Nairobi',
        phone: '0712 345 678',
        currency: 'KES',
        language: 'en-US',
    },
    tax: {
        vatEnabled: true,
        vatRate: 16,
        pricingType: 'inclusive',
        showEtrQrCode: false,
    },
    discount: {
        enabled: true,
        type: 'percentage',
        maxValue: 10,
    },
    communication: {
        sms: {
            provider: 'none',
            username: 'sandbox',
            apiKey: '',
            senderId: '',
            useSandbox: true,
        },
        email: {
            mailer: 'smtp',
            host: 'smtp.mailtrap.io',
            port: 587,
            username: '',
            password: '',
            encryption: 'tls',
            fromAddress: 'sales@kenpos.co.ke',
            fromName: 'KenPOS Sales',
        },
        whatsapp: {
            provider: 'none',
            apiKey: '',
            apiSecret: '',
            senderPhoneNumber: '',
        },
        mpesa: {
            enabled: false,
            environment: 'sandbox',
            shortcode: '',
            consumerKey: '',
            consumerSecret: '',
            passkey: '',
            callbackUrl: '',
        }
    },
    receipt: {
        footer: 'Thank you for your business!',
        invoicePrefix: 'INV-',
        quotePrefix: 'QUO-',
        poNumberPrefix: 'PO-',
    },
    hardware: {
        printer: {
            type: 'Browser',
            connection: 'USB',
            name: '',
            address: '',
        },
        barcodeScanner: {
            enabled: true,
        },
        barcodePrinter: {
            enabled: false,
            type: 'Image',
            connection: 'USB',
            name: '',
        },
    },
    loyalty: {
        enabled: true,
        pointsPerKsh: 100,
        redemptionRate: 0.5, // 1 point = 0.5 KES
        minRedeemablePoints: 100,
        maxRedemptionPercentage: 50,
    },
    measurements: {
        enabled: false,
        units: ['pc(s)', 'in', 'cm', 'm', 'kg', 'g', 'sq ft', 'ltr', 'hr'],
        templates: [
            { name: "Men's Suit", fields: ["Chest", "Waist", "Sleeve", "Inseam", "Neck", "Shoulder"] },
            { name: "Women's Dress", fields: ["Bust", "Waist", "Hips", "Shoulder to Waist", "Waist to Hem"] },
        ],
    },
    permissions: {
        Admin: ['view_dashboard', 'view_pos', 'view_inventory', 'edit_inventory', 'delete_inventory', 'view_purchases', 'manage_purchases', 'view_ap', 'manage_ap', 'view_tax_reports', 'view_shift_report', 'view_sales_history', 'view_customers', 'manage_customers', 'view_settings', 'view_quotations', 'manage_quotations', 'view_staff', 'manage_staff'],
        Cashier: ['view_pos', 'view_shift_report', 'view_customers'],
        Supervisor: ['view_dashboard', 'view_pos', 'view_inventory', 'edit_inventory', 'view_purchases', 'view_shift_report', 'view_sales_history', 'view_customers', 'manage_customers', 'view_quotations', 'manage_quotations', 'view_staff'],
        Accountant: ['view_dashboard', 'view_purchases', 'manage_purchases', 'view_ap', 'manage_ap', 'view_tax_reports', 'view_sales_history', 'view_customers'],
    }
};

export const BUSINESS_TYPES_CONFIG: { [key in BusinessType]: { name: string; description: string; icon: React.ReactNode; } } = {
    GeneralRetail: {
        name: 'General Retail',
        description: 'For kiosks, shops, boutiques, hardware stores, or any business selling physical items.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
    },
    Restaurant: {
        name: 'Restaurant / Cafe',
        description: 'For businesses serving food and drinks, with features for table management and kitchen orders.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V8.454c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0c.454.303.977.454 1.5.454v7.092zM12 12.546V17.554" /></svg>
    },
    Salon: {
        name: 'Salon / Barber',
        description: 'For spas, salons, and barbershops with appointment booking and stylist management.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l-3 3a5 5 0 00-7.07 7.07l-1.72 1.72a2 2 0 002.83 2.83l1.72-1.72a5 5 0 007.07-7.07l3-3" /></svg>
    },
    Services: {
        name: 'Professional Services',
        description: 'For consultants, repair shops, or any business selling time-based or custom services.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    }
};

export const ICONS = {
    pos: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6h10l-2 7H7" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2.3l.8 4M7 13h10l4-8H5.4" /><circle cx="8" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></svg>,
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zm0 10h6v6H4v-6zM14 4h6v6h-6V4zm0 10h6v6h-6v-6z" /></svg>,
    inventory: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></svg>,
    purchases: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h6l-4 4H1" /><path strokeLinecap="round" strokeLinejoin="round" d="M1 12v6h2a3 3 0 003 3h8a3 3 0 003-3h2v-4l-3-4H8" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /></svg>,
    quotations: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 13H8" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 17H8" /></svg>,
    ap: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3.866 0-7 1.79-7 4s3.134 4 7 4 7-1.79 7-4-3.134-4-7-4z" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 12V6s3.134-4 7-4 7 4 7 4v6" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 12v6s3.134 4 7 4 7-4 7-4v-6" /></svg>,
    tax: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 15h.01" /></svg>,
    shiftReport: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    salesHistory: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    customers: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" /></svg>,
    staff: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    install: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    bell: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    moon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
    sun: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    business: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    hardware: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
    receipt: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20l-4-4m0 0l-4 4m4-4V4H7a2 2 0 00-2 2v12a2 2 0 002 2h10" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 10h4" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 14h4" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 14h.01" /></svg>,
    discount: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5l5 5v5l-5 5H7V3z" /></svg>,
    loyalty: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    measurements: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l-6-2m6 2l3 1m-3-1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2" /></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125" /></svg>,
    email: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    sms: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    whatsapp: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>,
    mpesa: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    audit: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /><circle cx="11.5" cy="11.5" r="4.5" /><path d="M18.5 18.5L22 22" strokeLinecap="round" strokeLinejoin="round"  /></svg>,
    data: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
    reset: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    barcode: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    production: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

export const PERMISSIONS_CONFIG: { module: string; permissions: { id: Permission; label: string }[] }[] = [
    {
        module: "Dashboard",
        permissions: [{ id: 'view_dashboard', label: 'View Dashboard' }]
    },
    {
        module: "Point of Sale (POS)",
        permissions: [
            { id: 'view_pos', label: 'Access POS Screen' },
            { id: 'view_shift_report', label: 'View Own Shift Report' },
            { id: 'view_sales_history', label: 'View All Sales History' }
        ]
    },
    {
        module: "Inventory",
        permissions: [
            { id: 'view_inventory', label: 'View Products' },
            { id: 'edit_inventory', label: 'Add/Edit Products' },
            { id: 'delete_inventory', label: 'Delete Products' }
        ]
    },
    {
        module: "Purchasing",
        permissions: [
            { id: 'view_purchases', label: 'View Purchase Orders' },
            { id: 'manage_purchases', label: 'Create/Edit Purchase Orders' }
        ]
    },
    {
        module: "Accounts Payable",
        permissions: [
            { id: 'view_ap', label: 'View Supplier Invoices' },
            { id: 'manage_ap', label: 'Record Supplier Payments' }
        ]
    },
    {
        module: "Quotations",
        permissions: [
            { id: 'view_quotations', label: 'View Quotations' },
            { id: 'manage_quotations', label: 'Create/Edit Quotations' }
        ]
    },
    {
        module: "Customers",
        permissions: [
            { id: 'view_customers', label: 'View Customers' },
            { id: 'manage_customers', label: 'Add/Edit/Delete Customers' }
        ]
    },
    {
        module: "Staff",
        permissions: [
            { id: 'view_staff', label: 'View Staff List' },
            { id: 'manage_staff', label: 'Add/Edit/Delete Staff' }
        ]
    },
    {
        module: "Reporting & Settings",
        permissions: [
            { id: 'view_tax_reports', label: 'View Tax Reports' },
            { id: 'view_settings', label: 'View & Edit System Settings' }
        ]
    }
];