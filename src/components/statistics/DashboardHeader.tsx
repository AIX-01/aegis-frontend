import React from 'react';

type TimeRange = 'day' | 'week' | 'month';

interface DashboardHeaderProps {
  timeRange: TimeRange;
  setTimeRange: (timeRange: TimeRange) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ timeRange, setTimeRange }) => {
  return (
    <div className="flex justify-between items-end mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">관제 데이터 현황</h1>
        <p className="text-sm text-slate-500 mt-1">AI 시스템이 분석한 이벤트 및 알림 통계입니다.</p>
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
