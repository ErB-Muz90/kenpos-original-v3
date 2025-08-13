import React, { useState, useCallback, useEffect, useMemo, useRef, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Product, CartItem, Customer, Sale, View, Supplier, PurchaseOrder, SupplierInvoice, SupplierPayment, Role, User, SaleData, Settings, ToastData, AuditLog, Permission, Quotation, PurchaseOrderData, Shift, Payment, PurchaseOrderItem, ReceivedPOItem } from './types';
import { MOCK_CUSTOMERS, MOCK_USERS, DEFAULT_SETTINGS, MOCK_AUDIT_LOGS } from './constants';
import { useThemeManager } from './hooks/useThemeManager';
import { useTheme } from './hooks/useTheme';
import * as db from './utils/offlineDb';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PosView from './components/PosView';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import PurchasesView from './components/PurchasesView';
import AccountsPayableView from './components/AccountsPayableView';
import TaxReportView from './components/TaxReportView';
import ShiftReportView from './components/ShiftReportView';
import SalesHistoryView from './components/salesHistory/SalesHistoryView';
import ReceiptDetailView from './components/salesHistory/ReceiptDetailView';
import SettingsView from './components/SettingsView';
import Toast from './components/common/Toast';
import CustomersView from './components/CustomersView';
import QuotationsView from './components/QuotationsView';
import StaffView from './components/StaffView';
import AdminSignUpView from './components/AdminSignUpView';
import LoginView from './components/LoginView';
import ConfirmationModal from './components/common/ConfirmationModal';
import ReceivePOModal from './components/purchases/ReceivePOModal';
import AddToPOModal from './components/modals/AddToPOModal';
import BarcodePrintModal from './components/inventory/BarcodePrintModal';
import CreateQuotationForm from './components/quotations/CreateQuotationForm';
import QuotationDetailView from './components/quotations/QuotationDetailView';
import InvoiceDetailView from './components/accountsPayable/InvoiceDetailView';
import { round, getPriceBreakdown } from './utils/vatCalculator';
import EmailModal from './components/modals/EmailModal';
import WhatsAppModal from './components/modals/WhatsAppModal';
import SetupWizard from './components/setup/SetupWizard';
import UpdateNotification from './components/common/UpdateNotification';

const MotionDiv = motion.div;
const AnimatedView = ({ children }: { children: ReactNode }) => (
    <MotionDiv
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="absolute top-0 left-0 w-full h-full"
    >
      {children}
    </MotionDiv>
);


