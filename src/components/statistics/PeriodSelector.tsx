'use client';

import { useState, useMemo, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format, getYear, getMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, startOfYear, endOfYear, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface PeriodSelectorProps {
  periodType: string;
  onPeriodTypeChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onPeriodSelect: (start: Date | undefined, end: Date | undefined) => void;
}

export function PeriodSelector({ periodType, onPeriodTypeChange, dateRange, onDateRangeChange, onPeriodSelect }: PeriodSelectorProps) {
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
    let weekStart = startOfWeek(monthStart, { weekStartsOn: 0 });

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
}
