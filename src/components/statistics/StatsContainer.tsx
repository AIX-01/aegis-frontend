'use client';

import { useState, useCallback } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useStatsData } from "@/hooks/useStatsData";
import { DailyStatsSection } from "./DailyStatsSection";
import { PeriodStatsSection } from "./PeriodStatsSection";

export function StatsContainer() {
  // UI 상태 관리
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [periodType, setPeriodType] = useState("monthly");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // API 호출을 위한 기간 상태
  const [periodStart, setPeriodStart] = useState<Date | undefined>(startOfMonth(new Date()));
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>(endOfMonth(new Date()));

  // 커스텀 훅을 통해 데이터 로딩 및 상태 관리 위임
  const {
    dailyData,
    periodTrend,
    eventTypeDist,
    cameraDist,
    periodSummary,
    isDailyLoading,
    isPeriodLoading,
  } = useStatsData({
    selectedDate,
    periodType,
    periodStart,
    periodEnd,
  });

  // useCallback으로 감싸서 불필요한 리렌더링 방지
  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setPeriodStart(range.from);
      setPeriodEnd(range.to);
    }
  }, []);

  const handlePeriodSelect = useCallback((start: Date | undefined, end: Date | undefined) => {
    setPeriodStart(start);
    setPeriodEnd(end);
  }, []);

  return (
    <div className="space-y-8">
      <DailyStatsSection
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        dailyData={dailyData}
        isLoading={isDailyLoading}
      />
      <PeriodStatsSection
        periodType={periodType}
        onPeriodTypeChange={setPeriodType}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onPeriodSelect={handlePeriodSelect}
        periodTrend={periodTrend}
        eventTypeDist={eventTypeDist}
        cameraDist={cameraDist}
        periodSummary={periodSummary}
        isLoading={isPeriodLoading}
      />
    </div>
  );
}
