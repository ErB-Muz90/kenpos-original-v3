import React, { useState, useMemo } from 'react';
import { AuditLog, User } from '../../types';

interface AuditLogSettingsProps {
    auditLogs: AuditLog[];
    users: User[];
    onSyncLogs: () => void;
}

const ITEMS_PER_PAGE = 20;

const AuditLogSettings: React.FC<AuditLogSettingsProps> = ({ auditLogs, users, onSyncLogs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredLogs = useMemo(() => {
        const start = startDate ? new Date(startDate) : null;
        if(start) start.setHours(0,0,0,0);
        
        const end = endDate ? new Date(endDate) : null;
        if(end) end.setHours(23,59,59,999);

        return auditLogs
            .filter(log => selectedUser === 'all' || log.userId === selectedUser)
            .filter(log => {
                const logDate = new Date(log.timestamp);
                if (start && logDate < start) return false;
                if (end && logDate > end) return false;
                return true;
            })
            .filter(log => 
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.userName.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [auditLogs, searchTerm, selectedUser, startDate, endDate]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    
    const exportData = (format: 'csv' | 'json') => {
        const dataToExport = filteredLogs;
        if(dataToExport.length === 0) {
            alert('No logs to export with current filters.');
            return;
        }

        const filename = `kenpos_audit_logs_${new Date().toISOString().split('T')[0]}`;
        let fileContent = '';
        let mimeType = '';

        if(format === 'csv') {
            const headers = ['id', 'timestamp', 'userId', 'userName', 'action', 'details'];
            const csvRows = [
                headers.join(','),
                ...dataToExport.map(log => [
                    log.id,
                    new Date(log.timestamp).toISOString(),
                    log.userId,
                    `"${log.userName.replace(/"/g, '""')}"`,
                    log.action,
                    `"${log.details.replace(/"/g, '""')}"`
                ].join(','))
            ];
            fileContent = csvRows.join('\n');
            mimeType = 'text/csv;charset=utf-8;';
        } else {
            fileContent = JSON.stringify(dataToExport, null, 2);
            mimeType = 'application/json;charset=utf-8;';
        }

        const blob = new Blob([fileContent], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };


    return (
        <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <h4 className="font-semibold text-slate-800">Filters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                    <select 
                        value={selectedUser}
                        onChange={e => setSelectedUser(e.target.value)}
                        className="w-full block pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    >
                        <option value="all">All Users</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button onClick={() => exportData('csv')} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Export as CSV</button>
                <button onClick={() => exportData('json')} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Export as JSON</button>
                <button onClick={onSyncLogs} className="bg-slate-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-700">Sync to Cloud (Demo)</button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.map(log => (
                             <tr key={log.id} className="bg-white border-b last:border-b-0 hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(log.timestamp).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' })}</td>
                                <td className="px-6 py-4 font-medium text-slate-800">{log.userName}</td>
                                <td className="px-6 py-4"><span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{log.action}</span></td>
                                <td className="px-6 py-4">{log.details}</td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-8 text-slate-400">No logs found matching criteria.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-sm">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
};

export default AuditLogSettings;