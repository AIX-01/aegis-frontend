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

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ title, yAxis, series = [] }) => {
    const xAxisLabels = ['새벽 (0-6)', '오전 (6-12)', '오후 (12-18)', '야간 (18-24)'];

    const gridData = Array(yAxis.length).fill(0).map(() => Array(xAxisLabels.length).fill(0));
    series.forEach(point => {
        if (point.y < yAxis.length && point.x < xAxisLabels.length) {
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          {title}
        </h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">패턴 분석용</span>
      </div>

      <div className="flex">
        <div className="flex flex-col justify-around text-xs text-slate-400 pr-3 font-medium h-48 pt-6">
          {yAxis.map(label => (
              <span key={label} className="flex-1">{label}</span>
          ))}
        </div>

        <div className="flex-1 flex flex-col h-48">
          <div className="flex justify-between text-xs text-slate-400 mb-2 px-2">
            {xAxisLabels.map(label => <span key={label}>{label}</span>)}
          </div>

          <div className="flex-1 grid grid-rows-7 gap-1">
            {gridData.map((row, y) => (
                <div key={y} className="grid grid-cols-4 gap-1">
                  {row.map((value, x) => (
                        <div
                            key={x}
                            className={`${getBgColor(value)} rounded-sm hover:ring-2 hover:ring-slate-400 transition-all cursor-pointer group relative`}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none z-10 whitespace-nowrap">
                            {value}건 발생
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
