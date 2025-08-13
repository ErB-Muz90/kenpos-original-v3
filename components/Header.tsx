import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Product, Settings } from '../types';
import { ICONS } from '../constants';
import LowStockNotificationPopover from './notifications/LowStockNotificationPopover';

const MotionSvg = motion.svg;
const MotionDiv = motion.div;
const MotionSpan = motion.span;
const MotionButton = motion.button;

const SyncIcon = () => (
    <MotionSvg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-primary dark:text-dark-primary"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2.5"
        stroke="currentColor"
        animate={{ rotate: 360 }}
        transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
        }}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.69a8.25 8.25 0 00-11.664 0l-3.181 3.183"
        />
    </MotionSvg>
);


interface HeaderProps {
    isOnline: boolean;
    isSyncing: boolean;
    queuedSalesCount: number;
    onMenuClick: () => void;
    currentUser: User;
    onLogout: () => void;
    products: Product[];
    currentEvent: string | null;
    settings: Settings;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onInstallClick: () => void;
    installPromptEvent: Event | null;
}

const Header = ({ isOnline, isSyncing, queuedSalesCount, onMenuClick, currentUser, onLogout, products, currentEvent, settings, theme, onToggleTheme, onInstallClick, installPromptEvent }: HeaderProps) => {
    const [time, setTime] = useState(new Date());
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const lowStockProducts = useMemo(() => {
        return products.filter(p => p.productType === 'Inventory' && p.stock === 0);
    }, [products]);

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsUserMenuOpen(false);
        onLogout();
    };

    const userInitials = useMemo(() => {
        if (!currentUser || !currentUser.name) return '';
        const nameParts = currentUser.name.split(' ').filter(Boolean);
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
        }
        return nameParts[0] ? nameParts[0][0].toUpperCase() : '';
    }, [currentUser]);

    return (
        <header className="bg-card/90 dark:bg-dark-card/90 backdrop-blur-sm h-16 flex items-center justify-between px-4 md:px-6 shadow-md border-b border-border/80 dark:border-dark-border/80 flex-shrink-0 relative z-10">
            <div className="flex items-center space-x-4">
                <button onClick={onMenuClick} className="md:hidden text-foreground/70 hover:text-accent dark:text-dark-foreground/70 dark:hover:text-dark-accent">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                 <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-foreground dark:text-dark-foreground">KenPOS™</h1>
                     {currentEvent && (
                        <MotionDiv
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-bold text-accent dark:text-dark-accent -mt-1"
                        >
                            {currentEvent} Edition
                        </MotionDiv>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-4 md:space-x-6">
                <div className="flex items-center space-x-2 h-5">
                    <AnimatePresence mode="wait">
                        {isSyncing ? (
                            <MotionDiv key="syncing" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: -10}} transition={{duration: 0.2}} className="flex items-center space-x-2">
                                <SyncIcon />
                                <span className="text-sm font-bold text-primary dark:text-dark-primary hidden sm:inline">
                                    Syncing...
                                </span>
                                {queuedSalesCount > 0 && (
                                    <span className="text-xs bg-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded-full">{queuedSalesCount}</span>
                                )}
                            </MotionDiv>
                        ) : isOnline ? (
                            <MotionDiv key="online" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: -10}} transition={{duration: 0.2}} className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-accent" />
                                <span className="text-sm font-bold text-accent dark:text-dark-accent hidden sm:inline">
                                    Online
                                </span>
                            </MotionDiv>
                        ) : (
                            <MotionDiv key="offline" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: -10}} transition={{duration: 0.2}} className="flex items-center space-x-2">
                                <MotionDiv 
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                    className="w-3 h-3 rounded-full bg-danger"
                                />
                                <span className="text-sm font-bold text-danger hidden sm:inline">
                                    Offline
                                </span>
                                {queuedSalesCount > 0 && (
                                    <MotionSpan 
                                        initial={{scale: 0}} animate={{scale: 1}}
                                        className="text-xs bg-warning text-white font-bold px-2 py-0.5 rounded-full">
                                        {queuedSalesCount}
                                    </MotionSpan>
                                )}
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>

                {installPromptEvent && (
                    <MotionButton
                        onClick={onInstallClick}
                        whileTap={{ scale: 0.95 }}
                        className="bg-accent text-white font-bold px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors shadow-sm flex items-center text-sm"
                    >
                        {ICONS.install}
                        <span className="ml-2 hidden sm:inline">Install App</span>
                    </MotionButton>
                )}

                <div className="relative">
                    <MotionButton
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        whileTap={{ scale: 0.95 }}
                        className="text-foreground/70 hover:text-accent p-2 rounded-full hover:bg-background dark:text-dark-foreground/70 dark:hover:text-dark-accent dark:hover:bg-dark-background"
                        aria-label="Notifications"
                    >
                        {ICONS.bell}
                        {lowStockProducts.length > 0 && (
                            <MotionSpan 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-danger text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center border-2 border-card dark:border-dark-card">
                                {lowStockProducts.length}
                            </MotionSpan>
                        )}
                    </MotionButton>
                     <AnimatePresence>
                        {isNotificationsOpen && (
                           <LowStockNotificationPopover
                                lowStockProducts={lowStockProducts}
                                onClose={() => setIsNotificationsOpen(false)}
                           />
                        )}
                    </AnimatePresence>
                </div>

                <div className="text-right hidden md:block border-l pl-6 border-border dark:border-dark-border">
                    <div className="font-bold text-foreground dark:text-dark-foreground">{time.toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi' })}</div>
                    <div className="text-xs text-foreground/70 dark:text-dark-foreground/70">{time.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'Africa/Nairobi' })}</div>
                </div>
                 <div className="relative">
                     <MotionButton 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 bg-background hover:bg-border dark:bg-dark-card/50 dark:hover:bg-dark-border p-1 pr-3 rounded-full transition-colors shadow-sm hover:shadow-md"
                     >
                        <div className="w-8 h-8 rounded-full bg-primary dark:bg-dark-primary text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                             {settings.businessInfo.logoUrl ? (
                                <img src={settings.businessInfo.logoUrl} alt="Business Logo" className="w-full h-full object-cover" />
                             ) : (
                                <span>{userInitials}</span>
                             )}
                        </div>
                        <div className="text-left hidden md:block">
                           <div className="font-bold text-sm text-foreground dark:text-dark-foreground">{currentUser.name}</div>
                           <div className="text-xs text-foreground/70 dark:text-dark-foreground/70">{currentUser.role}</div>
                        </div>
                         <MotionDiv animate={{ rotate: isUserMenuOpen ? 180 : 0 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-foreground/70 dark:text-dark-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                         </MotionDiv>
                     </MotionButton>
                      <AnimatePresence>
                        {isUserMenuOpen && (
                           <MotionDiv
                             initial={{ opacity: 0, y: -10, scale: 0.95 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             exit={{ opacity: 0, y: -10, scale: 0.95 }}
                             className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-20 border border-border dark:bg-dark-card dark:border-dark-border"
                           >
                            <a href="#" onClick={(e) => { e.preventDefault(); onToggleTheme(); }} className="flex items-center px-4 py-2 text-sm font-semibold text-foreground hover:bg-background dark:text-dark-foreground/80 dark:hover:bg-dark-border">
                                {theme === 'light' ? ICONS.moon : ICONS.sun}
                                <span className="ml-2">Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                            </a>
                            <div className="my-1 h-px bg-border dark:bg-dark-border"></div>
                             <a href="#" onClick={handleLogout} className="flex items-center px-4 py-2 text-sm font-semibold text-foreground hover:bg-background dark:text-dark-foreground/80 dark:hover:bg-dark-border">
                                 {ICONS.logout}
                                 <span className="ml-2">Logout</span>
                            </a>
                           </MotionDiv>
                        )}
                    </AnimatePresence>
                 </div>
            </div>
        </header>
    );
};

export default Header;
