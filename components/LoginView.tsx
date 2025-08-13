import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginViewProps {
    onLogin: (email: string, password: string) => boolean;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(email, password);
        if (!success) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="h-screen w-screen bg-slate-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="text-center">
                    <div className="mx-auto bg-emerald-600 text-white text-3xl font-bold rounded-xl w-20 h-20 flex items-center justify-center mb-4">
                        K
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome Back!</h1>
                    <p className="text-slate-500 mt-2">Sign in to your KenPOS™ account.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email Address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <p className="text-center text-sm text-red-600">{error}</p>
                    )}

                    <div>
                        <motion.button
                            type="submit"
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            Sign in
                        </motion.button>
                    </div>
                </form>
                <p className="mt-6 text-center text-xs text-slate-500">
                    Sign in to access your KenPOS™ workspace from any device.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginView;