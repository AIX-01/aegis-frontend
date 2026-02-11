'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { AlertTriangle, TrendingUp, Camera, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PeriodTrend, EventTypeDistribution, CameraDistribution, PeriodSummary } from "@/types";
import { PeriodSelector } from "./PeriodSelector";
import type { DateRange } from "react-day-picker";

// --- 상수 ---
const PIE_CHART_COLORS = ['#2563eb', '#16a34a', '#9333ea', '#0d9488', '#4f46e5'];

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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 기간별 이벤트 요약 */}
        <Card className="lg:col-span-2">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />기간별 이벤트 추이</CardTitle>
          </CardHeader>
          <CardContent>
            {renderLoadingOrNoData("h-[250px]", isLoading, !!periodTrend && periodTrend.length > 0, "기간을 선택하여 데이터를 조회하세요.") || (
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />기간별 이벤트 유형 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {renderLoadingOrNoData("h-[250px]", isLoading, !!eventTypeDist && eventTypeDist.length > 0, "기간을 선택하여 데이터를 조회하세요.") || (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={eventTypeDist || []}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {eventTypeDist?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" />기간별 카메라별 이벤트 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {renderLoadingOrNoData("h-[300px]", isLoading, !!cameraDist && cameraDist.length > 0, "기간을 선택하여 데이터를 조회하세요.") || (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cameraDist || []} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="cameraName" width={100} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name="이벤트 수" fill="hsl(var(--primary) / 0.6)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
