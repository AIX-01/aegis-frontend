'use client';

import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CalendarDays, AlertTriangle, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statsApi } from "@/lib/api";
import type { DailyStat, EventTypeStat, MonthlyEventData } from "@/types";
import { format, startOfWeek, endOfWeek, subWeeks, isSameDay, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

// --- 타입 정의 ---

interface WeekOption {
  value: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

interface DailyReportSummary {
  date: string;
  totalEvents: number;
  resolvedEvents: number;
  pendingEvents: number;
  alerts: number;
  topEventType: string;
  overallStatus: 'safe' | 'caution' | 'warning' | 'critical';
}

// --- 상수 ---

const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  safe: { color: 'bg-green-500 text-white', label: '안전', icon: '✓' },
  caution: { color: 'bg-blue-500 text-white', label: '주의', icon: '!' },
  warning: { color: 'bg-orange-500 text-white', label: '경고', icon: '⚠' },
  critical: { color: 'bg-red-500 text-white', label: '위험', icon: '⛔' },
};

// 모든 이벤트 유형과 고정 색상을 프론트엔드에 정의
const ALL_EVENT_TYPES_CONFIG = [
  { name: '폭행', color: '#2563eb' }, // blue-600
  { name: '절도', color: '#16a34a' }, // green-600
  { name: '실신', color: '#9333ea' }, // purple-600
  { name: '투기', color: '#0d9488' }, // teal-600
  { name: '파손', color: '#4f46e5' }, // indigo-600
];

// --- 메인 컴포넌트 ---

export function StatsDashboard() {
  const today = useMemo(() => new Date(), []);

  // --- 상태 관리 ---
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [selectedWeek, setSelectedWeek] = useState<string>(() => format(startOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd'));
  const [monthlyData, setMonthlyData] = useState<MonthlyEventData>({});
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [eventTypeStats, setEventTypeStats] = useState<EventTypeStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 데이터 로딩 ---
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [monthly, daily, eventTypes] = await Promise.all([
          statsApi.getMonthly(),
          statsApi.getDaily(),
          statsApi.getEventTypes(),
        ]);
        setMonthlyData(monthly || {});
        setDailyStats(daily || []);
        setEventTypeStats(eventTypes || []);
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [selectedWeek]);

  // --- 메모이제이션된 계산 ---

  // API 데이터를 기반으로 전체 유형 목록을 생성 (발생 0건 포함)
  const fullEventTypeStats = useMemo(() => {
    const statsMap = new Map(eventTypeStats.map(stat => [stat.type, stat.count]));
    return ALL_EVENT_TYPES_CONFIG.map(config => ({
      type: config.name,
      count: statsMap.get(config.name) || 0,
      color: config.color,
    }));
  }, [eventTypeStats]);

  const weekOptions: WeekOption[] = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 0 });
      return {
        value: format(weekStart, 'yyyy-MM-dd'),
        label: i === 0
          ? `이번 주 (${format(weekStart, 'M/d')} ~ ${format(weekEnd, 'M/d')})`
          : `${format(weekStart, 'M/d')} ~ ${format(weekEnd, 'M/d')}`,
        startDate: weekStart,
        endDate: weekEnd,
      };
    });
  }, [today]);

  const selectedDateDetail = useMemo(() => {
    if (!selectedDate) return null;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayData = monthlyData[dateKey];
    return {
      date: dateKey,
      totalEvents: dayData?.events || 0,
      alerts: dayData?.alerts || 0,
    };
  }, [selectedDate, monthlyData]);

  const weeklyReports = useMemo((): DailyReportSummary[] => {
    const selectedWeekStart = parseISO(selectedWeek);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(selectedWeekStart);
      date.setDate(date.getDate() + i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = monthlyData[dateKey];
      const totalEvents = dayData?.events || 0;
      const alerts = dayData?.alerts || 0;

      const dayName = dayNames[date.getDay()];
      const dailyStat = dailyStats.find(d => d.day === dayName);
      const resolvedEvents = dailyStat?.resolved || 0;

      let overallStatus: 'safe' | 'caution' | 'warning' | 'critical' = 'safe';
      if (alerts >= 5) overallStatus = 'critical';
      else if (alerts >= 3) overallStatus = 'warning';
      else if (totalEvents > 0) overallStatus = 'caution';

      const topEventType = fullEventTypeStats.length > 0
        ? fullEventTypeStats.reduce((max, stat) => (stat.count > max.count ? stat : max), fullEventTypeStats[0]).type
        : '-';

      return {
        date: dateKey,
        totalEvents,
        resolvedEvents,
        pendingEvents: Math.max(0, totalEvents - resolvedEvents),
        alerts,
        topEventType,
        overallStatus,
      };
    });
  }, [selectedWeek, monthlyData, dailyStats, fullEventTypeStats]);

  const weeklySummary = useMemo(() => {
    const totalEvents = dailyStats.reduce((acc, d) => acc + d.events, 0);
    const totalResolved = dailyStats.reduce((acc, d) => acc + d.resolved, 0);
    const resolutionRate = totalEvents > 0 ? Math.round((totalResolved / totalEvents) * 100) : 0;
    return { totalEvents, resolutionRate };
  }, [dailyStats]);

  const modifiers = {
    hasEvents: (date: Date) => !!monthlyData[format(date, 'yyyy-MM-dd')],
    hasAlerts: (date: Date) => (monthlyData[format(date, 'yyyy-MM-dd')]?.alerts || 0) > 0,
  };
  const modifiersStyles = {
    hasEvents: { fontWeight: 'bold' as const },
    hasAlerts: {
      backgroundColor: 'hsl(var(--destructive) / 0.1)',
      color: 'hsl(var(--destructive))',
    },
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">통계 데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="soft-shadow lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              이벤트 캘린더
              <Badge variant="secondary" className="ml-auto text-xs">Today: {format(today, 'M/d')}</Badge>
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
              defaultMonth={today}
              className="rounded-md border pointer-events-auto"
            />
            {selectedDate && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                <span className="text-sm font-medium">
                  {format(selectedDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
                </span>
                {isSameDay(selectedDate, today) && <Badge variant="default" className="text-xs">오늘</Badge>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="soft-shadow lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {selectedDate ? format(selectedDate, 'M월 d일', { locale: ko }) : '날짜 선택'} 상세 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateDetail ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">총 이벤트</p>
                        <p className="text-3xl font-bold">{selectedDateDetail.totalEvents}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">긴급 알림</p>
                        <p className="text-3xl font-bold text-destructive">{selectedDateDetail.alerts}</p>
                    </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium my-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    전체 이벤트 유형 분포
                  </h4>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={fullEventTypeStats.filter(stat => stat.count > 0)} // 차트에는 0건인 항목은 그리지 않음
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
                          payload={ // 범례에는 0건인 항목도 모두 표시
                            fullEventTypeStats.map(item => ({
                              value: item.type,
                              type: 'circle',
                              color: item.color,
                            }))
                          }
                          verticalAlign="bottom"
                          height={36}
                          iconSize={8}
                          formatter={(value) => <span style={{ fontSize: '11px' }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                캘린더에서 날짜를 선택하세요
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="soft-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                주간 이벤트 추이
              </CardTitle>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="주 선택" />
                </SelectTrigger>
                <SelectContent>
                  {weekOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{weeklySummary.totalEvents}</p>
                <p className="text-xs text-muted-foreground">주간 총 이벤트</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-2xl font-bold">{weeklySummary.resolutionRate}%</p>
                <p className="text-xs text-muted-foreground">분석 완료율</p>
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="발생" />
                  <Bar dataKey="resolved" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} name="분석완료" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              전체 이벤트 유형 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fullEventTypeStats.filter(stat => stat.count > 0)} // 차트에는 0건인 항목은 그리지 않음
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
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
                    payload={ // 범례에는 0건인 항목도 모두 표시
                      fullEventTypeStats.map(item => ({
                        value: `${item.type} (${item.count})`,
                        type: 'circle',
                        color: item.color,
                      }))
                    }
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="soft-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            주간 이상행동 보고서 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">날짜</th>
                  <th className="text-center py-2 px-2 font-medium">상태</th>
                  <th className="text-center py-2 px-2 font-medium">이벤트 (미분석)</th>
                  <th className="text-center py-2 px-2 font-medium">분석 완료율</th>
                  <th className="text-left py-2 px-2 font-medium hidden md:table-cell">주요 정보</th>
                </tr>
              </thead>
              <tbody>
                {weeklyReports.map((report) => {
                  const resolveRate = report.totalEvents > 0
                    ? Math.round((report.resolvedEvents / report.totalEvents) * 100)
                    : 0;
                  const config = statusConfig[report.overallStatus];

                  return (
                    <tr key={report.date} className="border-b">
                      <td className="py-3 px-2">
                        <span className="font-medium">{format(parseISO(report.date), 'M/d (EEE)', { locale: ko })}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={`text-xs ${config.color}`}>
                          {config.icon} {config.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="font-semibold text-primary">{report.totalEvents}</span>
                        <span className="text-muted-foreground text-xs ml-1">({report.pendingEvents})</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`font-semibold ${resolveRate >= 80 ? 'text-green-500' : resolveRate >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                          {resolveRate}%
                        </span>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">⚠ {report.topEventType}</Badge>
                          {report.alerts > 0 && (
                            <Badge variant="destructive" className="text-xs">긴급 {report.alerts}</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
