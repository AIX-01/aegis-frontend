'use client';

import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CalendarDays, Camera, AlertTriangle, FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { statsApi } from "@/lib/api";
import type { DailyStat, EventTypeStat, MonthlyEventData, CameraStat, DailyDetailStat, DailyReportSummary } from "@/types";
import { format, startOfWeek, endOfWeek, subWeeks, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";

// 주차 옵션 인터페이스
interface WeekOption {
  value: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

// 선택된 날짜 상세 정보
interface DailyEventDetail {
  date: string;
  cameraStats: CameraStat[];
  eventTypeStats: EventTypeStat[];
  totalEvents: number;
  resolvedEvents: number;
}

// 상태별 스타일 설정
const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  safe: { color: 'bg-green-500 text-white', label: '안전', icon: '✓' },
  caution: { color: 'bg-blue-500 text-white', label: '주의', icon: '!' },
  warning: { color: 'bg-orange-500 text-white', label: '경고', icon: '⚠' },
  critical: { color: 'bg-red-500 text-white', label: '위험', icon: '⛔' },
};

export function StatsDashboard() {
  // 컴포넌트 마운트 시점의 날짜
  const today = useMemo(() => new Date(), []);

  // 주차 옵션 생성 (현재 주 + 지난 8주, 일요일 시작)
  const weekOptions: WeekOption[] = useMemo(() => {
    const options: WeekOption[] = [];
    for (let i = 0; i < 9; i++) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 0 });
      options.push({
        value: format(weekStart, 'yyyy-MM-dd'),
        label: i === 0
          ? `이번 주 (${format(weekStart, 'M/d')} ~ ${format(weekEnd, 'M/d')})`
          : `${format(weekStart, 'M/d')} ~ ${format(weekEnd, 'M/d')}`,
        startDate: weekStart,
        endDate: weekEnd,
      });
    }
    return options;
  }, [today]);

  // 상태 관리
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [selectedWeek, setSelectedWeek] = useState<string>(weekOptions[0].value);
  const [monthlyEventData, setMonthlyEventData] = useState<MonthlyEventData>({});
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [eventTypeStats, setEventTypeStats] = useState<EventTypeStat[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReportSummary | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // 선택된 주의 시작일
  const selectedWeekStart = useMemo(() => {
    const option = weekOptions.find(w => w.value === selectedWeek);
    return option?.startDate || startOfWeek(today, { weekStartsOn: 1 });
  }, [selectedWeek, weekOptions, today]);

  // 선택된 날짜의 상세 데이터
  const selectedDateDetail = useMemo((): DailyEventDetail | null => {
    if (!selectedDate) return null;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayData = monthlyEventData[dateKey];

    if (!dayData) {
      return {
        date: dateKey,
        totalEvents: 0,
        resolvedEvents: 0,
        cameraStats: [],
        eventTypeStats: [],
      };
    }

    const totalEvents = dayData.events || 0;

    return {
      date: dateKey,
      totalEvents,
      resolvedEvents: 0, // API 미구현
      cameraStats: [],
      eventTypeStats: eventTypeStats.length > 0 ? eventTypeStats : [],
    };
  }, [selectedDate, monthlyEventData, eventTypeStats]);

  // 주간 일별 통계
  const weeklyDailyStats = useMemo(() => {
    if (dailyStats.length > 0) {
      return dailyStats;
    }
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return dayNames.map(day => ({ day, events: 0, analyzed: 0 }));
  }, [dailyStats]);

  // 주간 이벤트 유형 통계
  const weeklyEventTypeStats = useMemo(() => {
    return eventTypeStats.length > 0 ? eventTypeStats : [];
  }, [eventTypeStats]);

  // 주간 상세 통계
  const weeklyDetailStats = useMemo((): DailyDetailStat[] => {
    const stats: DailyDetailStat[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeekStart);
      date.setDate(date.getDate() + i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = monthlyEventData[dateKey];
      const totalEvents = dayData?.events || 0;

      stats.push({
        date: dateKey,
        totalEvents,
        byType: {
          assault: 0,
          burglary: 0,
          dump: 0,
          swoon: 0,
          vandalism: 0,
        },
        resolvedCount: 0, // API 미구현
        avgResponseTime: 0, // API 미구현
      });
    }
    return stats;
  }, [selectedWeekStart, monthlyEventData]);

  // 주간 보고서 요약
  const weeklyReports = useMemo((): DailyReportSummary[] => {
    const reports: DailyReportSummary[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeekStart);
      date.setDate(date.getDate() + i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = monthlyEventData[dateKey];
      const totalEvents = dayData?.events || 0;
      const alerts = dayData?.alerts || 0;

      // 상태 결정
      let overallStatus: 'safe' | 'caution' | 'warning' | 'critical' = 'safe';
      if (alerts >= 5) overallStatus = 'critical';
      else if (alerts >= 3) overallStatus = 'warning';
      else if (alerts >= 1) overallStatus = 'caution';

      reports.push({
        date: dateKey,
        totalEvents,
        resolvedEvents: 0, // API 미구현
        pendingEvents: totalEvents,
        criticalCount: 0, // API 미구현
        highCount: alerts,
        avgResponseTime: 0, // API 미구현
        topCamera: '-', // API 미구현
        topEventType: eventTypeStats[0]?.type || '-',
        highlights: totalEvents > 0
          ? [`총 ${totalEvents}건의 이벤트 발생`, alerts > 0 ? `긴급 알림 ${alerts}건` : '긴급 상황 없음']
          : ['이벤트 없음'],
        overallStatus,
      });
    }
    return reports;
  }, [selectedWeekStart, monthlyEventData, eventTypeStats]);

  // API 데이터 로딩
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [monthly, daily, eventTypes] = await Promise.all([
          statsApi.getMonthly(),
          statsApi.getDaily(),
          statsApi.getEventTypes(),
        ]);

        if (monthly && Object.keys(monthly).length > 0) {
          setMonthlyEventData(monthly);
        }
        if (daily && daily.length > 0) {
          setDailyStats(daily);
        }
        if (eventTypes && eventTypes.length > 0) {
          setEventTypeStats(eventTypes);
        }
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
      }
    };
    fetchStats();
  }, [selectedWeek]);

  // 캘린더 modifiers
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
    hasEvents: { fontWeight: 'bold' as const },
    hasAlerts: {
      backgroundColor: 'hsl(var(--destructive) / 0.1)',
      color: 'hsl(var(--destructive))',
    },
  };

  return (
    <div className="space-y-6">
      {/* 섹션 1: 캘린더 + 선택된 날짜 상세 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 캘린더 */}
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

        {/* 선택된 날짜의 상세 통계 */}
        <Card className="soft-shadow lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {selectedDate ? format(selectedDate, 'M월 d일', { locale: ko }) : '날짜 선택'} 상세 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateDetail ? (
              <div className="grid md:grid-cols-2 gap-4">
                {/* 카메라별 이벤트 통계 */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    카메라별 이벤트
                  </h4>
                  <ScrollArea className="h-[240px]">
                    <div className="space-y-2 pr-2">
                      {selectedDateDetail.cameraStats.length > 0 ? (
                        selectedDateDetail.cameraStats.map((camera) => {
                          const rate = camera.totalEvents > 0
                            ? Math.round((camera.resolvedEvents / camera.totalEvents) * 100)
                            : 0;
                          return (
                            <div key={camera.cameraId} className="p-2 bg-muted/30 rounded border text-sm">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{camera.cameraName}</span>
                                <Badge variant={camera.pendingEvents > 0 ? "destructive" : "secondary"} className="text-xs">
                                  {camera.totalEvents}건
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${rate}%` }} />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">대응률 {rate}%</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          카메라별 통계 없음
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* 이벤트 유형 분포 */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    이벤트 유형 분포
                  </h4>
                  <div className="h-[240px]">
                    {selectedDateDetail.eventTypeStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedDateDetail.eventTypeStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="count"
                            nameKey="type"
                          >
                            {selectedDateDetail.eventTypeStats.map((entry, index) => (
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
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => <span style={{ fontSize: '11px' }}>{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        이벤트 유형 통계 없음
                      </div>
                    )}
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

      {/* 섹션 2: 주간 이벤트 추이 + 주간 이벤트 유형 분포 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 주간 이벤트 추이 + 요약 통계 */}
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
            {/* 요약 통계 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">
                  {weeklyDetailStats.reduce((acc, d) => acc + d.totalEvents, 0)}
                </p>
                <p className="text-xs text-muted-foreground">총 이벤트</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-muted-foreground">-</p>
                <p className="text-xs text-muted-foreground">대응률</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-muted-foreground">-</p>
                <p className="text-xs text-muted-foreground">평균 대응</p>
              </div>
            </div>
            {/* 차트 */}
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyDailyStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  <Legend />
                  <Bar dataKey="events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="발생" />
                  <Bar dataKey="analyzed" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} name="분석완료" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 주간 이벤트 유형 분포 */}
        <Card className="soft-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              주간 이벤트 유형 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {weeklyEventTypeStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={weeklyEventTypeStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="type"
                    >
                      {weeklyEventTypeStats.map((entry, index) => (
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
                      formatter={(value) => <span style={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  이벤트 유형 데이터 없음
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 섹션 4: 주간 이상행동 보고서 요약 */}
      <Card className="soft-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            주간 이상행동 보고서 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 테이블 형태 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">날짜</th>
                  <th className="text-center py-2 px-2 font-medium">상태</th>
                  <th className="text-center py-2 px-2 font-medium">이벤트</th>
                  <th className="text-center py-2 px-2 font-medium">대응률</th>
                  <th className="text-center py-2 px-2 font-medium">대응시간</th>
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
                    <tr
                      key={report.date}
                      className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsReportModalOpen(true);
                      }}
                    >
                      <td className="py-3 px-2">
                        <span className="font-medium">{format(new Date(report.date), 'M/d (EEE)', { locale: ko })}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={`text-xs ${config.color}`}>
                          {config.icon} {config.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="font-semibold text-primary">{report.totalEvents}</span>
                        <span className="text-muted-foreground text-xs ml-1">({report.pendingEvents} 미처리)</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`font-semibold ${resolveRate >= 80 ? 'text-green-500' : resolveRate >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                          {resolveRate}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="text-muted-foreground">{report.avgResponseTime.toFixed(1)}분</span>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">📹 {report.topCamera}</Badge>
                          <Badge variant="outline" className="text-xs">⚠ {report.topEventType}</Badge>
                          {(report.criticalCount + report.highCount) > 0 && (
                            <Badge variant="destructive" className="text-xs">긴급 {report.criticalCount + report.highCount}</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 모바일용 카드 뷰 */}
          <div className="md:hidden mt-4 space-y-2">
            {weeklyReports.map((report) => {
              const config = statusConfig[report.overallStatus];
              return (
                <div
                  key={`mobile-${report.date}`}
                  className="p-3 bg-muted/20 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    setSelectedReport(report);
                    setIsReportModalOpen(true);
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{format(new Date(report.date), 'M/d (EEE)', { locale: ko })}</span>
                    <Badge className={`text-xs ${config.color}`}>{config.icon} {config.label}</Badge>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span>📹 {report.topCamera}</span>
                    <span>⚠ {report.topEventType}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 일별 보고서 상세 모달 */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (() => {
            const resolveRate = selectedReport.totalEvents > 0
              ? Math.round((selectedReport.resolvedEvents / selectedReport.totalEvents) * 100)
              : 0;
            const config = statusConfig[selectedReport.overallStatus];

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    {format(new Date(selectedReport.date), 'yyyy년 M월 d일 (EEEE)', { locale: ko })} 보고서
                    <Badge className={`text-xs ${config.color}`}>{config.icon} {config.label}</Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* 핵심 통계 요약 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-2xl font-bold text-primary">{selectedReport.totalEvents}</p>
                      <p className="text-xs text-muted-foreground">총 이벤트</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-green-500">{selectedReport.resolvedEvents}</p>
                      <p className="text-xs text-muted-foreground">해결</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                      </div>
                      <p className={`text-2xl font-bold ${resolveRate >= 80 ? 'text-green-500' : resolveRate >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                        {resolveRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">대응률</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold text-blue-500">{selectedReport.avgResponseTime.toFixed(1)}분</p>
                      <p className="text-xs text-muted-foreground">평균 대응</p>
                    </div>
                  </div>

                  {/* 미처리 및 긴급 현황 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">미처리 이벤트</span>
                        <Badge variant="outline" className="text-orange-500 border-orange-500">
                          {selectedReport.pendingEvents}건
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">긴급/높음 이벤트</span>
                        <Badge variant="outline" className="text-red-500 border-red-500">
                          {selectedReport.criticalCount + selectedReport.highCount}건
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 주요 발생 정보 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      주요 발생 정보
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/20 rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">최다 이벤트 카메라</p>
                        <p className="font-medium">📹 {selectedReport.topCamera}</p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">주요 이벤트 유형</p>
                        <p className="font-medium">⚠ {selectedReport.topEventType}</p>
                      </div>
                    </div>
                  </div>

                  {/* 주요 사건 요약 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">📋 주요 사건 요약</h4>
                    <div className="space-y-2">
                      {selectedReport.highlights.map((highlight, idx) => (
                        <div key={idx} className="p-3 bg-muted/20 rounded-lg border-l-4 border-primary/50">
                          <p className="text-sm">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 일일 평가 */}
                  <div className="p-4 bg-muted/20 rounded-lg border">
                    <h4 className="text-sm font-semibold mb-2">📊 일일 평가</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedReport.overallStatus === 'safe' && '이 날은 전반적으로 안정적인 상태였습니다. 심각한 사건 없이 운영되었습니다.'}
                      {selectedReport.overallStatus === 'caution' && '이 날은 약간의 주의가 필요한 상황이 발생했습니다. 대부분 신속하게 처리되었습니다.'}
                      {selectedReport.overallStatus === 'warning' && '이 날은 경고 수준의 이벤트가 다수 발생했습니다. 지속적인 모니터링이 필요합니다.'}
                      {selectedReport.overallStatus === 'critical' && '이 날은 긴급 상황이 발생했습니다. 대응 프로세스 검토가 권장됩니다.'}
                    </p>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

