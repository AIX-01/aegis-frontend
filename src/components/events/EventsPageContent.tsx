'use client';

import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EventLog } from "@/components/dashboard/EventLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { eventsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import type { Event } from "@/types";
import {
  ClipboardList,
  Filter,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";

// 이상행동 유형 (백엔드 EventType과 동일)
const behaviorLabels = [
  { id: 'assault', label: '폭행' },
  { id: 'burglary', label: '절도' },
  { id: 'dump', label: '투기' },
  { id: 'swoon', label: '실신' },
  { id: 'vandalism', label: '파손' },
];


export function EventsPageContent() {
  // React Query로 이벤트 목록 조회 (SSE에서 자동 갱신)
  const { data: events = [] } = useQuery({
    queryKey: queryKeys.events.all,
    queryFn: () => eventsApi.getAll(),
  });

  // Filter states
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>(
    behaviorLabels.map(b => b.id)
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // 필터링된 이벤트
  const filteredEvents = events.filter((event: Event) => {
    // 기간 필터
    if (dateRange?.from) {
      const eventDate = new Date(event.occurredAt);
      if (eventDate < dateRange.from) {
        return false;
      }
      if (dateRange.to && eventDate > dateRange.to) {
        return false;
      }
    }

    // 이상행동 유형 필터
    if (selectedBehaviors.length > 0 && selectedBehaviors.length < behaviorLabels.length) {
      if (!selectedBehaviors.includes(event.type)) {
        return false;
      }
    }

    return true;
  });

  const handleBehaviorToggle = (id: string) => {
    setSelectedBehaviors(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleApplyFilters = () => {
    let count = 0;
    if (selectedBehaviors.length < behaviorLabels.length) count++;
    if (dateRange?.from) count++;
    setActiveFiltersCount(count);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedBehaviors(behaviorLabels.map(b => b.id));
    setDateRange(undefined);
    setActiveFiltersCount(0);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="이벤트">
        <div className="space-y-6">

          {/* Event Log Card */}
          <Card className="soft-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  이벤트 목록
                </CardTitle>
                {/* Filter button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      필터
                      {activeFiltersCount > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>이벤트 필터</SheetTitle>
                      <SheetDescription>
                        원하는 조건으로 이벤트를 필터링합니다
                      </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">

                      {/* 기간 필터 */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">기간</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange?.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, "yyyy.MM.dd", { locale: ko })} -{" "}
                                    {format(dateRange.to, "yyyy.MM.dd", { locale: ko })}
                                  </>
                                ) : (
                                  format(dateRange.from, "yyyy.MM.dd", { locale: ko })
                                )
                              ) : (
                                <span className="text-muted-foreground">기간 선택</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={dateRange}
                              onSelect={setDateRange}
                              numberOfMonths={2}
                              locale={ko}
                            />
                          </PopoverContent>
                        </Popover>
                        {dateRange?.from && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setDateRange(undefined)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            기간 초기화
                          </Button>
                        )}
                      </div>

                      {/* 이상행동 라벨링 */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">이상행동 유형</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setSelectedBehaviors(
                              selectedBehaviors.length === behaviorLabels.length
                                ? []
                                : behaviorLabels.map(b => b.id)
                            )}
                          >
                            {selectedBehaviors.length === behaviorLabels.length ? '전체 해제' : '전체 선택'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {behaviorLabels.map((behavior) => (
                            <div
                              key={behavior.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={behavior.id}
                                checked={selectedBehaviors.includes(behavior.id)}
                                onCheckedChange={() => handleBehaviorToggle(behavior.id)}
                              />
                              <label
                                htmlFor={behavior.id}
                                className="text-sm cursor-pointer"
                              >
                                {behavior.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <SheetFooter className="flex gap-2">
                      <Button variant="outline" onClick={handleResetFilters} className="flex-1">
                        초기화
                      </Button>
                      <Button onClick={handleApplyFilters} className="flex-1">
                        적용
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>
            <CardContent>
              <EventLog events={filteredEvents} />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
