import React from 'react';
import { ChevronDown, Clock } from 'lucide-react';

interface TrendLineChartProps {
  title: string;
  xAxis: string[];
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ title, xAxis }) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock size={18} className="text-slate-400" />
          {title}
        </h2>
        <button className="text-sm text-slate-500 flex items-center hover:text-slate-800">
          상세보기 <ChevronDown size={14} className="ml-1" />
        </button>
      </div>

      <div className="h-64 flex items-end justify-between relative pt-8 pb-6 border-b border-slate-100">
        {/* Fake Y-Axis */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-slate-400">
          <span>15</span>
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>

        {/* Fake Chart Bars / Line points */}
        <div className="w-full h-full flex items-end justify-between px-8 relative">
          {/* SVG Area simulation */}
          <svg className="absolute inset-0 h-full w-full px-8" preserveAspectRatio="none">
            <path
                d="M0,200 L40,190 L80,195 L120,180 L160,150 L200,40 L240,160 L280,180 L320,190 L360,185 L400,195 L440,200 L480,200 L480,200 L0,200 Z"
                fill="rgba(59, 130, 246, 0.1)"
                vectorEffect="non-scaling-stroke"
            />
            <polyline
                points="0,200 40,190 80,195 120,180 160,150 200,40 240,160 280,180 320,190 360,185 400,195 440,200 480,200"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
            />
            {/* Spike Marker */}
            <circle cx="200" cy="40" r="5" fill="#ef4444" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
            <text x="200" y="25" fill="#ef4444" fontSize="12" textAnchor="middle" fontWeight="bold">급증 (16시)</text>
          </svg>
        </div>

        {/* Fake X-Axis */}
        <div className="absolute left-8 right-8 bottom-0 flex justify-between text-xs text-slate-400 mt-2">
          {xAxis.map(label => (
              <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
