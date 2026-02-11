'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Calendar as CalendarIcon, AlertTriangle, Camera, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DailySummary } from "@/types";

// --- 상수 ---
const PIE_CHART_COLORS = ['#2563eb', '#16a34a', '#9333ea', '#0d9488', '#4f46e5'];

interface DailyStatsSectionProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  dailyData: DailySummary | null;
  isLoading: boolean;
}

export function DailyStatsSection({ selectedDate, onSelectDate, dailyData, isLoading }: DailyStatsSectionProps) {
  const dailyTitle = selectedDate
    ? `${format(selectedDate, "yyyy년 M월 d일 (eee)", { locale: ko })}의 일간 이벤트`
    : "일간 상세 분석";

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
      <h2 className="text-2xl font-bold tracking-tight mb-4">일간 데이터 현황</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col h-[430px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary" />날짜 선택</CardTitle>
            <CardDescription>분석하고 싶은 특정 날짜를 선택하세요.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onSelectDate}
              className="rounded-md border"
              locale={ko}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col h-[430px]">
          <CardHeader>
            <CardTitle>{dailyTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-grow">
            {renderLoadingOrNoData("h-full", isLoading, !!dailyData, "캘린더에서 날짜를 선택하세요.") || (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2">총 이벤트</h3>
                  <p className="text-4xl font-bold">{dailyData?.totalEvents}건</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 flex-grow">
                  <Card className="flex flex-col border-0 shadow-none">
                    <CardHeader className="py-2 px-0">
                      <CardTitle className="text-base flex items-center gap-2"><Camera className="h-4 w-4" />카메라별 분포</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow px-0">
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={dailyData?.cameraDistribution} layout="vertical" margin={{ left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="cameraName" width={80} tick={{fontSize: 11}} />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="flex flex-col border-0 shadow-none">
                    <CardHeader className="py-2 px-0">
                      <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />이벤트 유형 분포</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow px-0">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={dailyData?.eventTypeDistribution}
                            dataKey="count"
                            nameKey="type"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={2}
                          >
                            {dailyData?.eventTypeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
