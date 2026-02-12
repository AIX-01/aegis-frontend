'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { fetcher } from '@/lib/utils';
import { DashboardLoading } from './DashboardLoading';
import { DashboardHeader } from './DashboardHeader';
import { KpiCards } from './KpiCards';
import { ChartGrid } from './ChartGrid';

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

  return (
    <ProtectedRoute>
      <DashboardLayout title="통계">
        <DashboardHeader timeRange={timeRange} setTimeRange={setTimeRange} />

        {isLoading ? (
          <DashboardLoading />
        ) : error ? (
          <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        ) : data ? (
          <div className="space-y-6">
            <KpiCards data={data.kpi} />
            <ChartGrid
              trend={data.trend}
              eventTypeDistribution={data.eventTypeDistribution}
              heatmap={data.heatmap}
              topCameras={data.topCameras}
              timeRange={timeRange}
            />
          </div>
        ) : null}
      </DashboardLayout>
    </ProtectedRoute>
  );
};
