import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

interface AdminSignUpViewProps {
    onAdminSignUp: (adminData: Omit<User, 'id' | 'role'>) => void;
}

const AdminSignUpView: React.FC<AdminSignUpViewProps> = ({ onAdminSignUp }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setError('');
        onAdminSignUp({ name, email, password });
    };

    return (
        <div className="h-screen w-screen bg-slate-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="text-center">
                    <div className="mx-auto bg-emerald-600 text-white text-3xl font-bold rounded-xl w-20 h-20 flex items-center justify-center mb-4">
                        K
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Create Admin Account</h1>
                    <p className="text-slate-500 mt-2">Set up the first administrator for KenPOS™.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"/>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
                        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700">Confirm Password</label>
                        <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"/>
                    </div>
                    
                    {error && (
                        <p className="text-center text-sm text-red-600">{error}</p>
                    )}

                    <div>
                        <motion.button
                            type="submit"
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex justify-center mt-4 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            Create Account
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminSignUpView;