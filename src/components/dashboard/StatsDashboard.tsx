'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { statsApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { DailyStat, EventTypeStat, MonthlyEventData } from "@/types";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function StatsDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // React Query로 통계 데이터 조회
  const { data: dailyStats = [] } = useQuery<DailyStat[]>({
    queryKey: queryKeys.stats.daily,
    queryFn: statsApi.getDaily,
  });

  const { data: eventTypeStats = [] } = useQuery<EventTypeStat[]>({
    queryKey: queryKeys.stats.eventTypes,
    queryFn: statsApi.getEventTypes,
  });

  const { data: monthlyEventData = {} } = useQuery<MonthlyEventData>({
    queryKey: queryKeys.stats.monthly,
    queryFn: statsApi.getMonthly,
  });

  // 선택된 날짜의 통계 가져오기
  const getDateStats = (date: Date | undefined) => {
    if (!date) return null;
    const dateKey = format(date, 'yyyy-MM-dd');
    return monthlyEventData[dateKey] || null;
  };

  const selectedDateStats = getDateStats(selectedDate);

  // 캘린더에서 이벤트가 있는 날짜 표시
  const modifiers = {
    hasEvents: (date: Date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return !!monthlyEventData[dateKey];
    },
    hasAlerts: (date: Date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return (monthlyEventData[dateKey]?.alerts || 0) > 0;
    },
  };

  const modifiersStyles = {
    hasEvents: {
      fontWeight: 'bold' as const,
    },
    hasAlerts: {
      backgroundColor: 'hsl(var(--destructive) / 0.1)',
      color: 'hsl(var(--destructive))',
    },
  };

  return (
    <div className="space-y-6">

      {/* Calendar + Selected Date Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="soft-shadow lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              이벤트 캘린더
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ko}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border pointer-events-auto"
            />
            
            {/* 선택된 날짜 통계 */}
            {selectedDate && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {format(selectedDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
                </p>
                {selectedDateStats ? (
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="h-6">
                        이벤트 {selectedDateStats.events}건
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="h-6">
                        알림 {selectedDateStats.alerts}건
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">이벤트 데이터 없음</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly trend chart */}
        <Card className="soft-shadow lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">주간 이벤트 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }} 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar 
                    dataKey="events" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="발생"
                  />
                  <Bar 
                    dataKey="resolved" 
                    fill="hsl(var(--success))" 
                    radius={[4, 4, 0, 0]}
                    name="해결"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event type distribution */}
      <Card className="soft-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">이벤트 유형 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventTypeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="type"
                >
                  {eventTypeStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
                  verticalAlign="middle" 
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}