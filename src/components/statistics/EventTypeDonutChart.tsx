import React from 'react';
import { Activity } from 'lucide-react';

export const EventTypeDonutChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Activity size={18} className="text-slate-400" />
        주요 이벤트 유형
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* CSS Donut Chart */}
        <div className="relative w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center"
             style={{ background: 'conic-gradient(#ef4444 0% 15%, #f59e0b 15% 45%, #10b981 45% 100%)' }}>
          <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-2xl font-bold text-slate-800">7</span>
            <span className="text-xs text-slate-500">긴급 건수</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full mt-8 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span>무기 (Weapon)</div>
            <span className="font-semibold">3건 (15%)</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span>폭력 (Violence)</div>
            <span className="font-semibold">2건 (30%)</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>실신 (Fainting)</div>
            <span className="font-semibold">2건 (55%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
