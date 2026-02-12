import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { getEventTypeKorean } from '@/lib/utils';

interface DonutChartItem {
    type: string;
    count: number;
    percentage: number;
}

interface EventTypeDonutChartProps {
    items: DonutChartItem[];
}

const COLORS: { [key: string]: string } = {
    ASSAULT: '#ef4444',
    BURGLARY: '#f97316',
    DUMP: '#84cc16',
    SWOON: '#3b82f6',
    VANDALISM: '#8b5cf6',
};

export const EventTypeDonutChart: React.FC<EventTypeDonutChartProps> = ({ items = [] }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const emergencyCount = items
        .filter(i => ['ASSAULT', 'BURGLARY', 'SWOON'].includes(i.type))
        .reduce((acc, i) => acc + i.count, 0);

    // SVG Configuration
    const size = 160;
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercent = 0;

    const segments = items.map((item, index) => {
        const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -((cumulativePercent / 100) * circumference);
        cumulativePercent += item.percentage;

        return {
            ...item,
            strokeDasharray,
            strokeDashoffset,
            color: COLORS[item.type] || '#ccc'
        };
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={18} className="text-slate-400" />
                주요 이벤트 유형
            </h2>

            <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-4">
                {/* SVG Donut Chart */}
                <div className="relative w-full max-w-[12rem] aspect-square flex items-center justify-center">
                    <svg
                        viewBox={`0 0 ${size} ${size}`}
                        className="w-full h-full -rotate-90 transform"
                    >
                        {segments.map((segment, index) => (
                            <circle
                                key={segment.type}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="transparent"
                                stroke={segment.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={segment.strokeDasharray}
                                strokeDashoffset={segment.strokeDashoffset}
                                className={`transition-all duration-300 cursor-pointer ${
                                    hoveredIndex !== null && hoveredIndex !== index ? 'opacity-30' : 'opacity-100'
                                }`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        ))}
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="bg-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-sm">
                            {hoveredIndex !== null ? (
                                <>
                                    <span className="text-2xl font-bold text-slate-800 animate-in fade-in zoom-in duration-200">
                                        {items[hoveredIndex].count}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                        {getEventTypeKorean(items[hoveredIndex].type.toLowerCase() as any)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">
                                        {items[hoveredIndex].percentage.toFixed(1)}%
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-2xl font-bold text-slate-800">{emergencyCount}</span>
                                    <span className="text-xs text-slate-500">긴급 건수</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Legend List */}
                <div className="w-full space-y-2">
                    {items.length > 0 ? items.map((item, index) => (
                        <div
                            key={item.type}
                            className={`flex justify-between items-center text-sm p-2 rounded-lg transition-colors cursor-pointer ${
                                hoveredIndex === index ? 'bg-slate-50 ring-1 ring-slate-200' : 'hover:bg-slate-50'
                            }`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-full shadow-sm"
                                    style={{ backgroundColor: COLORS[item.type] || '#ccc' }}
                                ></span>
                                <span className={hoveredIndex === index ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                                    {getEventTypeKorean(item.type.toLowerCase() as any)}
                                </span>
                            </div>
                            <span className={`font-medium ${hoveredIndex === index ? 'text-slate-900' : 'text-slate-500'}`}>
                                {item.count}건 <span className="text-xs opacity-70">({item.percentage.toFixed(1)}%)</span>
                            </span>
                        </div>
                    )) : <p className="text-center text-slate-500">데이터가 없습니다.</p>}
                </div>
            </div>
        </div>
    );
};
