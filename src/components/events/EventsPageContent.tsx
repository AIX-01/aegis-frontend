'use client';

import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EventLog } from "@/components/dashboard/EventLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { eventsApi, camerasApi, type EventFilters } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import type { ManagedCamera } from "@/types";
import {
  ClipboardList,
  Filter,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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

// 위험도 옵션
const riskLabels = [
  { id: 'suspicious', label: '의심' },
  { id: 'abnormal', label: '이상' },
];

// 이상행동 유형 옵션
const typeLabels = [
  { id: 'assault', label: '폭행' },
  { id: 'burglary', label: '절도' },
  { id: 'dump', label: '투기' },
  { id: 'swoon', label: '실신' },
  { id: 'vandalism', label: '파손' },
];

// 분석 상태 옵션
const statusLabels = [
  { id: 'processing', label: '분석중' },
  { id: 'analyzed', label: '분석완료' },
];

export function EventsPageContent() {
  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // 스크롤 컨테이너 참조
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 필터 상태 (서버로 전송할 값)
  const [appliedFilters, setAppliedFilters] = useState<EventFilters>({});

  // 필터 UI 상태 (임시)
  const [selectedRisks, setSelectedRisks] = useState<string[]>(riskLabels.map(r => r.id));
  const [selectedTypes, setSelectedTypes] = useState<string[]>(typeLabels.map(t => t.id));
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(statusLabels.map(s => s.id));
  const [selectedCameraIds, setSelectedCameraIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isCameraDropdownOpen, setIsCameraDropdownOpen] = useState(false);

  // 카메라 목록 조회
  const { data: cameras = [] } = useQuery({
    queryKey: queryKeys.cameras.all,
    queryFn: camerasApi.getAllList,
  });

  // 카메라 목록 로드 시 전체 선택 (최초 1회만)
  const [cameraInitialized, setCameraInitialized] = useState(false);
  useEffect(() => {
    if (cameras.length > 0 && !cameraInitialized) {
      setSelectedCameraIds(cameras.map((c: ManagedCamera) => c.id));
      setCameraInitialized(true);
    }
  }, [cameras, cameraInitialized]);

  // React Query로 이벤트 목록 조회 (서버사이드 필터링)
  const { data: eventsPage } = useQuery({
    queryKey: [...queryKeys.events.all, page, pageSize, appliedFilters],
    queryFn: () => eventsApi.getAll(page, pageSize, appliedFilters),
  });

  const events = eventsPage?.content ?? [];
  const totalPages = eventsPage?.totalPages ?? 0;

  // 페이지 범위 보정
  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [totalPages, page]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 제네릭 토글 핸들러
  const createToggleHandler = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) => {
    setter(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleRiskToggle = createToggleHandler(setSelectedRisks);
  const handleTypeToggle = createToggleHandler(setSelectedTypes);
  const handleStatusToggle = createToggleHandler(setSelectedStatuses);
  const handleCameraToggle = createToggleHandler(setSelectedCameraIds);

  // 필터 적용
  const handleApplyFilters = () => {
    const filters: EventFilters = {};

    // 전체 선택이 아닌 경우 필터 적용 (빈 배열 포함)
    if (selectedRisks.length < riskLabels.length) {
      filters.risks = selectedRisks;
    }
    if (selectedTypes.length < typeLabels.length) {
      filters.types = selectedTypes;
    }
    if (selectedStatuses.length < statusLabels.length) {
      filters.statuses = selectedStatuses;
    }
    if (selectedCameraIds.length < cameras.length) {
      filters.cameraIds = selectedCameraIds;
    }
    if (dateRange?.from) {
      filters.startDate = dateRange.from.toISOString();
      if (dateRange.to) {
        filters.endDate = dateRange.to.toISOString();
      }
    }

    setAppliedFilters(filters);
    setPage(0);

    // 활성 필터 수 계산
    let count = 0;
    if (filters.risks) count++;
    if (filters.types) count++;
    if (filters.statuses) count++;
    if (filters.cameraIds) count++;
    if (filters.startDate) count++;
    setActiveFiltersCount(count);

    setIsFilterOpen(false);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedRisks(riskLabels.map(r => r.id));
    setSelectedTypes(typeLabels.map(t => t.id));
    setSelectedStatuses(statusLabels.map(s => s.id));
    setSelectedCameraIds(cameras.map((c: ManagedCamera) => c.id));
    setDateRange(undefined);
    setAppliedFilters({});
    setActiveFiltersCount(0);
    setPage(0);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="이벤트">
        <Card className="soft-shadow h-[calc(100vh-6.5rem)] flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
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
                    {/* 위험도 필터 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">위험도</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setSelectedRisks(
                            selectedRisks.length === riskLabels.length ? [] : riskLabels.map(r => r.id)
                          )}
                        >
                          {selectedRisks.length === riskLabels.length ? '전체 해제' : '전체 선택'}
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {riskLabels.map((risk) => (
                          <div key={risk.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`risk-${risk.id}`}
                              checked={selectedRisks.includes(risk.id)}
                              onCheckedChange={() => handleRiskToggle(risk.id)}
                            />
                            <label htmlFor={`risk-${risk.id}`} className="text-sm cursor-pointer">
                              {risk.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 이상행동 유형 필터 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">이상행동 유형</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setSelectedTypes(
                            selectedTypes.length === typeLabels.length ? [] : typeLabels.map(t => t.id)
                          )}
                        >
                          {selectedTypes.length === typeLabels.length ? '전체 해제' : '전체 선택'}
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {typeLabels.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type.id}`}
                              checked={selectedTypes.includes(type.id)}
                              onCheckedChange={() => handleTypeToggle(type.id)}
                            />
                            <label htmlFor={`type-${type.id}`} className="text-sm cursor-pointer">
                              {type.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 분석 상태 필터 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">분석 상태</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setSelectedStatuses(
                            selectedStatuses.length === statusLabels.length ? [] : statusLabels.map(s => s.id)
                          )}
                        >
                          {selectedStatuses.length === statusLabels.length ? '전체 해제' : '전체 선택'}
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {statusLabels.map((status) => (
                          <div key={status.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status.id}`}
                              checked={selectedStatuses.includes(status.id)}
                              onCheckedChange={() => handleStatusToggle(status.id)}
                            />
                            <label htmlFor={`status-${status.id}`} className="text-sm cursor-pointer">
                              {status.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 카메라 필터 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">카메라</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setSelectedCameraIds(
                            selectedCameraIds.length === cameras.length ? [] : cameras.map((c: ManagedCamera) => c.id)
                          )}
                        >
                          {selectedCameraIds.length === cameras.length ? '전체 해제' : '전체 선택'}
                        </Button>
                      </div>
                      <Popover open={isCameraDropdownOpen} onOpenChange={setIsCameraDropdownOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span className="truncate">
                              {selectedCameraIds.length === 0
                                ? '카메라 선택'
                                : selectedCameraIds.length === cameras.length
                                  ? '전체 선택됨'
                                  : `${selectedCameraIds.length}개 선택됨`}
                            </span>
                            <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-2 max-h-[200px] overflow-y-auto" align="start">
                          {cameras.map((camera: ManagedCamera) => (
                            <div
                              key={camera.id}
                              className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer"
                              onClick={() => handleCameraToggle(camera.id)}
                            >
                              <Checkbox
                                checked={selectedCameraIds.includes(camera.id)}
                                onCheckedChange={() => handleCameraToggle(camera.id)}
                              />
                              <span className="text-sm">{camera.location}({camera.name})</span>
                            </div>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* 기간 필터 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">기간</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setDateRange(undefined)}
                          disabled={!dateRange?.from}
                        >
                          전체 선택
                        </Button>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                              <span className="text-muted-foreground">전체 선택됨</span>
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
          <CardContent className="flex-1 overflow-auto flex flex-col">
            <div ref={scrollContainerRef} className="flex-1 overflow-auto">
              <EventLog events={events} />
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center gap-4 pt-4 border-t flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                className="h-8 w-8"
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                className="h-8 w-8"
                disabled={totalPages <= 1 || page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
