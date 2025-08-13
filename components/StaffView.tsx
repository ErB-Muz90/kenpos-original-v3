import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Permission } from '../../types';
import UserModal from './settings/UserModal';
import ConfirmationModal from './common/ConfirmationModal';

interface StaffViewProps {
    users: User[];
    permissions: Permission[];
    onAddUser: (user: Omit<User, 'id' | 'role'>) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
}

const StaffView: React.FC<StaffViewProps> = ({ users, permissions, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    
    const canManage = permissions.includes('manage_staff');

    const openUserModal = (user?: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };
    
    const handleSaveUser = (userData: Omit<User, 'id'> | User) => {
        if ('id' in userData) {
            onUpdateUser(userData);
        } else {
            onAddUser(userData as Omit<User, 'id'>);
        }
        setIsUserModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if(deletingUser) {
            onDeleteUser(deletingUser.id);
            setDeletingUser(null);
        }
    };
    
    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
            <AnimatePresence>
                {isUserModalOpen && (
                    <UserModal 
                        onClose={() => setIsUserModalOpen(false)}
                        onSave={handleSaveUser}
                        user={editingUser}
                    />
                )}
                {deletingUser && (
                     <ConfirmationModal
                        title={`Delete User ${deletingUser.name}?`}
                        message="Are you sure you want to permanently delete this user? This action cannot be undone."
                        confirmText="Delete"
                        onConfirm={handleDeleteConfirm}
                        onClose={() => setDeletingUser(null)}
                        isDestructive
                    />
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Staff Management</h1>
                 {canManage && (
                    <motion.button 
                        onClick={() => openUserModal()} 
                        whileTap={{ scale: 0.95 }} 
                        className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add New Staff
                    </motion.button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700/50 font-bold">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4"><span className="font-semibold">{user.role}</span></td>
                                <td className="px-6 py-4 text-right">
                                    {canManage && (
                                        <div className="space-x-4">
                                            <button onClick={() => openUserModal(user)} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">Edit</button>
                                            <button onClick={() => setDeletingUser(user)} className="font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffView;