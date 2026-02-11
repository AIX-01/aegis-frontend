import { useState, useEffect } from "react";
import { format } from "date-fns";
import { statsApi } from "@/lib/api";
import type { DailySummary, PeriodTrend, EventTypeDistribution, CameraDistribution, PeriodSummary } from "@/types";

interface UseStatsDataProps {
  selectedDate: Date | undefined;
  periodType: string;
  periodStart: Date | undefined;
  periodEnd: Date | undefined;
}

export function useStatsData({
  selectedDate,
  periodType,
  periodStart,
  periodEnd,
}: UseStatsDataProps) {
  // 데이터 상태
  const [dailyData, setDailyData] = useState<DailySummary | null>(null);
  const [periodTrend, setPeriodTrend] = useState<PeriodTrend[] | null>(null);
  const [eventTypeDist, setEventTypeDist] = useState<EventTypeDistribution[] | null>(null);
  const [cameraDist, setCameraDist] = useState<CameraDistribution[] | null>(null);
  const [periodSummary, setPeriodSummary] = useState<PeriodSummary | null>(null);

  // 로딩 상태
  const [isDailyLoading, setIsDailyLoading] = useState(false);
  const [isPeriodLoading, setIsPeriodLoading] = useState(false);

  // 일간 데이터 로딩
  useEffect(() => {
    const fetchDailyData = async () => {
      if (!selectedDate) {
        setDailyData(null);
        return;
      }
      setIsDailyLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const data = await statsApi.getDailySummary(dateStr);
        setDailyData(data);
      } catch (error) {
        console.error("일간 데이터 로딩 실패:", error);
        setDailyData(null);
      } finally {
        setIsDailyLoading(false);
      }
    };
    fetchDailyData();
  }, [selectedDate]);

  // 기간별 데이터 로딩
  useEffect(() => {
    const fetchPeriodData = async () => {
      if (periodType !== 'overall' && (!periodStart || !periodEnd)) {
        setPeriodTrend(null);
        setEventTypeDist(null);
        setCameraDist(null);
        setPeriodSummary(null);
        return;
      }

      setIsPeriodLoading(true);
      setPeriodTrend(null);
      setEventTypeDist(null);
      setCameraDist(null);
      setPeriodSummary(null);

      try {
        const startStr = periodStart ? format(periodStart, 'yyyy-MM-dd') : undefined;
        const endStr = periodEnd ? format(periodEnd, 'yyyy-MM-dd') : undefined;

        const [trend, eventType, camera, summary] = await Promise.all([
          statsApi.getPeriodTrend(startStr, endStr),
          statsApi.getEventTypeDistribution(startStr, endStr),
          statsApi.getCameraDistribution(startStr, endStr),
          statsApi.getPeriodSummary(startStr, endStr),
        ]);

        setPeriodTrend(trend);
        setEventTypeDist(eventType);
        setCameraDist(camera);
        setPeriodSummary(summary);
      } catch (error) {
        console.error("기간별 데이터 로딩 실패:", error);
      } finally {
        setIsPeriodLoading(false);
      }
    };
    fetchPeriodData();
  }, [periodType, periodStart, periodEnd]);

  return {
    dailyData,
    periodTrend,
    eventTypeDist,
    cameraDist,
    periodSummary,
    isDailyLoading,
    isPeriodLoading,
  };
}
