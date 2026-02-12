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
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercent = 0;

    const segments = items.map((item) => {
        const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -((cumulativePercent / 100) * circumference);
        cumulativePercent += item.percentage;
        return { ...item, strokeDasharray, strokeDashoffset, color: COLORS[item.type] || '#ccc' };
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-[26rem]">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={18} className="text-slate-400" />
                주요 이벤트 유형
            </h2>

            <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-4">
                <div className="relative w-full max-w-[12rem] aspect-square flex items-center justify-center">
                    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90 transform">
                        {segments.map((segment, index) => (
                            <circle
                                key={segment.type}
                                cx={size / 2} cy={size / 2} r={radius} fill="transparent"
                                stroke={segment.color} strokeWidth={strokeWidth}
                                strokeDasharray={segment.strokeDasharray} strokeDashoffset={segment.strokeDashoffset}
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

                <div className="w-full space-y-2">
                    {items.length > 0 ? items.map((item, index) => (
                        <div
                            key={item.type}
                            className={`flex justify-between items-center text-sm p-2 rounded-lg transition-colors cursor-pointer ${hoveredIndex === index ? 'bg-slate-50 ring-1 ring-slate-200' : 'hover:bg-slate-50'}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => setSelectedEventType(item.type)}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[item.type] || '#ccc' }}></span>
                                <span className={hoveredIndex === index ? 'font-semibold text-slate-900' : 'text-slate-600'}>{getEventTypeKorean(item.type.toLowerCase() as any)}</span>
                            </div>
                            <span className={`font-medium ${hoveredIndex === index ? 'text-slate-900' : 'text-slate-500'}`}>{item.count}건 <span className="text-xs opacity-70">({item.percentage.toFixed(1)}%)</span></span>
                        </div>
                    )) : <p className="text-center text-slate-500">데이터가 없습니다.</p>}
                </div>
            </div>
        </div>
    );
};
