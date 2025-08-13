import React from 'react';
import { Settings, Role, Permission } from '../../types';
import { PERMISSIONS_CONFIG } from '../../constants';

interface UsersPermissionsSettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
}

const UsersPermissionsSettings: React.FC<UsersPermissionsSettingsProps> = ({ settings, onUpdateSettings }) => {

    const handlePermissionChange = (role: Role, permission: Permission, checked: boolean) => {
        const currentPermissions = settings.permissions[role];
        const newPermissions = checked
            ? [...currentPermissions, permission]
            : currentPermissions.filter(p => p !== permission);
        
        onUpdateSettings({
            permissions: {
                ...settings.permissions,
                [role]: newPermissions
            }
        });
    };
    
    return (
         <div className="overflow-x-auto">
            <div className="rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Permission</th>
                            {(Object.keys(settings.permissions) as Role[]).map(role => (
                                <th key={role} scope="col" className="px-6 py-3 text-center">{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PERMISSIONS_CONFIG.map(({ module, permissions }) => (
                            <React.Fragment key={module}>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <td colSpan={1 + Object.keys(settings.permissions).length} className="px-6 py-2 font-bold text-slate-600 dark:text-slate-300">{module}</td>
                                </tr>
                                {permissions.map(p => (
                                    <tr key={p.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{p.label}</td>
                                        {(Object.keys(settings.permissions) as Role[]).map(role => (
                                            <td key={`${p.id}-${role}`} className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                    checked={settings.permissions[role].includes(p.id)}
                                                    onChange={(e) => handlePermissionChange(role, p.id, e.target.checked)}
                                                    disabled={role === 'Admin'} // Admins have all permissions
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPermissionsSettings;