import React, { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';

interface TrendLineChartProps {
  title: string;
  xAxis: string[];
  series: number[];
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ title, xAxis = [], series = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...series, 1); // Prevent division by zero
  const yAxisLabels = [Math.round(maxValue), Math.round(maxValue * 0.66), Math.round(maxValue * 0.33), 0];

  const points = series.map((value, index) => {
    const x = (index / (series.length > 1 ? series.length - 1 : 1)) * 100;
    const y = 100 - (value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,${100 - (series.length > 0 ? (series[series.length - 1] / maxValue) * 100 : 100)} 100,100`;

  // Find surge point
  let surgePoint = null;
  if (series.length > 0) {
    const maxSeriesValue = Math.max(...series);
    if (maxSeriesValue > 0) {
      const surgeIndex = series.indexOf(maxSeriesValue);
      const surgeX = (surgeIndex / (series.length > 1 ? series.length - 1 : 1)) * 100;
      const surgeY = 100 - (maxSeriesValue / maxValue) * 100;
      const surgeLabel = xAxis[surgeIndex];
      surgePoint = { x: surgeX, y: surgeY, label: surgeLabel, index: surgeIndex };
    }
  }

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
          {yAxisLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
        </div>

        <div className="w-full h-full flex items-end justify-between px-4 sm:px-8 relative">
          {/* SVG for stretchable chart elements */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
                d={`M${areaPoints}`}
                fill="rgba(59, 130, 246, 0.1)"
            />
            <polyline
                points={points}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Hover Interaction Layer */}
          <div className="absolute inset-0 flex items-stretch">
            {series.map((_, index) => (
              <div
                key={index}
                className="flex-1 hover:bg-slate-50/50 group relative cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Vertical Line on Hover */}
                {hoveredIndex === index && (
                  <div className="absolute inset-y-0 left-1/2 w-px bg-blue-300 -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>

          {/* Data Points */}
          {series.map((value, index) => {
             const x = (index / (series.length > 1 ? series.length - 1 : 1)) * 100;
             const y = 100 - (value / maxValue) * 100;
             const isHovered = hoveredIndex === index;
             const isSurge = surgePoint?.index === index;

             if (!isHovered && !isSurge) return null;

             return (
                <div
                  key={index}
                  className="absolute flex flex-col items-center pointer-events-none"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                >
                  <div
                    className={`absolute text-xs font-bold whitespace-nowrap px-2 py-1 rounded-md shadow-sm backdrop-blur-sm transition-all duration-200 ${
                      y < 20 ? 'top-full mt-2' : 'bottom-full mb-2'
                    } ${isSurge && !isHovered ? 'text-red-500 bg-white/80' : 'text-slate-700 bg-white border border-slate-200'}`}
                  >
                    {isSurge && !isHovered ? `급증 (${xAxis[index]})` : `${xAxis[index]}: ${value}건`}
                  </div>
                  <div className={`w-3 h-3 rounded-full border-2 shadow-md transition-colors duration-200 ${
                      isSurge ? 'bg-red-500 border-white' : 'bg-blue-500 border-white'
                  }`} />
                </div>
             );
          })}
        </div>

        <div className="absolute left-4 sm:left-8 right-4 sm:right-8 bottom-0 flex justify-between text-xs text-slate-400 mt-2">
          {xAxis.map((label, index) => (
              <span key={label} className={`text-center transition-colors duration-200 ${hoveredIndex === index ? 'text-slate-800 font-medium' : ''}`} style={{ width: `${100 / (xAxis.length || 1)}%` }}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
