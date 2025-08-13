import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

interface AuthViewProps {
    onLogin: (email: string) => boolean;
    onSignUp: (userData: Omit<User, 'id' | 'role'>) => boolean;
    isInitialSignUp: boolean;
}

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input 
        {...props}
        className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-500"
    />
);

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onSignUp, isInitialSignUp }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(isInitialSignUp ? 'signup' : 'login');
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Reset fields when mode changes
        setName('');
        setEmail('');
        setError('');
    }, [mode]);
    
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(email);
        if (!success) {
            setError('User with this email not found.');
        }
    };
    
    const handleSignUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        onSignUp({ name, email });
    };

    const cardVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };


    return (
        <div className="h-screen w-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
            <motion.div
                key={mode}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
            >
                <div className="text-center">
                    <div className="mx-auto bg-emerald-600 text-white text-3xl font-bold rounded-xl w-20 h-20 flex items-center justify-center mb-4">
                        K
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {isInitialSignUp ? 'Welcome to KenPOS™' : (mode === 'login' ? 'Welcome Back!' : 'Create Your Account')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {isInitialSignUp && mode === 'signup' 
                            ? 'Set up the first administrator for your new business.'
                            : 'Sign in to your KenPOS™ account.'
                        }
                    </p>
                </div>

                {mode === 'login' ? (
                     <form onSubmit={handleLoginSubmit} className="mt-8 space-y-6">
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <InputField id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        {error && <p className="text-center text-sm text-red-600">{error}</p>}
                        <div>
                            <motion.button type="submit" whileTap={{ scale: 0.98 }} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">Sign in</motion.button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSignUpSubmit} className="mt-8 space-y-4">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <InputField id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <InputField id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">Password functionality is disabled in this client-only version. In a production environment, a temporary password would be sent to this email address.</p>
                        {error && <p className="text-center text-sm text-red-600">{error}</p>}
                        <div>
                            <motion.button type="submit" whileTap={{ scale: 0.98 }} className="w-full flex justify-center mt-4 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">Create Admin Account</motion.button>
                        </div>
                    </form>
                )}

                {!isInitialSignUp && (
                    <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        Contact your administrator to create or manage accounts.
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default AuthView;