const App = () => {
    // --- Theming Hooks ---
    const { currentEvent } = useThemeManager();
    const [theme, toggleTheme] = useTheme();


    // --- App State ---
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState<View>(View.POS);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [updateAvailable, setUpdateAvailable] = useState<ServiceWorkerRegistration | null>(null);
    const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);


    // --- Data State (from IndexedDB) ---
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [supplierInvoices, setSupplierInvoices] = useState<SupplierInvoice[]>([]);
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    
    // --- Component-specific state ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(MOCK_CUSTOMERS[0]?.id || '');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const [isEndingShift, setIsEndingShift] = useState(false);
    const [shiftReportToShow, setShiftReportToShow] = useState<Shift | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [poToReceive, setPoToReceive] = useState<PurchaseOrder | null>(null);
    const [productForPO, setProductForPO] = useState<Product | null>(null);
    const [productToPrintBarcode, setProductToPrintBarcode] = useState<Product | null>(null);
    const [isCreateQuoteModalOpen, setIsCreateQuoteModalOpen] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const [originatingQuoteId, setOriginatingQuoteId] = useState<string | null>(null);
    const [invoiceToView, setInvoiceToView] = useState<SupplierInvoice | null>(null);
    const [saleToView, setSaleToView] = useState<Sale | null>(null);
    const [emailInfo, setEmailInfo] = useState<{ documentType: 'Receipt' | 'Quotation' | 'Proforma-Invoice' | 'SupplierInvoice' | 'PurchaseOrder', documentId: string, recipientId: string } | null>(null);
    const [whatsAppInfo, setWhatsAppInfo] = useState<{ mode: 'receipt' | 'bulk' | 'po', customerId?: string, documentId?: string, supplierId?: string } | null>(null);


    // --- Offline Management ---
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [queuedOrderCount, setQueuedOrderCount] = useState(0);
    const [offlineSales, setOfflineSales] = useState<Sale[]>([]);


    // --- Utility Functions ---
    const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
        const newToast: ToastData = { id: Date.now(), message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
        }, 3000);
    }, []);

    const addAuditLog = useCallback((action: string, details: string) => {
        const user = currentUser; // Capture currentUser at the time of calling
        if (!user) return;
        const newLog: AuditLog = {
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            userId: user.id,
            userName: user.name,
            action,
            details
        };
        setAuditLogs(prev => {
            const updatedLogs = [newLog, ...prev];
            db.saveItem('auditLogs', newLog);
            return updatedLogs;
        });
    }, [currentUser]);

    const updateOfflineState = useCallback(async () => {
        try {
            const count = await db.getQueuedOrderCount();
            setQueuedOrderCount(count);
            const orders = await db.getAllItems<Sale>('orderQueue');
            setOfflineSales(orders);
        } catch (e) {
            console.error("Failed to update offline state:", e);
        }
    }, []);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);
    
    // --- Main App Initialization ---
    useEffect(() => {
        setIsOnline(navigator.onLine);

        const initializeApp = async () => {
            await db.initDB();
            
            const [
                dbProducts, dbCustomers, dbSales, dbSuppliers,
                dbPurchaseOrders, dbSupplierInvoices, dbQuotations,
                dbUsers, dbSettings, dbAuditLogs, dbShifts, storedCart
            ] = await Promise.all([
                db.getAllItems<Product>('products'),
                db.getAllItems<Customer>('customers'),
                db.getAllItems<Sale>('sales'),
                db.getAllItems<Supplier>('suppliers'),
                db.getAllItems<PurchaseOrder>('purchaseOrders'),
                db.getAllItems<SupplierInvoice>('supplierInvoices'),
                db.getAllItems<Quotation>('quotations'),
                db.getAllItems<User>('users'),
                db.getItem<Settings>('settings', 'kenpos_settings'),
                db.getAllItems<AuditLog>('auditLogs'),
                db.getAllItems<Shift>('shifts'),
                db.getAllItems<CartItem>('cart')
            ]);
            
            setProducts(dbProducts);
            setCustomers(dbCustomers.length > 0 ? dbCustomers : MOCK_CUSTOMERS);
            setSales(dbSales);
            setSuppliers(dbSuppliers);
            setPurchaseOrders(dbPurchaseOrders);
            setSupplierInvoices(dbSupplierInvoices);
            setQuotations(dbQuotations);
            setUsers(dbUsers);
            setAuditLogs(dbAuditLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setShifts(dbShifts);
            setSettings(dbSettings || DEFAULT_SETTINGS);

            if (dbCustomers.length === 0) { db.saveItem('customers', MOCK_CUSTOMERS[0]); }
            if (!dbSettings) { db.saveItem('settings', DEFAULT_SETTINGS); }
            
            setCart(storedCart);
            await updateOfflineState();
            setIsAppLoading(false);
        };
        
        const registerServiceWorker = () => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
              console.log('SW registered: ', registration);
              registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker) {
                  installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      console.log('New SW is installed and waiting.');
                      const event = new CustomEvent('swUpdate', { detail: registration });
                      window.dispatchEvent(event);
                    }
                  };
                }
              };
            }).catch(registrationError => {
              console.log('SW registration failed: ', registrationError);
            });
          }
        };

        window.addEventListener('load', registerServiceWorker);
        initializeApp();

        const handleOnline = async () => {
            setIsOnline(true);
            showToast('You are back online. Syncing pending sales...', 'info');
            setIsSyncing(true);
            const { success, failed, syncedOrders } = await db.syncPendingOrders();
            setIsSyncing(false);
            if (success > 0) {
                showToast(`Successfully synced ${success} offline sales.`, 'success');
                setSales(prev => [...syncedOrders, ...prev]);
                syncedOrders.forEach(order => db.saveItem('sales', order));
            }
            if (failed > 0) {
                showToast(`Failed to sync ${failed} sales. Will retry later.`, 'error');
            }
            await updateOfflineState();
        };

        const handleOffline = () => {
            setIsOnline(false);
            showToast('You are now offline. Sales will be queued.', 'info');
        };
        
        const handleSwUpdate = (e: Event) => {
            const registration = (e as CustomEvent).detail;
            setUpdateAvailable(registration);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('swUpdate', handleSwUpdate);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('swUpdate', handleSwUpdate);
        };
    }, [showToast, updateOfflineState]);
    
    // --- Core Business Logic Handlers ---

    const handleAppUpdate = () => {
        if (updateAvailable && updateAvailable.waiting) {
            updateAvailable.waiting.postMessage({ type: 'SKIP_WAITING' });
            let refreshing;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                window.location.reload();
                refreshing = true;
            });
        }
    };
    
    const handleInstallClick = async () => {
        if (!installPromptEvent) {
            return;
        }
        (installPromptEvent as any).prompt();
        const { outcome } = await (installPromptEvent as any).userChoice;
        if (outcome === 'accepted') {
            showToast('App installed successfully!', 'success');
        }
        setInstallPromptEvent(null);
    };

    // Auth & User Management
    const handleSignUp = (userData: Omit<User, 'id' | 'role'>): void => {
        if (users.length > 0) {
            showToast("New accounts must be created by an administrator in the Staff panel.", "error");
            return;
        }
        const newUser: User = {
            ...userData,
            id: `user_${Date.now()}`,
            role: 'Admin',
        };
        setUsers([newUser]);
        db.saveItem('users', newUser);
        setCurrentUser(newUser);
        setIsAuthenticated(true);
        addAuditLog('INITIAL_ADMIN_SIGNUP', `Initial admin user ${newUser.name} created.`);
        showToast(`Welcome, ${newUser.name}! Your admin account is ready.`, 'success');
    };

    const handleLogin = (email: string, password: string): boolean => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.password && user.password === password) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            addAuditLog('USER_LOGIN', `User ${user.name} logged in.`);
            showToast(`Welcome, ${user.name}!`, 'success');
            return true;
        } else {
            showToast('Invalid email or password.', 'error');
            return false;
        }
    };

    const handleLogout = () => {
        if (activeShift) {
            showToast("Cannot log out during an active shift. Please end your shift first.", "error");
            return;
        }
        addAuditLog('USER_LOGOUT', `User ${currentUser?.name} logged out.`);
        setCurrentUser(null);
        setIsAuthenticated(false);
        setCurrentView(View.POS);
    };

    // Find active shift for current user on load or user change
    useEffect(() => {
        if (currentUser) {
            const foundShift = shifts.find(s => s.userId === currentUser.id && s.status === 'active');
            setActiveShift(foundShift || null);
        } else {
            setActiveShift(null);
        }
    }, [currentUser, shifts]);
    
    // Persist cart to IndexedDB whenever it changes
    useEffect(() => {
        db.saveAllItems('cart', cart);
    }, [cart]);
    
    // Prevent user from accessing unauthorized views
    useEffect(() => {
        if (!currentUser) return;
        const userPermissions = settings.permissions[currentUser.role];
        const viewPermissionMap: Record<View, Permission | undefined> = {
            [View.POS]: 'view_pos',
            [View.Dashboard]: 'view_dashboard',
            [View.Inventory]: 'view_inventory',
            [View.Purchases]: 'view_purchases',
            [View.AccountsPayable]: 'view_ap',
            [View.TaxReports]: 'view_tax_reports',
            [View.ShiftReport]: 'view_shift_report',
            [View.SalesHistory]: 'view_sales_history',
            [View.Customers]: 'view_customers',
            [View.Quotations]: 'view_quotations',
            [View.Staff]: 'view_staff',
            [View.Settings]: 'view_settings',
        };
        const requiredPermission = viewPermissionMap[currentView];
        if (requiredPermission && !userPermissions.includes(requiredPermission)) {
            showToast("You don't have permission to access this view.", "error");
            setCurrentView(View.POS); // Redirect to a safe default
        }
    }, [currentUser, currentView, settings.permissions, showToast]);
    
     // Reset detail views when switching main views
    useEffect(() => {
        setSelectedQuotation(null);
        setInvoiceToView(null);
        setSaleToView(null);
        if (currentView !== View.POS) {
            setOriginatingQuoteId(null);
        }
    }, [currentView]);


    // Cart Management
    const addToCart = useCallback((product: Product) => {
        if (product.stock <= 0 && product.productType === 'Inventory') {
            showToast(`${product.name} is out of stock.`, 'error');
            return;
        }
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                if (product.productType === 'Inventory' && existingItem.quantity >= product.stock) {
                    showToast(`No more stock available for ${product.name}.`, 'error');
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    }, [showToast]);

    const updateCartItemQuantity = useCallback((productId: string, quantity: number) => {
        setCart(prevCart => {
            if (quantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }
            return prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            );
        });
    }, []);
    
    const removeFromCart = useCallback((productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setOriginatingQuoteId(null);
    }, []);

    // Sale Completion
    const completeSale = useCallback((saleData: SaleData): Sale => {
        if (!activeShift || !currentUser) {
            showToast("Cannot complete sale. No active shift.", "error");
            throw new Error("Cannot complete sale without an active shift or user.");
        }

        const { loyalty } = settings;
        let pointsEarned = 0;
        let pointsBalanceAfter = 0;
        
        const customer = customers.find(c => c.id === saleData.customerId);
       
        if (loyalty.enabled && customer && customer.id !== 'cust001') {
            const amountForPoints = saleData.total - (saleData.pointsValue || 0);
            pointsEarned = Math.floor(amountForPoints / loyalty.pointsPerKsh);
            const currentPoints = customer.loyaltyPoints;
            pointsBalanceAfter = currentPoints - (saleData.pointsUsed || 0) + pointsEarned;
            const updatedCustomer = { ...customer, loyaltyPoints: pointsBalanceAfter };
            setCustomers(prev => {
                const updated = prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
                db.saveItem('customers', updatedCustomer);
                return updated;
            });
        }

        const newSale: Sale = {
            ...saleData,
            id: `${settings.receipt.invoicePrefix}${new Date().getTime()}`,
            synced: isOnline,
            cashierId: currentUser.id,
            cashierName: currentUser.name,
            shiftId: activeShift.id,
            pointsEarned,
            pointsBalanceAfter,
            quotationId: originatingQuoteId,
        };
        
        setActiveShift(prev => {
            if (!prev) return null;
            const updatedShift = { ...prev, salesIds: [...prev.salesIds, newSale.id]};
            setShifts(s => {
                const updated = s.map(shift => shift.id === updatedShift.id ? updatedShift : shift);
                db.saveItem('shifts', updatedShift);
                return updated;
            });
            return updatedShift;
        });

        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            let changed = false;
            newSale.items.forEach(soldItem => {
                if (soldItem.productType === 'Inventory') {
                    const productIndex = newProducts.findIndex(p => p.id === soldItem.id);
                    if (productIndex !== -1) {
                        newProducts[productIndex].stock -= soldItem.quantity;
                        db.saveItem('products', newProducts[productIndex]);
                        changed = true;
                    }
                }
            });
            return changed ? newProducts : prevProducts;
        });

        if (isOnline) {
             setSales(prevSales => {
                 const updated = [newSale, ...prevSales];
                 db.saveItem('sales', newSale);
                 return updated;
             });
        } else {
            db.saveItem('orderQueue', newSale).then(updateOfflineState);
        }
        
        addAuditLog('SALE_COMPLETE', `Completed sale ${newSale.id} for ${newSale.total.toFixed(2)}.`);
        clearCart();
        return newSale;
    }, [clearCart, isOnline, currentUser, customers, settings, activeShift, originatingQuoteId, addAuditLog, updateOfflineState]);

    // Shift Management
    const handleStartShift = (startingFloat: number) => {
        if (activeShift || !currentUser) {
            showToast("A shift is already active or user not logged in.", 'error');
            return;
        }
        const newShift: Shift = {
            id: `shift_${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            startTime: new Date(),
            status: 'active',
            startingFloat,
            salesIds: [],
        };
        setActiveShift(newShift);
        setShifts(prev => {
            const updated = [...prev, newShift];
            db.saveItem('shifts', newShift);
            return updated;
        });
        addAuditLog('SHIFT_START', `Shift started with float ${startingFloat.toFixed(2)}.`);
        showToast("Shift started successfully.", 'success');
    };

    const handleEndShift = (actualCashInDrawer: number) => {
        if (!activeShift) {
            showToast("No active shift to end.", 'error');
            return;
        }

        const shiftSales = sales.filter(s => activeShift.salesIds.includes(s.id));
        const paymentBreakdown: { [key in Payment['method']]?: number } = {};
        let cashChange = 0;
        
        shiftSales.forEach(sale => {
            sale.payments.forEach(p => {
                paymentBreakdown[p.method] = (paymentBreakdown[p.method] || 0) + p.amount;
            });
            cashChange += sale.change;
        });

        const expectedCashInDrawer = activeShift.startingFloat + (paymentBreakdown['Cash'] || 0) - cashChange;

        const closedShift: Shift = {
            ...activeShift,
            status: 'closed',
            endTime: new Date(),
            paymentBreakdown,
            totalSales: shiftSales.reduce((sum, s) => sum + s.total, 0),
            expectedCashInDrawer,
            actualCashInDrawer,
            cashVariance: Number((actualCashInDrawer - expectedCashInDrawer).toFixed(2)),
        };

        setShifts(prev => {
            const updated = prev.map(s => s.id === closedShift.id ? closedShift : s);
            db.saveItem('shifts', closedShift);
            return updated;
        });
        setActiveShift(null);
        setIsEndingShift(false);
        setShiftReportToShow(closedShift);
        addAuditLog('SHIFT_END', `Shift ended. Variance: ${closedShift.cashVariance?.toFixed(2)}.`);
        showToast("Shift closed successfully.", 'success');
    };

    // Settings & User Admin
    const updateSettings = (newSettings: Partial<Settings>) => {
        const updatedSettings = {...settings, ...newSettings};
        setSettings(updatedSettings);
        db.saveItem('settings', updatedSettings);
        addAuditLog('UPDATE_SETTINGS', 'System settings updated.');
        showToast('Settings saved successfully!');
    };
    
    const addUser = (user: Omit<User, 'id'>) => {
        if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
            showToast('A user with this email already exists.', 'error');
            return;
        }
        const newUser: User = { ...user, id: `user_${Date.now()}` };
        setUsers(prev => {
            const updated = [...prev, newUser];
            db.saveItem('users', newUser);
            return updated;
        });
        addAuditLog('ADD_USER', `Added new user: ${user.name} (${user.email}).`);
        showToast('User added successfully!');
    };
    
    const updateUser = (updatedUser: User) => {
        setUsers(prev => {
            const updated = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
            db.saveItem('users', updatedUser);
            return updated;
        });
        addAuditLog('UPDATE_USER', `Updated user: ${updatedUser.name}.`);
        showToast('User updated successfully!');
    };

    const deleteUser = (userId: string) => {
        if (userId === currentUser?.id) {
            showToast('Cannot delete the currently logged-in user.', 'error');
            return;
        }
        const userToDelete = users.find(u => u.id === userId);
        const adminUsers = users.filter(u => u.role === 'Admin');
        if (userToDelete && userToDelete.role === 'Admin' && adminUsers.length <= 1) {
            showToast('Cannot delete the last Admin user.', 'error');
            return;
        }

        setUsers(prev => {
            db.deleteItem('users', userId);
            return prev.filter(u => u.id !== userId);
        });
        addAuditLog('DELETE_USER', `Deleted user: ${userToDelete?.name || userId}.`);
        showToast('User deleted successfully!');
    };

    // Product Management
    const addProduct = useCallback((productData: Omit<Product, 'id' | 'stock'>): Product => {
        const newProduct: Product = {
            ...productData,
            id: `prod_${new Date().getTime()}`,
            stock: productData.productType === 'Service' ? 99999 : 0, // New products start with 0 stock unless service
            unitOfMeasure: productData.unitOfMeasure || 'pc(s)',
        };
        setProducts(prevProducts => {
            const updated = [newProduct, ...prevProducts];
            db.saveItem('products', newProduct);
            return updated;
        });
        addAuditLog('ADD_PRODUCT', `Created product: ${newProduct.name} (SKU: ${newProduct.sku})`);
        showToast('New product created successfully!', 'success');
        return newProduct;
    }, [showToast, addAuditLog]);

    const updateProduct = useCallback((updatedProduct: Product) => {
        setProducts(prevProducts => {
            const updated = prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);
            db.saveItem('products', updatedProduct);
            return updated;
        });
        addAuditLog('UPDATE_PRODUCT', `Updated product: ${updatedProduct.name} (ID: ${updatedProduct.id})`);
        showToast('Product updated successfully!', 'success');
    }, [addAuditLog, showToast]);
    
    const deleteProduct = useCallback(() => {
        if (!productToDelete) return;
        setProducts(prev => {
            db.deleteItem('products', productToDelete.id);
            return prev.filter(p => p.id !== productToDelete.id);
        });
        addAuditLog('DELETE_PRODUCT', `Deleted product: ${productToDelete.name} (ID: ${productToDelete.id})`);
        showToast('Product deleted successfully!', 'success');
        setProductToDelete(null);
    }, [productToDelete, addAuditLog, showToast]);

    const handleImportProducts = (importedProducts: Omit<Product, 'id' | 'stock'>[]) => {
        let updatedCount = 0;
        let addedCount = 0;

        const updatedProductList = [...products];
        const productSkuMap = new Map(updatedProductList.map((p, index) => [p.sku, { product: p, index }]));

        importedProducts.forEach(newProd => {
            const existing = productSkuMap.get(newProd.sku);
            if (existing) {
                // Update existing product
                const existingProductWithStock = { ...updatedProductList[existing.index] };
                updatedProductList[existing.index] = { 
                    ...existingProductWithStock, 
                    ...newProd,
                    unitOfMeasure: newProd.unitOfMeasure || 'pc(s)',
                };
                db.saveItem('products', updatedProductList[existing.index]);
                updatedCount++;
            } else {
                // Add new product
                const newProductWithId: Product = {
                    ...newProd,
                    id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    stock: newProd.productType === 'Service' ? 99999 : 0,
                    unitOfMeasure: newProd.unitOfMeasure || 'pc(s)',
                };
                updatedProductList.push(newProductWithId);
                db.saveItem('products', newProductWithId);
                addedCount++;
            }
        });

        setProducts(updatedProductList);
        addAuditLog('IMPORT_PRODUCTS', `Imported products via CSV. Added: ${addedCount}, Updated: ${updatedCount}.`);
        showToast(`Products imported: ${addedCount} new, ${updatedCount} updated.`, 'success');
    };

    // Customer Management
    const addCustomer = (customerData: Omit<Customer, 'id' | 'dateAdded' | 'loyaltyPoints'>) => {
        if (customers.some(c => c.phone === customerData.phone && c.phone !== 'N/A')) {
            showToast('A customer with this phone number already exists.', 'error');
            return;
        }
        const newCustomer: Customer = {
            ...customerData,
            id: `cust_${Date.now()}`,
            dateAdded: new Date(),
            loyaltyPoints: 0,
        };
        setCustomers(prev => {
            const updated = [newCustomer, ...prev];
            db.saveItem('customers', newCustomer);
            return updated;
        });
        addAuditLog('ADD_CUSTOMER', `Added customer: ${newCustomer.name}.`);
        showToast('Customer added successfully!');
    };
    
    const updateCustomer = (updatedCustomer: Customer) => {
        setCustomers(prev => {
            const updated = prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
            db.saveItem('customers', updatedCustomer);
            return updated;
        });
        addAuditLog('UPDATE_CUSTOMER', `Updated customer: ${updatedCustomer.name}.`);
        showToast('Customer updated successfully!');
    };
    
    const deleteCustomer = (customerId: string) => {
        if (customerId === 'cust001') {
            showToast('Cannot delete the default Walk-in Customer.', 'error');
            return;
        }
        setCustomers(prev => {
            db.deleteItem('customers', customerId);
            return prev.filter(c => c.id !== customerId);
        });
        addAuditLog('DELETE_CUSTOMER', `Deleted customer ID: ${customerId}.`);
        showToast('Customer deleted successfully!');
    };

    // Supplier Management
    const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
        if (suppliers.some(s => s.name.toLowerCase() === supplierData.name.toLowerCase())) {
            showToast('A supplier with this name already exists.', 'error');
            return null;
        }
        const newSupplier: Supplier = {
            ...supplierData,
            id: `sup_${Date.now()}`,
        };
        setSuppliers(prev => {
            const updated = [newSupplier, ...prev];
            db.saveItem('suppliers', newSupplier);
            return updated;
        });
        addAuditLog('ADD_SUPPLIER', `Added supplier: ${newSupplier.name}.`);
        showToast('Supplier added successfully!');
        return newSupplier;
    };

    // Purchase Order Management
    const addPurchaseOrder = useCallback((poData: PurchaseOrderData): PurchaseOrder => {
        const newPO: PurchaseOrder = {
            id: `po_${Date.now()}`,
            poNumber: `${settings.receipt.poNumberPrefix}${Date.now().toString().slice(-6)}`,
            supplierId: poData.supplierId,
            items: poData.items.map(item => ({ ...item, quantityReceived: 0 })),
            status: poData.status,
            createdDate: new Date(),
            expectedDate: poData.expectedDate,
            totalCost: poData.items.reduce((acc, item) => acc + (item.cost * item.quantity), 0),
        };
        setPurchaseOrders(prev => {
            const updated = [newPO, ...prev];
            db.saveItem('purchaseOrders', newPO);
            return updated;
        });
        addAuditLog('ADD_PO', `Created PO ${newPO.poNumber} with status ${poData.status}.`);
        showToast(`Purchase Order ${newPO.poNumber} created as ${poData.status}.`, 'success');
        return newPO;
    }, [showToast, addAuditLog, settings.receipt.poNumberPrefix]);

    const handleSendPO = useCallback((poId: string) => {
        const po = purchaseOrders.find(p => p.id === poId);
        setPurchaseOrders(prevPOs => {
            return prevPOs.map(p => {
                if (p.id === poId && p.status === 'Draft') {
                    const updatedPO = { ...p, status: 'Sent' as 'Sent' };
                    db.saveItem('purchaseOrders', updatedPO);
                    return updatedPO;
                }
                return p;
            });
        });
        addAuditLog('SEND_PO', `PO ${po?.poNumber} status changed from Draft to Sent.`);
        showToast(`Purchase Order ${po?.poNumber} has been sent.`, 'success');
    }, [purchaseOrders, addAuditLog, showToast]);

    const receivePurchaseOrder = useCallback((poId: string, receivedItemsFromModal: ReceivedPOItem[]) => {
        // 1. Find the original PO and create a modifiable copy.
        const originalPO = purchaseOrders.find(po => po.id === poId);
        if (!originalPO) {
            showToast('Purchase order not found.', 'error');
            return;
        }
        const updatedPO = JSON.parse(JSON.stringify(originalPO)); // Deep copy to avoid mutation issues
    
        // 2. Update the PO items with the quantities received in this batch.
        receivedItemsFromModal.forEach(receivedItem => {
            const itemIndex = updatedPO.items.findIndex((poItem: PurchaseOrderItem) => poItem.productId === receivedItem.productId);
            if (itemIndex !== -1) {
                 updatedPO.items[itemIndex].quantityReceived = (updatedPO.items[itemIndex].quantityReceived || 0) + receivedItem.quantityReceived;
            }
        });
    
        // 3. Determine the new status of the PO.
        const allItemsReceived = updatedPO.items.every((item: PurchaseOrderItem) => (item.quantityReceived || 0) >= item.quantity);
        const someItemsReceived = updatedPO.items.some((item: PurchaseOrderItem) => (item.quantityReceived || 0) > 0);
        if (allItemsReceived) {
            updatedPO.status = 'Received';
        } else if (someItemsReceived) {
            updatedPO.status = 'Partially Received';
        }
        updatedPO.receivedDate = new Date();
    
        // 4. Update state for Purchase Orders.
        setPurchaseOrders(prevPOs => {
            const updatedList = prevPOs.map(po => po.id === poId ? updatedPO : po);
            db.saveItem('purchaseOrders', updatedPO);
            return updatedList;
        });
    
        // 5. Update product stock levels.
        setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            receivedItemsFromModal.forEach(item => {
                const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    const productToUpdate = { ...updatedProducts[productIndex] };
                    if (productToUpdate.productType === 'Inventory') {
                        productToUpdate.stock += item.quantityReceived;
                    }
                    productToUpdate.category = item.category;
                    productToUpdate.ean = item.ean;
                    updatedProducts[productIndex] = productToUpdate;
                    db.saveItem('products', productToUpdate);
                }
            });
            return updatedProducts;
        });
    
        // 6. Generate and save a Supplier Invoice for the received items.
        if (receivedItemsFromModal.some(item => item.quantityReceived > 0)) {
            const totalReceivedCost = receivedItemsFromModal.reduce((acc, item) => acc + (item.cost * item.quantityReceived), 0);
            
            const { tax } = settings;
            const { basePrice, vatAmount } = getPriceBreakdown(totalReceivedCost, tax.pricingType, tax.vatRate / 100);
            
            const supplier = suppliers.find(s => s.id === updatedPO.supplierId);
            const creditDays = supplier ? parseInt(supplier.creditTerms.replace('Net ', '')) || 30 : 30;
            const invoiceDate = new Date();
            const dueDate = new Date(invoiceDate);
            dueDate.setDate(dueDate.getDate() + creditDays);
    
            const newInvoice: SupplierInvoice = {
                id: `inv_${Date.now()}`,
                invoiceNumber: `INV-${updatedPO.poNumber}-${Date.now().toString().slice(-5)}`,
                purchaseOrderId: updatedPO.id,
                supplierId: updatedPO.supplierId,
                invoiceDate,
                dueDate,
                subtotal: round(tax.pricingType === 'inclusive' ? basePrice : totalReceivedCost),
                taxAmount: round(tax.pricingType === 'inclusive' ? vatAmount : totalReceivedCost * (tax.vatRate/100)),
                totalAmount: round(totalReceivedCost),
                paidAmount: 0,
                status: 'Unpaid'
            };
    
            setSupplierInvoices(prev => {
                const updated = [newInvoice, ...prev];
                db.saveItem('supplierInvoices', newInvoice);
                return updated;
            });
            addAuditLog('RECEIVE_PO', `Received stock for PO ${updatedPO.poNumber}. Generated Invoice ${newInvoice.invoiceNumber}.`);
            showToast(`Stock for PO ${updatedPO.poNumber} received.`, 'success');
        }
    }, [purchaseOrders, suppliers, settings.tax, addAuditLog, showToast]);
    
    const poToReceiveBreakdown = useMemo(() => {
        if (!poToReceive) return null;

        const { tax } = settings;
        let subtotal: number;
        let taxAmount: number;
        let totalAmount: number;
        
        if (tax.pricingType === 'inclusive') {
            totalAmount = poToReceive.totalCost;
            const breakdown = getPriceBreakdown(totalAmount, 'inclusive', tax.vatRate / 100);
            subtotal = breakdown.basePrice;
            taxAmount = breakdown.vatAmount;
        } else { // exclusive
            subtotal = poToReceive.totalCost;
            taxAmount = subtotal * (tax.vatRate / 100);
            totalAmount = subtotal + taxAmount;
        }
        
        return {
            subtotal: round(subtotal),
            tax: round(taxAmount),
            total: round(totalAmount),
        };

    }, [poToReceive, settings.tax]);

    const handleConfirmAddToPO = (
        product: Product, 
        quantity: number, 
        poId: string | 'new', 
        supplierId?: string
    ) => {
        const poItem: Omit<PurchaseOrderItem, 'quantityReceived'> = {
            productId: product.id,
            productName: product.name,
            quantity: quantity,
            cost: product.costPrice || 0,
            unitOfMeasure: product.unitOfMeasure,
        };

        if (poId === 'new') {
            if (!supplierId) {
                showToast('A supplier must be selected to create a new PO.', 'error');
                return;
            }
            addPurchaseOrder({
                supplierId: supplierId,
                items: [poItem],
                status: 'Draft',
                expectedDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default 1 week
            });
            showToast(`New PO created for ${product.name}.`, 'success');
        } else {
            setPurchaseOrders(prevPOs => prevPOs.map(po => {
                if (po.id === poId) {
                    const updatedPO = { ...po };
                    const existingItemIndex = updatedPO.items.findIndex(item => item.productId === product.id);
                    if (existingItemIndex > -1) {
                        updatedPO.items[existingItemIndex].quantity += quantity;
                    } else {
                        updatedPO.items.push({ ...poItem, quantityReceived: 0 });
                    }
                    // Recalculate total cost
                    updatedPO.totalCost = updatedPO.items.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
                    db.saveItem('purchaseOrders', updatedPO);
                    showToast(`${product.name} added to PO ${po.poNumber}.`, 'success');
                    return updatedPO;
                }
                return po;
            }));
        }
        setProductForPO(null); // Close the modal
    };


    // Accounts Payable
    const recordSupplierPayment = useCallback((invoiceId: string, payment: Omit<SupplierPayment, 'id' | 'invoiceId'>) => {
        setSupplierInvoices(prevInvoices => 
            prevInvoices.map(invoice => {
                if (invoice.id === invoiceId) {
                    const newPaidAmount = invoice.paidAmount + payment.amount;
                    let newStatus: SupplierInvoice['status'] = 'Partially Paid';
                    if (newPaidAmount >= invoice.totalAmount) {
                        newStatus = 'Paid';
                    }
                     addAuditLog('RECORD_SUPPLIER_PAYMENT', `Paid ${payment.amount} for invoice ${invoice.invoiceNumber}.`);
                    const updatedInvoice = {
                        ...invoice,
                        paidAmount: newPaidAmount,
                        status: newStatus
                    };
                    db.saveItem('supplierInvoices', updatedInvoice);
                    return updatedInvoice;
                }
                return invoice;
            })
        );
        showToast('Supplier payment recorded successfully.', 'success');
    }, [addAuditLog, showToast]);

    // Quotations
    const addQuotation = useCallback((quotation: Omit<Quotation, 'id'>) => {
        const newQuotation: Quotation = {
            ...quotation,
            id: `quo_${Date.now()}`,
        };
        setQuotations(prev => {
            const updated = [newQuotation, ...prev];
            db.saveItem('quotations', newQuotation);
            return updated;
        });
        addAuditLog('ADD_QUOTATION', `Created quotation ${newQuotation.quoteNumber}.`);
        showToast('Quotation created successfully!');
        setIsCreateQuoteModalOpen(false);
        setSelectedQuotation(newQuotation);
    }, [showToast, addAuditLog]);

    const convertQuoteToSale = useCallback((quote: Quotation) => {
        if (!activeShift) {
            showToast('Please start a shift before converting a quote.', 'error');
            return;
        }
        const quoteCartItems: CartItem[] = quote.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                showToast(`Product "${item.productName}" is no longer available.`, 'error');
                return null;
            }
            if (product.stock < item.quantity && product.productType === 'Inventory') {
                showToast(`Not enough stock for "${item.productName}". Available: ${product.stock}, Quoted: ${item.quantity}`, 'error');
                return null;
            }
            return { ...product, quantity: item.quantity, price: item.price }; // Use quoted price
        }).filter((item): item is CartItem => item !== null);
        
        if (quoteCartItems.length !== quote.items.length) {
            showToast('Could not convert quote due to missing products or insufficient stock.', 'error');
            return;
        }
        
        setCart(quoteCartItems);
        setSelectedCustomerId(quote.customerId);
        setOriginatingQuoteId(quote.id);
        setCurrentView(View.POS);
        setQuotations(prev => prev.map(q => {
            if (q.id === quote.id) {
                const updatedQuote = {...q, status: 'Invoiced' as 'Invoiced'};
                db.saveItem('quotations', updatedQuote);
                return updatedQuote;
            }
            return q;
        }));
        addAuditLog('CONVERT_QUOTE', `Converted quote ${quote.quoteNumber} to sale.`);
        showToast(`Quote #${quote.quoteNumber} loaded into POS.`, 'info');
    }, [products, showToast, activeShift, addAuditLog]);

    // Communication
    const handleEmailRequest = (documentType: 'Receipt' | 'Quotation' | 'Proforma-Invoice' | 'SupplierInvoice' | 'PurchaseOrder', documentId: string, recipientId: string) => {
        setEmailInfo({ documentType, documentId, recipientId });
    };

    const handleSendEmail = (recipientEmail: string) => {
        if (!emailInfo) return;
        // In a real app, this would trigger a backend API call.
        addAuditLog('EMAIL_SENT', `Sent ${emailInfo.documentType.replace('-',' ')} ${emailInfo.documentId} to ${recipientEmail}.`);
        showToast(`${emailInfo.documentType.replace('-',' ')} sent to ${recipientEmail} successfully!`, 'success');
        setEmailInfo(null);
    };

    const recipientForEmail = useMemo(() => {
        if (!emailInfo) return null;
        if (['SupplierInvoice', 'PurchaseOrder'].includes(emailInfo.documentType)) {
            const supplier = suppliers.find(s => s.id === emailInfo.recipientId);
            return supplier ? { name: supplier.name, email: supplier.email } : null;
        }
        const customer = customers.find(c => c.id === emailInfo.recipientId);
        return customer ? { name: customer.name, email: customer.email } : null;
    }, [emailInfo, customers, suppliers]);

    const handleSendWhatsApp = useCallback((recipients: (Customer | Supplier)[], message: string) => {
        if (settings.communication.whatsapp.provider === 'none') {
            showToast('WhatsApp provider is not configured in settings.', 'error');
            return;
        }
        const recipientCount = recipients.length;
        addAuditLog('WHATSAPP_SENT', `Sent ${whatsAppInfo?.mode === 'receipt' ? 'receipt' : 'bulk message'} to ${recipientCount} recipients.`);
        showToast(`WhatsApp message sent to ${recipientCount} recipients successfully!`, 'success');
        setWhatsAppInfo(null);
    }, [whatsAppInfo, addAuditLog, showToast, settings.communication.whatsapp.provider]);

    const recipientForWhatsApp = useMemo(() => {
        if (!whatsAppInfo) return undefined;
        if (whatsAppInfo.customerId) return customers.find(c => c.id === whatsAppInfo.customerId);
        if (whatsAppInfo.supplierId) return suppliers.find(s => s.id === whatsAppInfo.supplierId);
        return undefined;
    }, [whatsAppInfo, customers, suppliers]);

    // Data Management
    const handleBackupData = async () => {
        try {
            const backupData = await db.getAllData();
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(backupData, null, 2)
            )}`;
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = jsonString;
            link.download = `kenpos_backup_${date}.json`;
            link.click();
            addAuditLog('BACKUP_DATA', 'Full system data backup downloaded.');
            showToast('System backup downloaded successfully.', 'success');
        } catch (error) {
            console.error('Backup failed:', error);
            showToast('Failed to create backup file.', 'error');
        }
    };

    const handleRestoreData = async (backupData: any) => {
        try {
            if (!backupData || typeof backupData !== 'object' || !backupData.users || !backupData.settings) {
                throw new Error("Invalid or corrupted backup file.");
            }
            
            await db.restoreAllData(backupData);

            addAuditLog('RESTORE_DATA', 'System data restored from backup file.');
            showToast('System data restored successfully! The application will now reload.', 'success');
            
            setTimeout(() => window.location.reload(), 2000);

        } catch (error: any) {
            console.error('Restore failed:', error);
            showToast(`Restore failed: ${error.message}`, 'error');
        }
    };

    const handleSyncLogs = async () => {
        showToast('Simulating log sync to external service...', 'info');
        try {
            addAuditLog('SYNC_LOGS', `Simulated syncing ${auditLogs.length} logs to external service.`);
            showToast('Logs synced successfully (simulation).', 'success');
        } catch (error) {
            showToast('Log sync failed (simulation).', 'error');
        }
    };

    const handleFactoryReset = async () => {
        try {
            addAuditLog('FACTORY_RESET', `System data wipe initiated by ${currentUser?.name}.`);
            
            await db.wipeDatabase();

            showToast('System has been wiped and will now reload.', 'success');
            
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Factory reset failed:', error);
            showToast('Factory reset failed. Please clear your browser data manually.', 'error');
        }
    };
    
    if(isAppLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background dark:bg-dark-background">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full animate-spin border-4 border-dashed border-primary dark:border-dark-primary border-t-transparent"></div>
                    <span className="font-semibold text-foreground dark:text-dark-foreground">Loading KenPOS™...</span>
                </div>
            </div>
        );
    }

    const renderView = () => {
        if (!currentUser) return null; // Should be handled by AuthView
        const userPermissions = settings.permissions[currentUser.role] || [];
        
        switch (currentView) {
            case View.POS:
                return (
                    <PosView
                        products={products}
                        cart={cart}
                        customers={customers}
                        selectedCustomerId={selectedCustomerId}
                        onCustomerChange={setSelectedCustomerId}
                        addToCart={addToCart}
                        updateCartItemQuantity={updateCartItemQuantity}
                        removeFromCart={removeFromCart}
                        clearCart={clearCart}
                        completeSale={completeSale}
                        isOnline={isOnline}
                        currentUser={currentUser}
                        settings={settings}
                        sales={sales}
                        activeShift={activeShift}
                        onStartShift={handleStartShift}
                        onEndShiftRequest={() => setIsEndingShift(true)}
                        isEndingShift={isEndingShift}
                        onConfirmEndShift={handleEndShift}
                        onCancelEndShift={() => setIsEndingShift(false)}
                        shiftReportToShow={shiftReportToShow}
                        onCloseShiftReport={() => setShiftReportToShow(null)}
                        onEmailReceiptRequest={(saleId, customerId) => handleEmailRequest('Receipt', saleId, customerId)}
                        onWhatsAppReceiptRequest={(saleId, customerId) => setWhatsAppInfo({ mode: 'receipt', documentId: saleId, customerId })}
                    />
                );
            case View.Dashboard:
                 return <DashboardView sales={sales} products={products} suppliers={suppliers} supplierInvoices={supplierInvoices} />;
            case View.Inventory:
                 return <InventoryView products={products} onUpdateProduct={updateProduct} onDeleteProductRequest={setProductToDelete} permissions={userPermissions} onAddProduct={addProduct} onImportProducts={handleImportProducts} onPrintBarcodeRequest={setProductToPrintBarcode} onAddToPORequest={setProductForPO} settings={settings} />;
            case View.Purchases:
                return <PurchasesView purchaseOrders={purchaseOrders} suppliers={suppliers} products={products} onReceivePORequest={setPoToReceive} onAddPurchaseOrder={addPurchaseOrder} onAddSupplier={addSupplier} permissions={userPermissions} onSendPO={handleSendPO} onEmailPORequest={(poId, supplierId) => handleEmailRequest('PurchaseOrder', poId, supplierId)} onWhatsAppPORequest={(poId, supplierId) => setWhatsAppInfo({ mode: 'po', documentId: poId, supplierId })} settings={settings} />;
            case View.AccountsPayable:
                return invoiceToView ? (
                     <InvoiceDetailView
                        invoice={invoiceToView}
                        supplier={suppliers.find(s => s.id === invoiceToView.supplierId)}
                        purchaseOrder={purchaseOrders.find(po => po.id === invoiceToView.purchaseOrderId)}
                        settings={settings}
                        onBack={() => setInvoiceToView(null)}
                        onEmailRequest={(docId, supplierId) => handleEmailRequest('SupplierInvoice', docId, supplierId)}
                    />
                ) : (
                    <AccountsPayableView 
                        invoices={supplierInvoices} 
                        suppliers={suppliers} 
                        onRecordPayment={recordSupplierPayment} 
                        onViewInvoice={setInvoiceToView}
                    />
                );
            case View.TaxReports:
                 return <TaxReportView sales={sales} supplierInvoices={supplierInvoices} settings={settings} />;
            case View.ShiftReport:
                return <ShiftReportView shifts={shifts} sales={sales} settings={settings} />;
            case View.SalesHistory:
                return saleToView ? (
                    <ReceiptDetailView
                        sale={saleToView}
                        settings={settings}
                        currentUser={currentUser}
                        onBack={() => setSaleToView(null)}
                        onEmailReceiptRequest={handleEmailRequest}
                        onWhatsAppReceiptRequest={(saleId, customerId) => setWhatsAppInfo({ mode: 'receipt', documentId: saleId, customerId })}
                    />
                ) : (
                    <SalesHistoryView
                        sales={[...sales, ...offlineSales]}
                        customers={customers}
                        users={users}
                        onViewSaleRequest={setSaleToView}
                    />
                );
            case View.Customers:
                return <CustomersView customers={customers} sales={sales} onAddCustomer={addCustomer} onUpdateCustomer={updateCustomer} onDeleteCustomer={deleteCustomer} permissions={userPermissions} onBulkMessage={() => setWhatsAppInfo({ mode: 'bulk' })} settings={settings} />;
            case View.Quotations:
                 return selectedQuotation ? (
                    <QuotationDetailView
                        quotation={selectedQuotation}
                        settings={settings}
                        sales={sales}
                        onBack={() => setSelectedQuotation(null)}
                        onConvertQuoteToSale={quote => {
                            convertQuoteToSale(quote);
                            setSelectedQuotation(null);
                        }}
                        onEmailRequest={(type, quoteId, customerId) => handleEmailRequest(type, quoteId, customerId)}
                        permissions={userPermissions}
                    />
                ) : (
                    <QuotationsView
                        quotations={quotations}
                        sales={sales}
                        onSelectQuotation={setSelectedQuotation}
                        onCreateQuoteRequest={() => setIsCreateQuoteModalOpen(true)}
                        permissions={userPermissions}
                    />
                );
            case View.Staff:
                return <StaffView 
                    users={users} 
                    permissions={userPermissions} 
                    onAddUser={addUser} 
                    onUpdateUser={updateUser} 
                    onDeleteUser={deleteUser} />;
            case View.Settings:
                return <SettingsView settings={settings} onUpdateSettings={updateSettings} users={users} auditLogs={auditLogs} showToast={showToast} onBackup={handleBackupData} onRestore={handleRestoreData} onFactoryReset={handleFactoryReset} onSyncLogs={handleSyncLogs} />;
            default:
                return <div>Not Found</div>;
        }
    };

    if (!isAuthenticated) {
        if(users.length === 0) {
            return <AdminSignUpView onAdminSignUp={handleSignUp} />
        }
        return <LoginView onLogin={handleLogin} />;
    }

    if (!settings.isSetupComplete && currentUser?.role === 'Admin') {
        return <SetupWizard 
            settings={settings}
            onUpdateSettings={updateSettings}
            showToast={showToast}
            onSetupComplete={() => {
                const updatedSettings = { ...settings, isSetupComplete: true };
                setSettings(updatedSettings);
                db.saveItem('settings', updatedSettings);
                showToast('Setup complete! Welcome to KenPOS™.', 'success');
            }}
        />;
    }

    return (
        <div className="flex h-screen bg-background dark:bg-dark-background font-sans">
            {currentUser && (
                <Sidebar 
                    currentView={currentView} 
                    setCurrentView={setCurrentView}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    role={currentUser.role}
                    permissions={settings.permissions[currentUser.role] || []}
                />
            )}
            <div className="flex-1 flex flex-col overflow-hidden">
                {currentUser && (
                    <Header 
                        isOnline={isOnline} 
                        isSyncing={isSyncing}
                        queuedSalesCount={queuedOrderCount}
                        onMenuClick={() => setIsSidebarOpen(true)}
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        products={products}
                        currentEvent={currentEvent}
                        settings={settings}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        onInstallClick={handleInstallClick}
                        installPromptEvent={installPromptEvent}
                    />
                )}
                <main className="flex-1 overflow-y-auto bg-background dark:bg-dark-background relative">
                     <AnimatePresence>
                        {toasts.map(toast => (
                            <Toast key={toast.id} {...toast} />
                        ))}
                    </AnimatePresence>
                     <AnimatePresence>
                        {updateAvailable && <UpdateNotification onUpdate={handleAppUpdate} />}
                        {productToDelete && (
                            <ConfirmationModal
                                title="Delete Product?"
                                message={`Are you sure you want to permanently delete "${productToDelete.name}"? This action cannot be undone.`}
                                confirmText="Delete"
                                onConfirm={deleteProduct}
                                onClose={() => setProductToDelete(null)}
                                isDestructive
                            />
                        )}
                         {poToReceive && (
                            <ReceivePOModal
                                purchaseOrder={poToReceive}
                                supplier={suppliers.find(s => s.id === poToReceive.supplierId)}
                                products={products}
                                onClose={() => setPoToReceive(null)}
                                onConfirm={(receivedItems) => {
                                    receivePurchaseOrder(poToReceive.id, receivedItems);
                                    setPoToReceive(null);
                                }}
                            />
                        )}
                         {productForPO && (
                            <AddToPOModal
                                product={productForPO}
                                suppliers={suppliers}
                                purchaseOrders={purchaseOrders}
                                onConfirm={handleConfirmAddToPO}
                                onClose={() => setProductForPO(null)}
                            />
                        )}
                        {productToPrintBarcode && (
                            <BarcodePrintModal
                                product={productToPrintBarcode}
                                onClose={() => setProductToPrintBarcode(null)}
                            />
                        )}
                        {isCreateQuoteModalOpen && (
                            <CreateQuotationForm
                                customers={customers.filter(c => c.id !== 'cust001')}
                                products={products}
                                settings={settings}
                                onSave={addQuotation}
                                onCancel={() => setIsCreateQuoteModalOpen(false)}
                            />
                        )}
                        {emailInfo && recipientForEmail && (
                            <EmailModal
                                documentType={emailInfo.documentType}
                                documentId={emailInfo.documentId}
                                recipientName={recipientForEmail.name}
                                defaultEmail={recipientForEmail.email}
                                onSend={handleSendEmail}
                                onClose={() => setEmailInfo(null)}
                            />
                        )}
                        {whatsAppInfo && (
                            <WhatsAppModal
                                mode={whatsAppInfo.mode}
                                recipient={recipientForWhatsApp}
                                customers={customers}
                                documentId={whatsAppInfo.documentId}
                                onClose={() => setWhatsAppInfo(null)}
                                onSend={handleSendWhatsApp}
                            />
                        )}
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                       <AnimatedView key={currentView + (selectedQuotation?.id || '') + (invoiceToView?.id || '') + (saleToView?.id || '')}>
                         {renderView()}
                       </AnimatedView>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default App;