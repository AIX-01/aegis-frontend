import React from 'react';
import { Calendar } from 'lucide-react';

interface HeatmapPoint {
    x: number;
    y: number;
    value: number;
}

interface HeatmapChartProps {
  title: string;
  yAxis: string[];
  series: HeatmapPoint[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ title, yAxis = [], series = [] }) => {
    const xAxisLabels = ['새벽', '오전', '오후', '야간'];

    const gridData = Array(yAxis.length).fill(0).map(() => Array(xAxisLabels.length).fill(0));
    series.forEach(point => {
        if (point.y >= 0 && point.y < yAxis.length && point.x >= 0 && point.x < xAxisLabels.length) {
            gridData[point.y][point.x] = point.value;
        }
    });

    const getBgColor = (value: number) => {
        if (value > 10) return 'bg-red-400';
        if (value > 5) return 'bg-blue-400';
        if (value > 2) return 'bg-blue-200';
        if (value > 0) return 'bg-blue-100';
        return 'bg-slate-50';
    };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-[22rem] flex flex-col relative">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          {title}
        </h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">패턴 분석용</span>
      </div>

      <div className="flex-1 flex w-full min-h-0">
        <div className="flex flex-col justify-between text-xs text-slate-400 pr-3 font-medium py-1">
          {yAxis.map((label, index) => (
              <div key={`${label}-${index}`} className="flex items-center justify-end truncate h-full" title={label}>
                  <span className="truncate">{label}</span>
              </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="flex text-xs text-slate-400 mb-1 flex-shrink-0">
            {xAxisLabels.map(label => <span key={label} className="flex-1 text-center">{label}</span>)}
          </div>

          <div className="flex-1 grid gap-1 h-full" style={{ gridTemplateRows: `repeat(${yAxis.length}, minmax(0, 1fr))` }}>
            {gridData.map((row, y) => (
                <div key={y} className="grid grid-cols-4 gap-1 h-full">
                  {row.map((value, x) => (
                        <div
                            key={x}
                            className={`${getBgColor(value)} rounded-sm hover:ring-2 hover:ring-slate-400 transition-all cursor-pointer group relative w-full h-full`}
                        >
                          <div 
                            className={`opacity-0 group-hover:opacity-100 absolute left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none z-50 whitespace-nowrap shadow-lg transition-opacity duration-200 ${
                                y === 0 ? 'top-full mt-2' : '-top-8'
                            }`}
                          >
                            {value}건 발생
                            {/* Tooltip Arrow */}
                            <div 
                                className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                                    y === 0 ? 'bottom-full border-b-slate-800' : 'top-full border-t-slate-800'
                                }`} 
                            />
                          </div>
                        </div>
                    ))}
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
