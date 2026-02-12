import React from 'react';
import { CalendarDays } from 'lucide-react';

type TimeRange = 'day' | 'week' | 'month';

interface DashboardHeaderProps {
  timeRange: TimeRange;
  setTimeRange: (timeRange: TimeRange) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ timeRange, setTimeRange }) => {
  const getDateRangeText = (range: TimeRange) => {
    const today = new Date();
    const startDate = new Date();

    if (range === 'day') {
      return `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (오늘)`;
    } else if (range === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (range === 'month') {
      startDate.setDate(today.getDate() - 30);
    }

    const formatDate = (date: Date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;
    return `${formatDate(startDate)} ~ ${formatDate(today)}`;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">관제 데이터 현황</h1>
        <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-slate-500">AI 시스템이 분석한 이벤트 및 알림 통계입니다.</p>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                <CalendarDays size={12} className="text-slate-400" />
                {getDateRangeText(timeRange)}
            </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-1 shadow-sm border border-slate-200 flex">
        {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              timeRange === range
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {range === 'day' ? '일간' : range === 'week' ? '주간' : '월간'}
          </button>
        ))}
      </div>
    </div>
  );
};
