'use client';

import { useMemo } from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { Calendar as CalendarIcon, AlertTriangle, Camera, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DailySummary } from "@/types";

// --- 상수 ---
const PASTEL_COLORS = [
  '#fecaca', // 분홍 (red-200)
  '#fde68a', // 노랑 (amber-200)
  '#bbf7d0', // 연두 (green-200)
  '#bae6fd', // 하늘 (sky-200)
  '#d8b4fe', // 보라 (purple-300)
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

  // API 데이터를 기반으로 전체 유형 목록을 생성 (발생 0건 포함)
  const fullEventTypeStats = useMemo(() => {
    const statsMap = new Map(dailyData?.eventTypeDistribution.map(stat => [stat.type, stat.count]));
    return ALL_EVENT_TYPES.map((typeName, index) => ({
      type: typeName,
      count: statsMap.get(typeName) || 0,
      color: PASTEL_COLORS[index % PASTEL_COLORS.length],
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
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 캘린더 */}
        <Card className="soft-shadow lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              이벤트 캘린더
              <Badge variant="secondary" className="ml-auto text-xs">Today: {format(today, 'M/d')}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onSelectDate}
              locale={ko}
              disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
              defaultMonth={selectedDate}
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
            {isLoading && renderLoadingOrNoData("h-[280px]", "데이터 로딩 중...")}
            {!isLoading && !dailyData && renderLoadingOrNoData("h-[280px]", "캘린더에서 날짜를 선택하세요.")}
            {dailyData && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* 카메라별 이벤트 통계 */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    카메라별 이벤트
                  </h4>
                  <ScrollArea className="h-[240px]">
                    <div className="space-y-2 pr-2">
                      {dailyData.cameraDistribution.length > 0 ? (
                        dailyData.cameraDistribution.map((camera) => (
                          <div key={camera.cameraName} className="p-2 bg-muted/30 rounded border text-sm">
                            <div className="flex justify-between items-center mb-1">
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

                {/* 이벤트 유형 분포 */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    이벤트 유형 분포
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
                          <Legend
                            payload={
                              fullEventTypeStats.map(item => ({
                                value: `${item.type} (${item.count})`,
                                type: 'circle',
                                color: item.color,
                              }))
                            }
                            verticalAlign="bottom"
                            height={50}
                            iconSize={8}
                            formatter={(value) => <span style={{ fontSize: '11px' }}>{value}</span>}
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
