import React, { useState } from 'react';
import { Activity, ArrowLeft } from 'lucide-react';
import { getEventTypeKorean, fetcher } from '@/lib/utils';
import useSWR from 'swr';
import type { Event } from '@/types';

interface DonutChartItem {
    type: string;
    count: number;
    percentage: number;
}

interface EventTypeDonutChartProps {
    items: DonutChartItem[];
    timeRange: 'day' | 'week' | 'month';
}

const COLORS: { [key: string]: string } = {
    ASSAULT: '#ef4444',
    BURGLARY: '#f97316',
    DUMP: '#84cc16',
    SWOON: '#3b82f6',
    VANDALISM: '#8b5cf6',
};

const TimeRangeInDays = {
  day: 1,
  week: 7,
  month: 30,
};

// Helper to format date to YYYY-MM-DDTHH:mm:ss
const toLocalISOString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const createDonutSegmentPath = (
    startAngle: number,
    endAngle: number,
    innerRadius: number,
    outerRadius: number,
    cx: number,
    cy: number
) => {
    // Handle 100% case
    if (endAngle - startAngle >= 360) {
        endAngle = startAngle + 359.99;
    }

    const start = (startAngle - 90) * (Math.PI / 180);
    const end = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + outerRadius * Math.cos(start);
    const y1 = cy + outerRadius * Math.sin(start);
    const x2 = cx + outerRadius * Math.cos(end);
    const y2 = cy + outerRadius * Math.sin(end);

    const x3 = cx + innerRadius * Math.cos(end);
    const y3 = cy + innerRadius * Math.sin(end);
    const x4 = cx + innerRadius * Math.cos(start);
    const y4 = cy + innerRadius * Math.sin(start);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z'
    ].join(' ');
};

const EventList = ({ eventType, timeRange, onBack }: { eventType: string; timeRange: 'day' | 'week' | 'month', onBack: () => void }) => {
    const endDate = toLocalISOString(new Date());
    const startDate = toLocalISOString(new Date(Date.now() - TimeRangeInDays[timeRange] * 24 * 60 * 60 * 1000));

    const { data, error, isLoading } = useSWR(
        `/api/events?types=${eventType.toLowerCase()}&startDate=${startDate}&endDate=${endDate}&size=100`,
        fetcher
    );

    if (error) {
        console.error("Failed to fetch event list:", error);
    }

    const events: Event[] = data?.content || [];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={onBack} className="p-1 rounded-full hover:bg-slate-100">
                    <ArrowLeft size={18} className="text-slate-500" />
                </button>
                <h3 className="text-lg font-semibold text-slate-800">
                    {getEventTypeKorean(eventType.toLowerCase() as any)} 목록
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto -mr-3 pr-3">
                {isLoading && <div className="text-center py-8 text-slate-500">목록을 불러오는 중...</div>}
                {error && <div className="text-center py-8 text-red-500">오류가 발생했습니다.</div>}
                {!isLoading && !error && events.length === 0 && (
                    <div className="text-center py-8 text-slate-500">해당 유형의 이벤트가 없습니다.</div>
                )}
                <ul className="space-y-3">
                    {events.map((event) => (
                        <li key={event.id} className="p-3 bg-slate-50 rounded-md border border-slate-200 text-sm">
                            <div className="flex justify-between items-center">
                                <p className="font-medium text-slate-700 truncate pr-2">
                                    {event.cameraName} ({event.cameraLocation})
                                </p>
                                <p className="text-xs text-slate-500 flex-shrink-0">{new Date(event.occurredAt).toLocaleTimeString()}</p>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 truncate">{event.summary || '요약 정보 없음'}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


export const EventTypeDonutChart: React.FC<EventTypeDonutChartProps> = ({ items = [], timeRange }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedEventType, setSelectedEventType] = useState<string | null>(null);

    if (selectedEventType) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-[26rem]">
                <EventList eventType={selectedEventType} timeRange={timeRange} onBack={() => setSelectedEventType(null)} />
            </div>
        );
    }

    const emergencyCount = items
        .filter(i => ['ASSAULT', 'BURGLARY', 'SWOON'].includes(i.type))
        .reduce((acc, i) => acc + i.count, 0);

    const size = 160;
    const strokeWidth = 30;
    const outerRadius = size / 2;
    const innerRadius = outerRadius - strokeWidth;
    const center = size / 2;

    let currentAngle = 0;
    const segments = items.map((item) => {
        const angle = (item.percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle += angle;

        return {
            ...item,
            path: createDonutSegmentPath(startAngle, endAngle, innerRadius, outerRadius, center, center),
            color: COLORS[item.type] || '#ccc'
        };
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-[26rem]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={18} className="text-slate-400" />
                주요 이벤트 유형
            </h2>

            <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-2">
                <div className="relative w-full max-w-[12rem] aspect-square flex items-center justify-center shrink-0">
                    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
                        {segments.map((segment, index) => (
                            <path
                                key={segment.type}
                                d={segment.path}
                                fill={segment.color}
                                className={`transition-all duration-300 cursor-pointer ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-30' : 'opacity-100'}`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => setSelectedEventType(segment.type)}
                            />
                        ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="bg-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-sm">
                            {hoveredIndex !== null ? (
                                <>
                                    <span className="text-2xl font-bold text-slate-800 animate-in fade-in zoom-in duration-200">{items[hoveredIndex].count}</span>
                                    <span className="text-xs text-slate-500 font-medium">{getEventTypeKorean(items[hoveredIndex].type.toLowerCase() as any)}</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">{items[hoveredIndex].percentage.toFixed(1)}%</span>
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

                <div className="w-full flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 px-1">
                    {items.length > 0 ? items.map((item, index) => (
                        <div
                            key={item.type}
                            className={`flex-shrink-0 flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${hoveredIndex === index ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => setSelectedEventType(item.type)}
                        >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[item.type] || '#ccc' }}></span>
                            <span className={hoveredIndex === index ? 'font-semibold text-slate-900' : 'text-slate-600'}>{getEventTypeKorean(item.type.toLowerCase() as any)}</span>
                            <span className={`font-medium ml-1 ${hoveredIndex === index ? 'text-slate-900' : 'text-slate-500'}`}>{item.count}건</span>
                        </div>
                    )) : <p className="text-center text-slate-500 w-full">데이터가 없습니다.</p>}
                </div>
            </div>
        </div>
    );
};
