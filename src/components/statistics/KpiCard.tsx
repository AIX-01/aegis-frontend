import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  unit: string;
  trend: string;
  trendUp: boolean | null;
  icon: React.ReactNode;
  color: string;
  alert?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit, trend, trendUp, icon, color, alert }) => (
    <div className={`bg-white rounded-xl shadow-sm border ${alert ? 'border-red-200' : 'border-slate-200'} p-5 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${alert ? 'bg-red-500' : 'bg-transparent'}`}></div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
      <div className="mt-3 text-xs flex items-center">
        {trendUp === true && <span className="text-red-500 font-medium mr-1">↑</span>}
        {trendUp === false && <span className="text-blue-500 font-medium mr-1">↓</span>}
        {trendUp === null && <span className="text-slate-400 mr-1">-</span>}
        <span className={trendUp === true ? 'text-slate-600' : 'text-slate-500'}>{trend}</span>
      </div>
    </div>
);
