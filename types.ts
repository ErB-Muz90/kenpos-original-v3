export type BusinessType = 'GeneralRetail' | 'Restaurant' | 'Salon' | 'Services';

export interface Product {
  id: string;
  name: string;
  sku: string;
  ean?: string; // European Article Number / Universal Barcode
  description?: string;
  category: string;
  price: number;
  pricingType: 'inclusive' | 'exclusive';
  productType: 'Inventory' | 'Service';
  costPrice?: number;
  stock: number;
  imageUrl: string;
  unitOfMeasure: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Payment {
  method: 'Cash' | 'M-Pesa' | 'Card' | 'Points';
  amount: number;
  details?: {
    transactionCode?: string;
    phoneNumber?: string;
  }
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
  payments: Payment[];
  change: number;
  customerId: string;
  date: Date;
  synced: boolean;
  cashierId: string;
  cashierName: string;
  shiftId: string;
  // Loyalty fields
  pointsEarned: number;
  pointsUsed: number;
  pointsValue: number;
  pointsBalanceAfter: number;
  // Link to original quotation
  quotationId?: string;
}

export type SaleData = Omit<Sale, 'id' | 'synced' | 'cashierId' | 'cashierName' | 'pointsEarned' | 'pointsBalanceAfter' | 'shiftId'>;

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  dateAdded: Date;
  loyaltyPoints: number;
  measurements?: { [key: string]: string };
}

export interface Supplier {
    id: string;
    name: string;
    contact: string;
    email: string;
    creditTerms: string;
}

export interface PurchaseOrderItem {
    productId: string;
    productName: string;
    quantity: number; // Ordered quantity
    cost: number;
    quantityReceived: number; // Total quantity received for this item so far
    unitOfMeasure: string;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    supplierId: string;
    items: PurchaseOrderItem[];
    status: 'Draft' | 'Sent' | 'Received' | 'Partially Received' | 'Cancelled';
    createdDate: Date;
    expectedDate: Date;
    receivedDate?: Date;
    totalCost: number;
}

export interface PurchaseOrderData {
    supplierId: string;
    items: Omit<PurchaseOrderItem, 'quantityReceived'>[];
    status: 'Draft' | 'Sent';
    expectedDate: Date;
}


export interface SupplierPayment {
    id: string;
    invoiceId: string;
    paymentDate: Date;
    amount: number;
    method: 'Bank Transfer' | 'Cash' | 'M-Pesa';
}

export interface SupplierInvoice {
    id: string;
    invoiceNumber: string;
    purchaseOrderId: string;
    supplierId: string;
    invoiceDate: Date;
    dueDate: Date;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    status: 'Unpaid' | 'Partially Paid' | 'Paid';
}

export interface QuotationItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price at the time of quotation
  pricingType: 'inclusive' | 'exclusive';
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  items: QuotationItem[];
  status: 'Draft' | 'Sent' | 'Invoiced' | 'Expired';
  createdDate: Date;
  expiryDate: Date;
  subtotal: number;
  tax: number;
  total: number;
}


export type Permission = 
  'view_dashboard' | 'view_pos' | 'view_inventory' | 'edit_inventory' | 'delete_inventory' |
  'view_purchases' | 'manage_purchases' | 'view_ap' | 'manage_ap' | 'view_tax_reports' | 
  'view_shift_report' | 'view_customers' | 'manage_customers' | 'view_settings' |
  'view_quotations' | 'manage_quotations' | 'view_staff' | 'manage_staff' | 'view_sales_history';

export type Role = 'Admin' | 'Cashier' | 'Supervisor' | 'Accountant';

export interface User {
  id: string;
  name: string;
  email: string;
  // WARNING: For prototype purposes. In production, use a secure backend for password handling.
  password?: string;
  role: Role;
}

export interface Settings {
    id: string; // Use a fixed ID for the single settings object
    isSetupComplete: boolean;
    businessType: BusinessType;
    businessInfo: {
        name: string;
        kraPin: string;
        logoUrl: string;
        location: string;
        phone: string;
        currency: string;
        language: string;
    };
    tax: {
        vatEnabled: boolean;
        vatRate: number;
        pricingType: 'inclusive' | 'exclusive';
        showEtrQrCode: boolean;
    };
    discount: {
        enabled: boolean;
        type: 'percentage' | 'fixed';
        maxValue: number;
    };
    communication: {
        sms: {
            provider: 'none' | 'africastalking';
            username?: string;
            apiKey?: string;
            senderId?: string;
            useSandbox: boolean;
        };
        email: {
            mailer: 'smtp' | 'sendgrid' | 'mailgun';
            host?: string;
            port?: number;
            username?: string;
            password?: string;
            encryption?: 'none' | 'tls' | 'ssl';
            fromAddress?: string;
            fromName?: string;
        };
        whatsapp: {
            provider: 'none' | 'twilio' | 'meta';
            apiKey?: string;
            apiSecret?: string;
            senderPhoneNumber?: string;
        };
        mpesa: {
            enabled: boolean;
            environment: 'sandbox' | 'production';
            shortcode: string;
            consumerKey: string;
            consumerSecret: string;
            passkey: string;
            callbackUrl: string;
        };
    };
    receipt: {
        footer: string;
        invoicePrefix: string;
        quotePrefix: string;
        poNumberPrefix: string;
    };
    hardware: {
        printer: {
            type: 'Browser' | 'ESC/POS';
            connection: 'USB' | 'Bluetooth' | 'Network';
            name?: string;
            address?: string;
            vendorId?: number;
            productId?: number;
        };
        barcodeScanner: {
            enabled: boolean;
        };
        barcodePrinter: {
            enabled: boolean;
            type: 'ZPL' | 'Image';
            name?: string;
            connection: 'USB' | 'Bluetooth' | 'Network';
        };
    };
    loyalty: {
        enabled: boolean;
        pointsPerKsh: number; // e.g., 100 -> 1 point per 100 KES
        redemptionRate: number; // e.g., 0.5 -> 1 point = 0.5 KES
        minRedeemablePoints: number;
        maxRedemptionPercentage: number; // e.g., 30 -> max 30% of sale can be paid with points
    };
    measurements: {
        enabled: boolean;
        units: string[];
        templates: {
            name: string;
            fields: string[];
        }[];
    };
    permissions: {
        [key in Role]: Permission[];
    };
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'closed';
  
  // Starting state
  startingFloat: number;
  
  // Sales during shift
  salesIds: string[];
  
  // Closing state
  paymentBreakdown?: { [key in Payment['method']]?: number };
  totalSales?: number;
  expectedCashInDrawer?: number;
  actualCashInDrawer?: number;
  cashVariance?: number;
}


export interface AuditLog {
    id: string;
    timestamp: Date;
    userId: string;
    userName: string;
    action: string;
    details: string;
}

export interface ToastData {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

export enum View {
  POS = 'POS',
  Dashboard = 'Dashboard',
  Inventory = 'Inventory',
  Purchases = 'Purchases',
  AccountsPayable = 'AccountsPayable',
  TaxReports = 'TaxReports',
  ShiftReport = 'ShiftReport',
  SalesHistory = 'SalesHistory',
  Customers = 'Customers',
  Quotations = 'Quotations',
  Staff = 'Staff',
  Settings = 'Settings'
}

export interface ReceivedPOItem {
    productId: string;
    productName: string;
    quantityOrdered: number;
    quantityReceived: number; // Quantity received in this specific batch
    cost: number;
    category: string;
    ean: string;
}