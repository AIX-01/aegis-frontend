'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { TrendLineChart } from './TrendLineChart';
import { EventTypeDonutChart } from './EventTypeDonutChart';
import { HeatmapChart } from './HeatmapChart';
import { TopCamerasList } from './TopCamerasList';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

type TimeRange = 'day' | 'week' | 'month';

interface ChartConfigItem {
  lineTitle: string;
  lineXAxis: string[];
  heatmapTitle: string;
  heatmapY: string[];
}

export const StatisticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');

  const chartConfig: Record<TimeRange, ChartConfigItem> = {
    day: {
      lineTitle: '시간대별 이벤트 추이',
      lineXAxis: ['00시', '04시', '08시', '12시', '16시', '20시', '24시'],
      heatmapTitle: '구역/시간대별 집중도',
      heatmapY: ['정문', '후문', '주차장', '로비', '복도', '외곽', '옥상'],
    },
    week: {
      lineTitle: '요일별 이벤트 추이',
      lineXAxis: ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'],
      heatmapTitle: '요일/시간대별 발생 패턴',
      heatmapY: ['월', '화', '수', '목', '금', '토', '일'],
    },
    month: {
      lineTitle: '일별 이벤트 추이',
      lineXAxis: ['1일', '5일', '10일', '15일', '20일', '25일', '말일'],
      heatmapTitle: '요일/시간대별 발생 패턴 (월간 평균)',
      heatmapY: ['월', '화', '수', '목', '금', '토', '일'],
    }
  };

  const currentConfig = chartConfig[timeRange];

  return (
    <ProtectedRoute>
      <DashboardLayout title="통계">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
              title="총 발생 이벤트"
              value="1,248"
              unit="건"
              trend="+12% (전일 대비)"
              trendUp={true}
              icon={<Activity size={20} className="text-blue-500" />}
              color="bg-blue-50"
          />
          <KpiCard
              title="긴급 (위험) 알림"
              value="7"
              unit="건"
              trend="+2건 (전일 대비)"
              trendUp={true}
              icon={<AlertTriangle size={20} className="text-red-500" />}
              color="bg-red-50"
              alert={true}
          />
          <KpiCard
              title="분석 완료율 (AI)"
              value="99.8"
              unit="%"
              trend="변동 없음"
              trendUp={null}
              icon={<ShieldCheck size={20} className="text-emerald-500" />}
              color="bg-emerald-50"
          />
          <KpiCard
              title="모니터링 카메라"
              value="45"
              unit="/ 45 대"
              trend="모두 정상 작동중"
              trendUp={null}
              icon={<Camera size={20} className="text-purple-500" />}
              color="bg-purple-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <TrendLineChart title={currentConfig.lineTitle} xAxis={currentConfig.lineXAxis} />
          <EventTypeDonutChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HeatmapChart title={currentConfig.heatmapTitle} yAxis={currentConfig.heatmapY} />
          <TopCamerasList />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};
