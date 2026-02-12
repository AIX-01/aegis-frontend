import React from 'react';
import { ChevronDown, Clock } from 'lucide-react';

interface TrendLineChartProps {
  title: string;
  xAxis: string[];
  series: number[];
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ title, xAxis, series }) => {
  const maxValue = Math.max(...series, 1); // Prevent division by zero
  const yAxisLabels = [Math.round(maxValue), Math.round(maxValue * 0.66), Math.round(maxValue * 0.33), 0];

  const points = series.map((value, index) => {
    const x = (index / (series.length - 1)) * 100;
    const y = 100 - (value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${points} 100,100 0,100`;

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
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-slate-400">
          {yAxisLabels.map(label => <span key={label}>{label}</span>)}
        </div>

        <div className="w-full h-full flex items-end justify-between px-8 relative">
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <path
                d={`M${areaPoints}`}
                fill="rgba(59, 130, 246, 0.1)"
                vectorEffect="non-scaling-stroke"
            />
            <polyline
                points={points}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="absolute left-8 right-8 bottom-0 flex justify-between text-xs text-slate-400 mt-2">
          {xAxis.map(label => (
              <span key={label} className="text-center" style={{ width: `${100 / xAxis.length}%` }}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
