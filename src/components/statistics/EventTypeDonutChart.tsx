import React from 'react';
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
    let cumulativePercentage = 0;
    const conicGradient = items.map(item => {
        const color = COLORS[item.type] || '#ccc';
        const start = cumulativePercentage;
        cumulativePercentage += item.percentage;
        const end = cumulativePercentage;
        return `${color} ${start}% ${end}%`;
    }).join(', ');

    const emergencyCount = items.filter(i => i.type === 'ASSAULT' || i.type === 'BURGLARY' || i.type === 'SWOON').reduce((acc, i) => acc + i.count, 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity size={18} className="text-slate-400" />
                주요 이벤트 유형
            </h2>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center"
                     style={{ background: `conic-gradient(${conicGradient || '#f1f5f9 0% 100%'})` }}>
                    <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-2xl font-bold text-slate-800">{emergencyCount}</span>
                        <span className="text-xs text-slate-500">긴급 건수</span>
                    </div>
                </div>

                <div className="w-full mt-8 space-y-3">
                    {items.length > 0 ? items.map(item => (
                        <div key={item.type} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[item.type] || '#ccc' }}></span>
                                {getEventTypeKorean(item.type as any)}
                            </div>
                            <span className="font-semibold">{item.count}건 ({item.percentage.toFixed(1)}%)</span>
                        </div>
                    )) : <p className="text-center text-slate-500">데이터가 없습니다.</p>}
                </div>
            </div>
        </div>
    );
};
