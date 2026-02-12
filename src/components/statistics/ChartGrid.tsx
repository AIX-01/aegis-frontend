import React from 'react';
import { TrendLineChart } from './TrendLineChart';
import { EventTypeDonutChart } from './EventTypeDonutChart';
import { HeatmapChart } from './HeatmapChart';
import { TopCamerasList } from './TopCamerasList';

// Define types based on StatisticsDashboard's StatisticsResponse
interface TrendData {
    title: string;
    xAxis: string[];
    series: number[];
}

interface EventTypeDistributionData {
    items: {
        type: string;
        count: number;
        percentage: number;
    }[];
}

interface HeatmapData {
    title: string;
    yAxis: string[];
    series: {
        x: number;
        y: number;
        value: number;
    }[];
}

interface TopCameraData {
    rank: number;
    name: string;
    count: number;
    alert: boolean;
}

interface ChartGridProps {
  trend: TrendData;
  eventTypeDistribution: EventTypeDistributionData;
  heatmap: HeatmapData;
  topCameras: TopCameraData[];
  timeRange: 'day' | 'week' | 'month';
}

export const ChartGrid: React.FC<ChartGridProps> = ({ trend, eventTypeDistribution, heatmap, topCameras, timeRange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TrendLineChart title={trend.title} xAxis={trend.xAxis} series={trend.series} />
        <EventTypeDonutChart items={eventTypeDistribution.items} timeRange={timeRange} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HeatmapChart title={heatmap.title} yAxis={heatmap.yAxis} series={heatmap.series} />
        <TopCamerasList items={topCameras} />
      </div>
    </div>
  );
};
