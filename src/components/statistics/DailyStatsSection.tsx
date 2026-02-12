'use client';

import { useMemo } from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { Calendar as CalendarIcon, AlertTriangle, Camera, Loader2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DailySummary } from "@/types";

// --- 상수 ---
const MUTED_PASTEL_COLORS = [
  '#f87171', // 분홍 (red-400)
  '#fbbf24', // 노랑 (amber-400)
  '#4ade80', // 연두 (green-400)
  '#60a5fa', // 하늘 (blue-400)
  '#c084fc', // 보라 (purple-400)
];
const ALL_EVENT_TYPES = ['폭행', '절도', '실신', '투기', '파손'];

interface DailyStatsSectionProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  dailyData: DailySummary | null;
  isLoading: boolean;
}

export function DailyStatsSection({ selectedDate, onSelectDate, dailyData, isLoading }: DailyStatsSectionProps) {
  const today = new Date();

  const fullEventTypeStats = useMemo(() => {
    const statsMap = new Map(dailyData?.eventTypeDistribution.map(stat => [stat.type, stat.count]));
    return ALL_EVENT_TYPES.map((typeName, index) => ({
      type: typeName,
      count: statsMap.get(typeName) || 0,
      color: MUTED_PASTEL_COLORS[index % MUTED_PASTEL_COLORS.length],
    }));
  }, [dailyData]);

  const renderLoadingOrNoData = (height: string, message: string) => {
    if (isLoading) {
      return (
        <div className={cn("flex items-center justify-center text-sm text-muted-foreground", height)}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 데이터 로딩 중...
        </div>
      );
    }
    return (
      <div className={cn("flex items-center justify-center text-sm text-muted-foreground", height)}>
        {message}
      </div>
    );
  };

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight mb-4">일간 데이터 현황</h2>
      <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-6">
        <Card className="soft-shadow w-full md:w-fit justify-self-center lg:justify-self-start">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              이벤트 캘린더
              <Badge variant="secondary" className="ml-auto text-xs">Today: {format(today, 'M/d')}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onSelectDate}
              locale={ko}
              disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
              defaultMonth={selectedDate}
              className="rounded-md border"
            />
            {selectedDate && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                <span className="text-sm font-medium">
                  {format(selectedDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
                </span>
                {isSameDay(selectedDate, today) && <Badge variant="default" className="text-xs">오늘</Badge>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {selectedDate ? format(selectedDate, 'M월 d일', { locale: ko }) : '날짜 선택'} 상세 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && renderLoadingOrNoData("h-[300px]", "데이터 로딩 중...")}
            {!isLoading && !dailyData && renderLoadingOrNoData("h-[300px]", "캘린더에서 날짜를 선택하세요.")}
            {dailyData && (
              <div className="grid md:grid-cols-3 gap-4">
                {/* 이벤트 추이 */}
                <div className="md:col-span-1">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    시간대별 이벤트
                  </h4>
                  <div className="h-[240px]">
                    {dailyData.hourlyTrend && dailyData.hourlyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyData.hourlyTrend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                           <defs>
                            <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                            formatter={(value: number) => [`${value}건`, '']}
                            labelFormatter={(label) => `${label}시`}
                          />
                          <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#colorEvents)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        데이터 없음
                      </div>
                    )}
                  </div>
                </div>

                {/* 이벤트 유형 분포 */}
                <div className="md:col-span-1">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    이벤트 유형
                  </h4>
                  <div className="h-[240px]">
                    {dailyData.eventTypeDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={fullEventTypeStats.filter(stat => stat.count > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="count"
                            nameKey="type"
                          >
                            {fullEventTypeStats.map((entry) => (
                              <Cell key={`cell-${entry.type}`} fill={entry.color} />
                            ))}
                          </Pie>
                           <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                            formatter={(value: number) => [`${value}건`, '']}
                          />
                          <Legend
                            payload={
                              fullEventTypeStats.filter(s => s.count > 0).map(item => ({
                                value: `${item.type} (${item.count})`,
                                type: 'circle',
                                color: item.color,
                              }))
                            }
                            verticalAlign="bottom"
                            height={50}
                            iconSize={8}
                            formatter={(value) => (
                              <span className="text-xs" style={{ color: 'hsl(var(--foreground))' }}>
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        데이터 없음
                      </div>
                    )}
                  </div>
                </div>

                {/* 카메라별 이벤트 */}
                <div className="md:col-span-1">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    카메라별 이벤트
                  </h4>
                  <ScrollArea className="h-[240px]">
                    <div className="space-y-2 pr-2">
                      {dailyData.cameraDistribution.length > 0 ? (
                        dailyData.cameraDistribution.map((camera) => (
                          <div key={camera.cameraName} className="p-2 bg-muted/30 rounded border text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{camera.cameraName}</span>
                              <Badge variant="secondary" className="text-xs">
                                {camera.count}건
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          데이터 없음
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
