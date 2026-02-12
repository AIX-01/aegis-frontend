import React from 'react';
import { Calendar } from 'lucide-react';

interface HeatmapChartProps {
  title: string;
  yAxis: string[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ title, yAxis }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          {title}
        </h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">패턴 분석용</span>
      </div>

      <div className="flex">
        {/* Y-axis (Dynamic based on timeRange) */}
        <div className="flex flex-col justify-around text-xs text-slate-400 pr-3 font-medium h-48 pt-6">
          {yAxis.map(label => (
              <span key={label}>{label}</span>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex-1 flex flex-col h-48">
          {/* X-axis (Hours grouped) */}
          <div className="flex justify-between text-xs text-slate-400 mb-2 px-2">
            <span>새벽 (0-6)</span>
            <span>오전 (6-12)</span>
            <span>오후 (12-18)</span>
            <span>야간 (18-24)</span>
          </div>

          {/* Grid Cells */}
          <div className="flex-1 grid grid-rows-7 gap-1">
            {[...Array(7)].map((_, dayIdx) => (
                <div key={dayIdx} className="grid grid-cols-4 gap-1">
                  {[...Array(4)].map((_, timeIdx) => {
                    // Generate fake intensity (heavier on weekends night, or specific times)
                    let intensity = Math.random();
                    if (dayIdx >= 4 && timeIdx === 3) intensity += 0.5; // Friday/Sat night
                    if (dayIdx === 2 && timeIdx === 2) intensity += 0.8; // Specific spike

                    let bgColor = 'bg-blue-50';
                    if (intensity > 1.2) bgColor = 'bg-red-400';
                    else if (intensity > 0.8) bgColor = 'bg-blue-400';
                    else if (intensity > 0.4) bgColor = 'bg-blue-200';

                    return (
                        <div
                            key={timeIdx}
                            className={`${bgColor} rounded-sm hover:ring-2 hover:ring-slate-400 transition-all cursor-pointer group relative`}
                        >
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none z-10 whitespace-nowrap">
                            평균 {Math.floor(intensity * 5)}건 발생
                          </div>
                        </div>
                    );
                  })}
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
