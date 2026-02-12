'use client';

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { AlertTriangle, TrendingUp, Camera, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PeriodTrend, EventTypeDistribution, CameraDistribution, PeriodSummary } from "@/types";
import { PeriodSelector } from "./PeriodSelector";
import type { DateRange } from "react-day-picker";

// --- 상수 ---
const MUTED_PASTEL_COLORS = [
  '#f87171', // 분홍 (red-400)
  '#fbbf24', // 노랑 (amber-400)
  '#4ade80', // 연두 (green-400)
  '#60a5fa', // 하늘 (blue-400)
  '#c084fc', // 보라 (purple-400)
];

const ALL_EVENT_TYPES = ['폭행', '절도', '실신', '투기', '파손'];

interface PeriodStatsSectionProps {
  periodType: string;
  onPeriodTypeChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onPeriodSelect: (start: Date | undefined, end: Date | undefined) => void;
  periodTrend: PeriodTrend[] | null;
  eventTypeDist: EventTypeDistribution[] | null;
  cameraDist: CameraDistribution[] | null;
  periodSummary: PeriodSummary | null;
  isLoading: boolean;
}

export function PeriodStatsSection({
  periodType,
  onPeriodTypeChange,
  dateRange,
  onDateRangeChange,
  onPeriodSelect,
  periodTrend,
  eventTypeDist,
  cameraDist,
  periodSummary,
  isLoading,
}: PeriodStatsSectionProps) {

  const fullEventTypeStats = useMemo(() => {
    const statsMap = new Map(eventTypeDist?.map(stat => [stat.type, stat.count]));
    return ALL_EVENT_TYPES.map((typeName, index) => ({
      type: typeName,
      count: statsMap.get(typeName) || 0,
      color: MUTED_PASTEL_COLORS[index % MUTED_PASTEL_COLORS.length],
    }));
  }, [eventTypeDist]);

  const renderLoadingOrNoData = (height: string, isLoading: boolean, hasData: boolean, initialMessage: string) => {
    if (isLoading) {
      return (
        <div className={cn("flex items-center justify-center text-sm text-muted-foreground", height)}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 데이터 로딩 중...
        </div>
      );
    }
    if (!hasData) {
      return (
        <div className={cn("flex items-center justify-center text-sm text-muted-foreground", height)}>
          {initialMessage}
        </div>
      );
    }
    return null;
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold tracking-tight">기간별 통계</h2>
        <PeriodSelector
          periodType={periodType}
          onPeriodTypeChange={onPeriodTypeChange}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          onPeriodSelect={onPeriodSelect}
        />
      </div>
      <div className="grid gap-6">
        {/* 기간별 이벤트 요약 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />기간별 이벤트 요약</CardTitle>
          </CardHeader>
          <CardContent>
            {renderLoadingOrNoData("h-24", isLoading, !!periodSummary, "기간을 선택하여 데이터를 조회하세요.") || (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>기간</TableHead>
                    <TableHead className="text-center">총 이벤트</TableHead>
                    <TableHead className="text-center">분석 완료율</TableHead>
                    <TableHead className="text-center">주요 유형</TableHead>
                    <TableHead className="text-center">긴급 알림</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{periodSummary?.period}</TableCell>
                    <TableCell className="text-center">{periodSummary?.totalEvents}</TableCell>
                    <TableCell className="text-center">
                      {periodSummary?.totalEvents ? Math.round((periodSummary.resolvedEvents / periodSummary.totalEvents) * 100) : 0}%
                    </TableCell>
                    <TableCell className="text-center">{periodSummary?.topEventType}</TableCell>
                    <TableCell className="text-center text-destructive font-bold">{periodSummary?.alerts}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 통합 통계 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">기간별 상세 통계</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-8">
            {/* 기간별 이벤트 추이 */}
            <div className="md:col-span-1">
              <h3 className="font-semibold flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-primary" />이벤트 추이</h3>
              {renderLoadingOrNoData("h-[250px]", isLoading, !!periodTrend && periodTrend.length > 0, "데이터가 없습니다.") || (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={periodTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="totalEvents" name="발생" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolvedEvents" name="분석완료" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 기간별 이벤트 유형 분포 */}
            <div className="md:col-span-1">
              <h3 className="font-semibold flex items-center gap-2 mb-4"><AlertTriangle className="h-5 w-5 text-primary" />이벤트 유형 분포</h3>
              {renderLoadingOrNoData("h-[250px]", isLoading, !!eventTypeDist && eventTypeDist.length > 0, "데이터가 없습니다.") || (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={fullEventTypeStats.filter(stat => stat.count > 0)}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {fullEventTypeStats.map((entry) => (
                        <Cell key={`cell-${entry.type}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 기간별 카메라별 이벤트 분포 */}
            <div className="md:col-span-1">
              <h3 className="font-semibold flex items-center gap-2 mb-4"><Camera className="h-5 w-5 text-primary" />카메라별 이벤트 분포</h3>
              {renderLoadingOrNoData("h-[250px]", isLoading, !!cameraDist && cameraDist.length > 0, "데이터가 없습니다.") || (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cameraDist || []} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={12} />
                    <YAxis type="category" dataKey="cameraName" width={100} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" name="이벤트 수" fill="hsl(var(--primary) / 0.6)" radius={[0, 4, 4, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
