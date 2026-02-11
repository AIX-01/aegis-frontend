'use client';

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar as CalendarIcon, AlertTriangle, TrendingUp, Camera, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, format, getYear, getMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks } from "date-fns";
import { ko } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

// --- Helper Components ---

// 기간 선택 컨트롤러
const PeriodSelector = ({ periodType, onPeriodTypeChange, dateRange, onDateRangeChange }: any) => {
  const currentYear = getYear(new Date());
  const currentMonth = getMonth(new Date()) + 1;

  const [yearForWeek, setYearForWeek] = useState(currentYear);
  const [monthForWeek, setMonthForWeek] = useState(currentMonth);

  // 연도와 월을 기반으로 해당 월의 주차 목록을 생성하는 로직
  const weeklyOptions = useMemo(() => {
    const weeks = [];
    const monthStart = startOfMonth(new Date(yearForWeek, monthForWeek - 1));
    const monthEnd = endOfMonth(monthStart);
    let weekStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작

    while (weekStart <= monthEnd) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      weeks.push({
        label: `${format(weekStart, 'M/d')} ~ ${format(weekEnd, 'M/d')}`,
        value: format(weekStart, 'yyyy-MM-dd'),
      });
      weekStart = addWeeks(weekStart, 1);
    }
    return weeks;
  }, [yearForWeek, monthForWeek]);

  // 연도별 선택
  const renderYearSelector = (selectedYear: number, onYearChange: (year: number) => void) => (
    <Select value={selectedYear.toString()} onValueChange={(val) => onYearChange(parseInt(val))}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="연도 선택" />
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

  // 월별 선택
  const renderMonthSelector = () => (
    <div className="flex gap-2">
      {renderYearSelector(currentYear, () => {})}
      <Select>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="월 선택" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }).map((_, i) => (
            <SelectItem key={i + 1} value={(i + 1).toString()}>
              {i + 1}월
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // 주간별 선택
  const renderWeekSelector = () => (
     <div className="flex gap-2">
      {renderYearSelector(yearForWeek, setYearForWeek)}
       <Select value={monthForWeek.toString()} onValueChange={(val) => setMonthForWeek(parseInt(val))}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="월 선택" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }).map((_, i) => (
            <SelectItem key={i + 1} value={(i + 1).toString()}>
              {i + 1}월
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[180px]">
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
    </div>
  );

  // 사용자 선택 (Date Range Picker)
  const renderCustomSelector = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn("w-[260px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
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
  );

  return (
    <div className="flex items-center gap-2">
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

      {periodType === 'yearly' && renderYearSelector(currentYear, () => {})}
      {periodType === 'monthly' && renderMonthSelector()}
      {periodType === 'weekly' && renderWeekSelector()}
      {periodType === 'custom' && renderCustomSelector()}
    </div>
  );
};


// --- 메인 컴포넌트 ---

export function StatsDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [periodType, setPeriodType] = useState("weekly"); // 기본값을 'weekly'로 변경하여 확인 용이
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  // TODO: API 연동 시 아래 목업 데이터는 실제 데이터 상태로 변경됩니다.
  const dailyData = null; // 일간 데이터
  const periodData = null; // 기간별 데이터

  const dailyTitle = selectedDate
    ? `${format(selectedDate, "yyyy년 M월 d일 (eee)", { locale: ko })}의 일간 이벤트`
    : "일간 상세 분석";

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

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{dailyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">총 이벤트</h3>
                {dailyData ? (
                  <p className="text-4xl font-bold">{(dailyData as any).totalEvents}건</p>
                ) : (
                  <p className="text-sm text-muted-foreground">캘린더에서 날짜를 선택하세요.</p>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Camera className="h-4 w-4" />카메라별 분포</h3>
                  {dailyData ? (
                    <ResponsiveContainer width="100%" height={150}>
                      {/* TODO: 카메라별 분포 차트 구현 */}
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[150px] flex items-center justify-center text-xs text-muted-foreground">데이터 없음</div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />이벤트 유형 분포</h3>
                  {dailyData ? (
                    <ResponsiveContainer width="100%" height={150}>
                      {/* TODO: 이벤트 유형 분포 차트 구현 */}
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[150px] flex items-center justify-center text-xs text-muted-foreground">데이터 없음</div>
                  )}
                </div>
              </div>
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
            onDateRangeChange={setDateRange}
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />기간별 이벤트 추이</CardTitle>
            </CardHeader>
            <CardContent>
              {periodData ? (
                <ResponsiveContainer width="100%" height={250}>
                  {/* TODO: 기간별 이벤트 추이 차트 구현 */}
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">기간을 선택하여 데이터를 조회하세요.</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />기간별 이벤트 유형 분포</CardTitle>
            </CardHeader>
            <CardContent>
              {periodData ? (
                <ResponsiveContainer width="100%" height={250}>
                  {/* TODO: 기간별 이벤트 유형 분포 차트 구현 */}
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">기간을 선택하여 데이터를 조회하세요.</div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" />기간별 카메라별 이벤트 분포</CardTitle>
            </CardHeader>
            <CardContent>
              {periodData ? (
                <ResponsiveContainer width="100%" height={300}>
                  {/* TODO: 기간별 카메라별 이벤트 분포 차트 구현 */}
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">기간을 선택하여 데이터를 조회하세요.</div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />기간별 이벤트 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>기간</TableHead>
                    <TableHead className="text-center">총 이벤트</TableHead>
                    <TableHead className="text-center">분석 완료율</TableHead>
                    <TableHead className="text-center">주요 유형</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodData ? (
                    // TODO: 요약 데이터 테이블 행 렌더링
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">데이터 로딩 중...</TableCell></TableRow>
                  ) : (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">데이터 없음</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
