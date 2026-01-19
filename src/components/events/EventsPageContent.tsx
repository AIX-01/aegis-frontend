'use client';

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EventLog } from "@/components/dashboard/EventLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { eventsApi } from "@/lib/api";
import type { Event } from "@/types";
import {
  ClipboardList,
  Filter,
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";

// 12가지 이상행동 라벨
const behaviorLabels = [
  { id: 'assault', label: '폭행', checked: true },
  { id: 'fight', label: '싸움', checked: true },
  { id: 'theft', label: '절도', checked: true },
  { id: 'vandalism', label: '기물파손', checked: true },
  { id: 'fainting', label: '실신', checked: true },
  { id: 'loitering', label: '배회', checked: true },
  { id: 'intrusion', label: '침입', checked: true },
  { id: 'dumping', label: '투기', checked: true },
  { id: 'robbery', label: '강도', checked: true },
  { id: 'harassment', label: '데이트폭력 및 추행', checked: true },
  { id: 'kidnapping', label: '납치', checked: true },
  { id: 'intoxication', label: '주취행동', checked: true },
];

// AI 대응 방식
const aiResponseTypes = [
  { id: 'security_call', label: '경비실 호출' },
  { id: 'door_lock', label: '출입문 잠금' },
  { id: 'alarm', label: '경보 발령' },
  { id: 'police_call', label: '경찰 신고' },
  { id: 'recording', label: '영상 녹화' },
  { id: 'monitoring', label: '모니터링 강화' },
];

export function EventsPageContent() {
  const [events, setEvents] = useState<Event[]>([]);

  // Filter states
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>(
    behaviorLabels.map(b => b.id)
  );
  const [selectedRisks, setSelectedRisks] = useState<string[]>(['high', 'medium', 'low']);
  const [selectedAiResponses, setSelectedAiResponses] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'processing' | 'resolved'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await eventsApi.getAll();
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  // 필터링된 이벤트
  const filteredEvents = events.filter(event => {
    // 상태 필터
    if (selectedStatus !== 'all' && event.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const processingCount = events.filter(e => e.status === 'processing').length;
  const resolvedCount = events.filter(e => e.status === 'resolved').length;

  const handleBehaviorToggle = (id: string) => {
    setSelectedBehaviors(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleRiskToggle = (risk: string) => {
    setSelectedRisks(prev =>
      prev.includes(risk) ? prev.filter(r => r !== risk) : [...prev, risk]
    );
  };

  const handleAiResponseToggle = (id: string) => {
    setSelectedAiResponses(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleApplyFilters = () => {
    let count = 0;
    if (selectedBehaviors.length < behaviorLabels.length) count++;
    if (selectedRisks.length < 3) count++;
    if (selectedAiResponses.length > 0) count++;
    if (selectedStatus !== 'all') count++;
    if (dateRange?.from) count++;
    setActiveFiltersCount(count);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedBehaviors(behaviorLabels.map(b => b.id));
    setSelectedRisks(['high', 'medium', 'low']);
    setSelectedAiResponses([]);
    setSelectedStatus('all');
    setDateRange(undefined);
    setActiveFiltersCount(0);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="이벤트">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{events.length}</p>
                    <p className="text-sm text-muted-foreground">전체</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-warning/10">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{processingCount}</p>
                    <p className="text-sm text-muted-foreground">처리중</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{resolvedCount}</p>
                    <p className="text-sm text-muted-foreground">완료</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter button */}
          <div className="flex justify-end">
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
                  {/* 상태 필터 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">상태</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={(value: 'all' | 'processing' | 'resolved') => setSelectedStatus(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="processing">처리중</SelectItem>
                        <SelectItem value="resolved">완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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

                  {/* 위험도 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">위험도</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedRisks.includes('high') ? 'default' : 'outline'}
                        size="sm"
                        className={selectedRisks.includes('high') ? 'bg-destructive hover:bg-destructive/90' : ''}
                        onClick={() => handleRiskToggle('high')}
                      >
                        높음
                      </Button>
                      <Button
                        variant={selectedRisks.includes('medium') ? 'default' : 'outline'}
                        size="sm"
                        className={selectedRisks.includes('medium') ? 'bg-warning hover:bg-warning/90 text-warning-foreground' : ''}
                        onClick={() => handleRiskToggle('medium')}
                      >
                        중간
                      </Button>
                      <Button
                        variant={selectedRisks.includes('low') ? 'default' : 'outline'}
                        size="sm"
                        className={selectedRisks.includes('low') ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}
                        onClick={() => handleRiskToggle('low')}
                      >
                        낮음
                      </Button>
                    </div>
                  </div>

                  {/* AI 대응 방식 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">AI 대응 방식</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {aiResponseTypes.map((response) => (
                        <div
                          key={response.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`ai-${response.id}`}
                            checked={selectedAiResponses.includes(response.id)}
                            onCheckedChange={() => handleAiResponseToggle(response.id)}
                          />
                          <label
                            htmlFor={`ai-${response.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {response.label}
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

          {/* Event Log Card */}
          <Card className="soft-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                이벤트 목록
              </CardTitle>
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
