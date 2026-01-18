'use client';

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EventLog } from "@/components/dashboard/EventLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { eventsApi, notificationsApi } from "@/lib/api";
import type { Event, Notification } from "@/types";
import {
  ClipboardList,
  Filter,
  X,
  Calendar as CalendarIcon,
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Check,
  Trash2,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

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

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'alert':
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    default:
      return <Info className="h-5 w-5 text-info" />;
  }
};

const getNotificationBadge = (type: Notification['type']) => {
  switch (type) {
    case 'alert':
      return <Badge variant="destructive" className="text-xs">긴급</Badge>;
    case 'warning':
      return <Badge className="bg-warning text-warning-foreground text-xs">경고</Badge>;
    case 'success':
      return <Badge className="bg-success text-success-foreground text-xs">완료</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">정보</Badge>;
  }
};

export function EventsPageContent() {
  const [mainTab, setMainTab] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);

  // Event states
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>(
    behaviorLabels.map(b => b.id)
  );
  const [selectedRisks, setSelectedRisks] = useState<string[]>(['high', 'medium', 'low']);
  const [selectedAiResponses, setSelectedAiResponses] = useState<string[]>([]);
  const [notificationChecked, setNotificationChecked] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    alertEnabled: true,
    warningEnabled: true,
    successEnabled: true,
    infoEnabled: true,
    soundEnabled: true,
    desktopEnabled: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, notificationsData] = await Promise.all([
          eventsApi.getAll(),
          notificationsApi.getAll(),
        ]);
        setEvents(eventsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const pendingEvents = events.filter(e => e.status === 'pending');
  const processingEvents = events.filter(e => e.status === 'processing');
  const resolvedEvents = events.filter(e => e.status === 'resolved');

  const unreadNotifications = notifications.filter(n => !n.read);
  const alertNotifications = notifications.filter(n => n.type === 'alert');

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
    if (notificationChecked !== 'all') count++;
    if (dateRange?.from) count++;
    setActiveFiltersCount(count);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedBehaviors(behaviorLabels.map(b => b.id));
    setSelectedRisks(['high', 'medium', 'low']);
    setSelectedAiResponses([]);
    setNotificationChecked('all');
    setDateRange(undefined);
    setActiveFiltersCount(0);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const renderNotificationItem = (notification: Notification) => (
    <div
      key={notification.id}
      className={cn(
        "p-4 rounded-lg border transition-colors",
        notification.read
          ? "bg-card/50 border-border/50"
          : "bg-primary/5 border-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {getNotificationBadge(notification.type)}
            {!notification.read && (
              <Badge variant="secondary" className="text-xs h-5">새 알림</Badge>
            )}
          </div>
          <p className="text-sm font-medium mt-2">{notification.title}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-muted-foreground">
              {format(notification.timestamp, 'yyyy.MM.dd HH:mm', { locale: ko })}
              <span className="mx-1">·</span>
              {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ko })}
            </div>
            <div className="flex items-center gap-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  읽음
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={() => handleDeleteNotification(notification.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
    <DashboardLayout title="이벤트/알림">
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="events" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            이벤트 로그
            <Badge variant="secondary" className="h-5 min-w-5 text-xs">
              {events.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            알림
            {unreadNotifications.length > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="m-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  전체
                  <Badge variant="secondary" className="h-5 min-w-5 text-xs">
                    {events.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="processing" className="gap-2">
                  처리중
                  <Badge variant="secondary" className="h-5 min-w-5 text-xs bg-primary/10 text-primary">
                    {processingEvents.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="gap-2">
                  대기중
                  <Badge variant="secondary" className="h-5 min-w-5 text-xs">
                    {pendingEvents.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="resolved" className="gap-2">
                  완료
                  <Badge variant="secondary" className="h-5 min-w-5 text-xs">
                    {resolvedEvents.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

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

                    {/* 알림 확인 여부 */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">알림 확인 여부</Label>
                      <Select
                        value={notificationChecked}
                        onValueChange={(value: 'all' | 'checked' | 'unchecked') => setNotificationChecked(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체</SelectItem>
                          <SelectItem value="checked">확인함</SelectItem>
                          <SelectItem value="unchecked">미확인</SelectItem>
                        </SelectContent>
                      </Select>
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

            <Card className="soft-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  이벤트 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TabsContent value="all" className="m-0">
                  <EventLog events={events} />
                </TabsContent>
                <TabsContent value="processing" className="m-0">
                  <EventLog events={processingEvents} />
                </TabsContent>
                <TabsContent value="pending" className="m-0">
                  <EventLog events={pendingEvents} />
                </TabsContent>
                <TabsContent value="resolved" className="m-0">
                  <EventLog events={resolvedEvents} />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="m-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  전체
                  <Badge variant="secondary" className="h-5 min-w-5 text-xs">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="gap-2">
                  읽지 않음
                  <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                    {unreadNotifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="alerts" className="gap-2">
                  긴급
                  <Badge variant="secondary" className="h-5 min-w-5 text-xs">
                    {alertNotifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  설정
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleMarkAllAsRead}>
                  <Check className="h-4 w-4" />
                  모두 읽음
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={handleClearAllNotifications}>
                  <Trash2 className="h-4 w-4" />
                  모두 삭제
                </Button>
              </div>
            </div>

            <Card className="soft-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  알림 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TabsContent value="all" className="m-0">
                  <ScrollArea className="h-[600px] pr-3">
                    <div className="space-y-3">
                      {notifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>알림이 없습니다</p>
                        </div>
                      ) : (
                        notifications.map(renderNotificationItem)
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="unread" className="m-0">
                  <ScrollArea className="h-[600px] pr-3">
                    <div className="space-y-3">
                      {unreadNotifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>읽지 않은 알림이 없습니다</p>
                        </div>
                      ) : (
                        unreadNotifications.map(renderNotificationItem)
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="alerts" className="m-0">
                  <ScrollArea className="h-[600px] pr-3">
                    <div className="space-y-3">
                      {alertNotifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>긴급 알림이 없습니다</p>
                        </div>
                      ) : (
                        alertNotifications.map(renderNotificationItem)
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="settings" className="m-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-4">알림 유형별 설정</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <div>
                              <Label>긴급 알림</Label>
                              <p className="text-xs text-muted-foreground">폭행, 절도 등 긴급 상황</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.alertEnabled}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, alertEnabled: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-warning" />
                            <div>
                              <Label>경고 알림</Label>
                              <p className="text-xs text-muted-foreground">의심 행동 감지</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.warningEnabled}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, warningEnabled: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <div>
                              <Label>완료 알림</Label>
                              <p className="text-xs text-muted-foreground">AI 대응 완료 알림</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.successEnabled}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, successEnabled: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Info className="h-5 w-5 text-info" />
                            <div>
                              <Label>정보 알림</Label>
                              <p className="text-xs text-muted-foreground">시스템 상태, 정기 점검 등</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.infoEnabled}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, infoEnabled: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium mb-4">알림 방식</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>소리 알림</Label>
                            <p className="text-xs text-muted-foreground">알림 수신 시 알림음 재생</p>
                          </div>
                          <Switch
                            checked={notificationSettings.soundEnabled}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, soundEnabled: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>데스크톱 알림</Label>
                            <p className="text-xs text-muted-foreground">브라우저 푸시 알림</p>
                          </div>
                          <Switch
                            checked={notificationSettings.desktopEnabled}
                            onCheckedChange={(checked) =>
                              setNotificationSettings(prev => ({ ...prev, desktopEnabled: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button>설정 저장</Button>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
