'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Calendar as CalendarIcon, AlertTriangle, TrendingUp, Camera, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, format, getYear, getMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, startOfYear, endOfYear, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { statsApi } from "@/lib/api";
import type { DailySummary, PeriodTrend, EventTypeDistribution, CameraDistribution, PeriodSummary } from "@/types";

// --- 상수 ---
const PIE_CHART_COLORS = ['#2563eb', '#16a34a', '#9333ea', '#0d9488', '#4f46e5'];

// --- Helper Components ---

const PeriodSelector = ({ periodType, onPeriodTypeChange, dateRange, onDateRangeChange, onPeriodSelect }: any) => {
  const currentYear = getYear(new Date());
  const currentMonth = getMonth(new Date()) + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [weekRange, setWeekRange] = useState("");

  // 주간 목록 생성
  const weeklyOptions = useMemo(() => {
    const weeks = [];
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(monthStart);
    let weekStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작

    while (weekStart <= monthEnd) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      weeks.push({
        label: `${format(weekStart, 'M/d')} ~ ${format(weekEnd, 'M/d')}`,
        value: `${format(weekStart, 'yyyy-MM-dd')}|${format(weekEnd, 'yyyy-MM-dd')}`,
      });
      weekStart = addWeeks(weekStart, 1);
    }
    return weeks;
  }, [year, month]);

  // 기간 변경 시 부모에게 알림
  useEffect(() => {
    let start: Date | undefined;
    let end: Date | undefined;

    if (periodType === 'yearly') {
      start = startOfYear(new Date(year, 0));
      end = endOfYear(new Date(year, 0));
    } else if (periodType === 'monthly') {
      start = startOfMonth(new Date(year, month - 1));
      end = endOfMonth(new Date(year, month - 1));
    } else if (periodType === 'weekly' && weekRange) {
      const [s, e] = weekRange.split('|');
      start = parseISO(s);
      end = parseISO(e);
    } else if (periodType === 'custom') {
        return;
    } else if (periodType === 'overall') {
        start = undefined;
        end = undefined;
    }

    if (periodType !== 'custom') {
        onPeriodSelect(start, end);
    }
  }, [periodType, year, month, weekRange, onPeriodSelect]);


  const renderYearSelector = () => (
    <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="연도" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 5 }).map((_, i) => (
          <SelectItem key={currentYear - i} value={(currentYear - i).toString()}>
            {currentYear - i}년
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderMonthSelector = () => (
    <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))}>
      <SelectTrigger className="w-[80px]">
        <SelectValue placeholder="월" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 12 }).map((_, i) => (
          <SelectItem key={i + 1} value={(i + 1).toString()}>
            {i + 1}월
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={periodType} onValueChange={onPeriodTypeChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="기간 단위" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="overall">전체 기간</SelectItem>
          <SelectItem value="yearly">연도별</SelectItem>
          <SelectItem value="monthly">월별</SelectItem>
          <SelectItem value="weekly">주간별</SelectItem>
          <SelectItem value="custom">사용자 선택</SelectItem>
        </SelectContent>
      </Select>

      {(periodType === 'yearly' || periodType === 'monthly' || periodType === 'weekly') && renderYearSelector()}
      {(periodType === 'monthly' || periodType === 'weekly') && renderMonthSelector()}
      {periodType === 'weekly' && (
        <Select value={weekRange} onValueChange={setWeekRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="주간 선택" />
          </SelectTrigger>
          <SelectContent>
            {weeklyOptions.map((week) => (
              <SelectItem key={week.value} value={week.value}>
                {week.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {periodType === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-[240px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>{format(dateRange.from, "y-MM-dd")} ~ {format(dateRange.to, "y-MM-dd")}</>
                ) : (
                  format(dateRange.from, "y-MM-dd")
                )
              ) : (
                <span>기간 선택</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              locale={ko}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

// --- 메인 컴포넌트 ---

export function StatsDashboard() {
  // 상태 관리
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [periodType, setPeriodType] = useState("monthly");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined); 
  
  // 실제 API 호출을 위한 기간 상태
  const [periodStart, setPeriodStart] = useState<Date | undefined>(startOfMonth(new Date()));
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>(endOfMonth(new Date()));

  // 데이터 상태
  const [dailyData, setDailyData] = useState<DailySummary | null>(null);
  const [periodTrend, setPeriodTrend] = useState<PeriodTrend[] | null>(null);
  const [eventTypeDist, setEventTypeDist] = useState<EventTypeDistribution[] | null>(null);
  const [cameraDist, setCameraDist] = useState<CameraDistribution[] | null>(null);
  const [periodSummary, setPeriodSummary] = useState<PeriodSummary | null>(null);

  const [isDailyLoading, setIsDailyLoading] = useState(false);
  const [isPeriodLoading, setIsPeriodLoading] = useState(false);

  // 일간 데이터 로딩
  useEffect(() => {
    const fetchDailyData = async () => {
      if (!selectedDate) return;
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
      if (periodType !== 'overall' && (!periodStart || !periodEnd)) return;

      setIsPeriodLoading(true);
      // 초기화
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
    <div className="space-y-8">
      {/* --- 1. 일간 데이터 현황 --- */}
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
                onSelect={setSelectedDate}
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
              {renderLoadingOrNoData("h-full", isDailyLoading, !!dailyData, "캘린더에서 날짜를 선택하세요.") || (
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

      {/* --- 2. 기간별 통계 --- */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold tracking-tight">기간별 통계</h2>
          <PeriodSelector
            periodType={periodType}
            onPeriodTypeChange={setPeriodType}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onPeriodSelect={handlePeriodSelect}
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 기간별 이벤트 요약 (최상단으로 이동) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />기간별 이벤트 요약</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLoadingOrNoData("h-24", isPeriodLoading, !!periodSummary, "기간을 선택하여 데이터를 조회하세요.") || (
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
              {renderLoadingOrNoData("h-[250px]", isPeriodLoading, !!periodTrend && periodTrend.length > 0, "기간을 선택하여 데이터를 조회하세요.") || (
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
              {renderLoadingOrNoData("h-[250px]", isPeriodLoading, !!eventTypeDist && eventTypeDist.length > 0, "기간을 선택하여 데이터를 조회하세요.") || (
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
              {renderLoadingOrNoData("h-[300px]", isPeriodLoading, !!cameraDist && cameraDist.length > 0, "기간을 선택하여 데이터를 조회하세요.") || (
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
    </div>
  );
}
