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
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    if (range === 'day') {
      return `${year}년 ${month}월 ${today.getDate()}일`;
    } else if (range === 'week') {
      // 해당 월의 몇 주차인지 계산 (월요일 기준, 백엔드와 동일)
      const firstDayOfMonth = new Date(year, today.getMonth(), 1);
      const firstMonday = new Date(firstDayOfMonth);
      const dayOfWeek = firstDayOfMonth.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
      firstMonday.setDate(firstDayOfMonth.getDate() + daysUntilMonday);

      let weekOfMonth: number;
      if (today < firstMonday) {
        weekOfMonth = 1;
      } else {
        const diffDays = Math.floor((today.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
        weekOfMonth = Math.floor(diffDays / 7) + (daysUntilMonday > 0 ? 2 : 1);
      }
      return `${year}년 ${month}월 ${weekOfMonth}주차`;
    } else if (range === 'month') {
      return `${year}년 ${month}월`;
    }
    return '';
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
