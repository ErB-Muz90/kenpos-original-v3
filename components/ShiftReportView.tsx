import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sale, User, Shift, Settings } from '../types';
import ZReportView from './pos/ZReportView';
import { DEFAULT_SETTINGS } from '../../constants'; // Import default settings

interface ShiftReportViewProps {
  shifts: Shift[];
  sales: Sale[];
  settings: Settings;
}

const StatCard = ({ title, value }: { title: string; value: string; }) => (
    <div className="bg-slate-100 p-4 rounded-lg">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
);

const ShiftReportView: React.FC<ShiftReportViewProps> = ({ shifts, sales, settings }) => {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const closedShifts = useMemo(() => {
    return shifts
      .filter(s => s.status === 'closed')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [shifts]);

  const formatCurrency = (amount: number) => `Ksh ${amount.toFixed(2)}`;

  if (selectedShift) {
    return (
      <div className="h-full bg-slate-100">
         <ZReportView
            shift={selectedShift}
            sales={sales}
            settings={settings || DEFAULT_SETTINGS}
            onClose={() => setSelectedShift(null)}
            isHistoricalView={true}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Z-Reports (Closed Shifts)</h1>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3">Cashier</th>
              <th scope="col" className="px-6 py-3">Shift Start</th>
              <th scope="col" className="px-6 py-3">Shift End</th>
              <th scope="col" className="px-6 py-3 text-right">Total Sales</th>
              <th scope="col" className="px-6 py-3 text-right">Cash Variance</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {closedShifts.map(shift => {
              const variance = shift.cashVariance || 0;
              return (
                <tr key={shift.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedShift(shift)}>
                  <td className="px-6 py-4 font-medium text-slate-900">{shift.userName}</td>
                  <td className="px-6 py-4">{new Date(shift.startTime).toLocaleString('en-GB', {timeZone: 'Africa/Nairobi'})}</td>
                  <td className="px-6 py-4">{shift.endTime ? new Date(shift.endTime).toLocaleString('en-GB', {timeZone: 'Africa/Nairobi'}) : 'N/A'}</td>
                  <td className="px-6 py-4 text-right font-mono">{formatCurrency(shift.totalSales || 0)}</td>
                  <td className={`px-6 py-4 text-right font-mono font-semibold ${
                    variance === 0 ? 'text-slate-700' : variance > 0 ? 'text-amber-600' : 'text-red-600'
                  }`}>{formatCurrency(variance)}</td>
                   <td className="px-6 py-4 text-right">
                    <button className="font-medium text-emerald-600 hover:underline">View Report</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftReportView;