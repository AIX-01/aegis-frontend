'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
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
import { fetcher } from '@/lib/utils';

type TimeRange = 'day' | 'week' | 'month';

interface StatisticsResponse {
    kpi: {
        totalEvents: string;
        totalEventsTrend: string;
        totalEventsTrendUp: boolean;
        emergencyAlerts: string;
        emergencyAlertsTrend: string;
        emergencyAlertsTrendUp: boolean;
        analysisCompletionRate: string;
        analysisCompletionRateTrend: string;
        analysisCompletionRateTrendUp: boolean;
        monitoringCameras: string;
        monitoringCamerasUnit: string;
        monitoringCamerasTrend: string;
        monitoringCamerasTrendUp: boolean;
    };
    trend: {
        title: string;
        xAxis: string[];
        series: number[];
    };
    eventTypeDistribution: {
        items: {
            type: string;
            count: number;
            percentage: number;
        }[];
    };
    heatmap: {
        title: string;
        yAxis: string[];
        series: {
            x: number;
            y: number;
            value: number;
        }[];
    };
    topCameras: {
        rank: number;
        name: string;
        count: number;
        alert: boolean;
    }[];
}

export const StatisticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const { data, error, isLoading } = useSWR<StatisticsResponse>(`/api/stats/dashboard?timeRange=${timeRange}`, fetcher);

  const renderLoading = () => (
    <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-100 h-32 rounded-xl" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-100 h-80 rounded-xl" />
            <div className="bg-slate-100 h-80 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-100 h-72 rounded-xl" />
            <div className="bg-slate-100 h-72 rounded-xl" />
        </div>
    </div>
  );

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

        {isLoading ? renderLoading() : error ? <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p> : data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard
                    title="모니터링 카메라"
                    value={data.kpi.monitoringCameras}
                    unit={data.kpi.monitoringCamerasUnit}
                    trend={data.kpi.monitoringCamerasTrend}
                    trendUp={data.kpi.monitoringCamerasTrendUp}
                    icon={<Camera size={20} className="text-purple-500" />}
                    color="bg-purple-50"
                />
              <KpiCard
                  title="총 발생 이벤트"
                  value={data.kpi.totalEvents}
                  unit="건"
                  trend={data.kpi.totalEventsTrend}
                  trendUp={data.kpi.totalEventsTrendUp}
                  icon={<Activity size={20} className="text-blue-500" />}
                  color="bg-blue-50"
              />
              <KpiCard
                  title="긴급 (위험) 알림"
                  value={data.kpi.emergencyAlerts}
                  unit="건"
                  trend={data.kpi.emergencyAlertsTrend}
                  trendUp={data.kpi.emergencyAlertsTrendUp}
                  icon={<AlertTriangle size={20} className="text-red-500" />}
                  color="bg-red-50"
                  alert={true}
              />
              <KpiCard
                  title="분석 완료율 (AI)"
                  value={data.kpi.analysisCompletionRate}
                  unit="%"
                  trend={data.kpi.analysisCompletionRateTrend}
                  trendUp={data.kpi.analysisCompletionRateTrendUp}
                  icon={<ShieldCheck size={20} className="text-emerald-500" />}
                  color="bg-emerald-50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <TrendLineChart title={data.trend.title} xAxis={data.trend.xAxis} series={data.trend.series} />
              <EventTypeDonutChart items={data.eventTypeDistribution.items} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HeatmapChart title={data.heatmap.title} yAxis={data.heatmap.yAxis} series={data.heatmap.series} />
              <TopCamerasList items={data.topCameras} />
            </div>
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};
