import React, { useState, useRef } from 'react';
import { ChevronDown, Clock } from 'lucide-react';

interface TrendLineChartProps {
  title: string;
  xAxis: string[];
  series: number[];
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ title, xAxis = [], series = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const maxValue = Math.max(...series, 1); // Prevent division by zero
  const yAxisLabels = [Math.round(maxValue), Math.round(maxValue * 0.66), Math.round(maxValue * 0.33), 0];

  const getXPosition = (index: number, length: number) => {
      return (index / (length > 1 ? length - 1 : 1)) * 100;
  };

  const points = series.map((value, index) => {
    const x = getXPosition(index, series.length);
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
      const surgeX = getXPosition(surgeIndex, series.length);
      const surgeY = 100 - (maxSeriesValue / maxValue) * 100;
      const surgeLabel = xAxis[surgeIndex];
      surgePoint = { x: surgeX, y: surgeY, label: surgeLabel, index: surgeIndex };
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || series.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Calculate the closest index based on mouse position
    const percentage = Math.max(0, Math.min(1, x / width));
    const index = Math.round(percentage * (series.length - 1));
    
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Calculate position for the hovered element
  const getHoveredPosition = () => {
    if (hoveredIndex === null) return null;
    const x = getXPosition(hoveredIndex, series.length);
    const y = 100 - (series[hoveredIndex] / maxValue) * 100;
    return { x, y, value: series[hoveredIndex], label: xAxis[hoveredIndex] };
  };

  const hoveredPos = getHoveredPosition();

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-[22rem] flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock size={18} className="text-slate-400" />
          {title}
        </h2>
        <button className="text-sm text-slate-500 flex items-center hover:text-slate-800">
          상세보기 <ChevronDown size={14} className="ml-1" />
        </button>
      </div>

      <div className="flex-1 flex items-end justify-between relative pt-8 pb-6 border-b border-slate-100 min-h-0">
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-slate-400">
          {yAxisLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
        </div>

        <div 
            ref={containerRef}
            className="w-full h-full flex items-end justify-between px-4 sm:px-8 relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
          {/* SVG for stretchable chart elements */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
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

          {/* Surge Point (Only visible when not hovering) */}
          {surgePoint && hoveredIndex === null && (
            <div
              className="absolute flex flex-col items-center pointer-events-none transition-opacity duration-300"
              style={{
                left: `${surgePoint.x}%`,
                top: `${surgePoint.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div
                className={`absolute text-xs font-bold text-red-500 whitespace-nowrap px-1.5 py-0.5 rounded-md bg-white/70 backdrop-blur-sm ${
                  surgePoint.y < 20 ? 'top-full mt-2' : 'bottom-full mb-2'
                }`}
              >
                급증 ({surgePoint.label})
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md animate-pulse" />
            </div>
          )}

          {/* Hover Interaction Elements */}
          <div 
            className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${hoveredIndex !== null ? 'opacity-100' : 'opacity-0'}`}
          >
            {hoveredPos && (
                <>
                    {/* Vertical Guide Line */}
                    <div 
                        className="absolute top-0 bottom-0 w-px bg-blue-400/50 border-r border-dashed border-blue-400 transition-all duration-200 ease-out"
                        style={{ left: `${hoveredPos.x}%` }}
                    />
                    
                    {/* Data Point Marker & Tooltip */}
                    <div
                        className="absolute flex flex-col items-center z-20 transition-all duration-200 ease-out"
                        style={{
                            left: `${hoveredPos.x}%`,
                            top: `${hoveredPos.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg" />
                        
                        <div
                            className={`absolute flex flex-col items-center bg-slate-800 text-white text-xs rounded-lg py-1.5 px-3 shadow-xl whitespace-nowrap ${
                                hoveredPos.y < 20 ? 'top-full mt-3' : 'bottom-full mb-3'
                            }`}
                        >
                            <span className="font-semibold mb-0.5">{hoveredPos.label}</span>
                            <span className="text-blue-200 font-bold text-sm">{hoveredPos.value}건</span>
                            {/* Tooltip Arrow */}
                            <div 
                                className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                                    hoveredPos.y < 20 ? 'bottom-full border-b-slate-800' : 'top-full border-t-slate-800'
                                }`} 
                            />
                        </div>
                    </div>
                </>
            )}
          </div>
        </div>

        {/* X-Axis Labels - Positioned absolutely to match data points */}
        <div className="absolute left-4 sm:left-8 right-4 sm:right-8 bottom-0 h-4 pointer-events-none">
          {xAxis.map((label, index) => {
              const x = getXPosition(index, xAxis.length);
              return (
                  <span 
                    key={label} 
                    className={`absolute top-0 text-xs text-slate-400 transform -translate-x-1/2 whitespace-nowrap transition-all duration-200 ${
                        hoveredIndex === index ? 'text-blue-600 font-bold scale-110' : ''
                    }`} 
                    style={{ left: `${x}%` }}
                  >
                    {label}
                  </span>
              );
          })}
        </div>
      </div>
    </div>
  );
};
