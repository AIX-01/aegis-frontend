'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Download,
  Clock,
  FileText,
  Brain,
  VideoOff,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  XCircle,
  History
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Event } from "@/types";
import { useState, useRef, useEffect, useCallback } from "react";
import { eventsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getEventTypeKorean } from "@/lib/utils";
import { EventTypeBadge, EventStatusBadge, CameraBadge } from "@/components/common/EventBadges";

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const [clipLoading, setClipLoading] = useState(false);
  const [clipError, setClipError] = useState(false);
  const [clipReady, setClipReady] = useState(false);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [eventData, setEventData] = useState<Event | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // 이벤트 상세 조회 함수
  const fetchEventData = useCallback(async (eventId: string) => {
    try {
      const data = await eventsApi.getById(eventId);
      setEventData(data);
    } catch {
      setEventData(event);
    }
  }, [event]);

  // 모달 열릴 때 및 event props 변경 시 이벤트 상세 조회
  useEffect(() => {
    if (isOpen && event?.id) {
      fetchEventData(event.id);
    } else {
      setEventData(null);
    }
  }, [isOpen, event, fetchEventData]);

  // SSE 액션 업데이트 이벤트 구독 (실시간 반영)
  useEffect(() => {
    if (!isOpen || !event?.id) return;

    const handleActionUpdate = (e: CustomEvent<{ eventId: string }>) => {
      if (e.detail.eventId === event.id) {
        fetchEventData(event.id);
      }
    };

    window.addEventListener('aegis:action-update', handleActionUpdate as EventListener);
    return () => {
      window.removeEventListener('aegis:action-update', handleActionUpdate as EventListener);
    };
  }, [isOpen, event?.id, fetchEventData]);

  // 실제 사용할 이벤트 데이터 (상세 조회 결과 또는 props)
  const displayEvent = eventData || event;

  // pending 액션과 히스토리 액션 분리
  const pendingAction = displayEvent?.actions?.find(a => a.pending);
  const historyActions = displayEvent?.actions?.filter(a => !a.pending) || [];

  // 액션 승인/거부 처리
  const handleResolve = async (actionId: string, approved: boolean) => {
    if (!displayEvent) return;

    setResolving(true);
    try {
      await eventsApi.resolveAction(displayEvent.id, actionId, approved);
      toast({
        title: approved ? "승인 완료" : "거부 완료",
        description: `액션이 ${approved ? '승인' : '거부'}되었습니다.`,
        variant: "success",
      });
      // 이벤트 다시 조회
      fetchEventData(displayEvent.id);
    } catch (error) {
      toast({
        title: "처리 실패",
        description: "액션 처리에 실패했습니다. 다시 시도해주세요.",
        variant: "alert",
      });
    } finally {
      setResolving(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !displayEvent?.id || !displayEvent?.clipUrl) {
      setClipLoading(false);
      setClipError(false);
      setClipReady(false);
      setClipUrl(null);
      return;
    }

    setClipLoading(true);
    setClipError(false);
    setClipReady(false);

    // presigned URL 요청
    eventsApi.getClipUrl(displayEvent.id)
      .then((url) => {
        setClipUrl(url);
        setClipLoading(false);
      })
      .catch(() => {
        setClipError(true);
        setClipLoading(false);
      });
  }, [isOpen, displayEvent?.id, displayEvent?.clipUrl]);

  // 비디오 로드 이벤트 핸들러
  useEffect(() => {
    if (!clipUrl || !videoRef.current) return;

    const video = videoRef.current;
    video.src = clipUrl;
    video.load();

    const handleCanPlay = () => setClipReady(true);
    const handleError = () => setClipError(true);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [clipUrl]);


  // 클립 다운로드
  const handleClipDownload = async () => {
    if (displayEvent?.clipUrl) {
      try {
        await eventsApi.downloadClip(displayEvent.id, `event-${displayEvent.id}.mp4`);
      } catch {
        toast({
          title: "다운로드 실패",
          description: "클립 다운로드에 실패했습니다.",
          variant: "alert",
        });
      }
    }
  };

  // 보고서 새 창에서 열기
  const handleOpenReport = () => {
    if (displayEvent?.id) {
      window.open(`/api/events/${displayEvent.id}/report`, '_blank');
    }
  };

  // 보고서 다운로드 (PDF/DOCX)
  const handleDownloadReport = async (format: 'pdf' | 'docx') => {
    if (!displayEvent?.id) return;

    try {
      const response = await fetch(`/api/events/${displayEvent.id}/report`);
      if (!response.ok) throw new Error('보고서를 불러올 수 없습니다');
      const html = await response.text();

      if (format === 'pdf') {
        // html2pdf.js 동적 로드
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.createElement('div');
        element.innerHTML = html;
        html2pdf()
          .set({
            margin: 10,
            filename: `report-${displayEvent.id}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          })
          .from(element)
          .save();
      } else if (format === 'docx') {
        // Word 호환 HTML로 저장
        const blob = new Blob([`
          <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                xmlns:w="urn:schemas-microsoft-com:office:word">
          <head><meta charset="utf-8"><title>분석 보고서</title></head>
          <body>${html}</body>
          </html>
        `], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${displayEvent.id}.doc`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "다운로드 완료",
        description: `보고서가 ${format.toUpperCase()} 형식으로 다운로드되었습니다.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "보고서 다운로드에 실패했습니다.",
        variant: "alert",
      });
    }
  };


  if (!displayEvent) return null;

  // risk에 따른 아이콘 반환
  const getRiskIcon = () => {
    switch (displayEvent.risk) {
      case 'abnormal':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      case 'suspicious':
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      default:
        return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRiskIcon()}
              <div>
                <DialogTitle className="text-xl">
                  {displayEvent.cameraLocation}에서 {getEventTypeKorean(displayEvent.type)} 감지
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <EventTypeBadge type={displayEvent.type} risk={displayEvent.risk} />
                  <EventStatusBadge status={displayEvent.status} />
                  <CameraBadge location={displayEvent.cameraLocation} name={displayEvent.cameraName} />
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground mr-6">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(displayEvent.occurredAt), 'yyyy.MM.dd HH:mm:ss', { locale: ko })}
              </div>
              <div className="text-xs mt-0.5">
                {formatDistanceToNow(new Date(displayEvent.occurredAt), { addSuffix: true, locale: ko })}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 좌측: 영상 (고정) / 우측: 요약 (스크롤) */}
        <div className="flex overflow-hidden">
          {/* 좌측: 영상 영역 */}
          <div className="w-1/2 p-6 border-r">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {/* 로딩 오버레이 */}
              {clipLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 z-10">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">클립 로딩 중...</p>
                  </div>
                </div>
              )}

              {/* 비디오 플레이어 */}
              {displayEvent.clipUrl && (
                <video
                  ref={videoRef}
                  className={`w-full h-full object-contain bg-black ${!clipReady || clipError ? 'hidden' : ''}`}
                  controls
                />
              )}

              {/* 에러/없음 상태 */}
              {!clipLoading && (!clipReady || clipError || !displayEvent.clipUrl) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center mx-auto mb-3">
                      <VideoOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {clipError
                        ? '클립을 불러올 수 없습니다'
                        : !displayEvent.clipUrl
                          ? '클립이 저장되지 않았습니다'
                          : '클립이 아직 준비되지 않았습니다'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 우측: 요약 영역 (스크롤) - 클립과 동일 높이 */}
          <div className="w-1/2 p-6">
            <ScrollArea className="aspect-video">
              <div className="space-y-4 pr-4">
                {/* Pending 액션 (승인 대기 중) - 요약 위에 표시 */}
                {pendingAction && (
                  <Card className="border-warning bg-warning/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-warning">
                        <AlertTriangle className="h-4 w-4" />
                        승인 대기 중
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-background rounded-lg border">
                          <p className="font-medium text-sm">{pendingAction.action}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pendingAction.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleResolve(pendingAction.id, true)}
                            disabled={resolving}
                          >
                            {resolving ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleResolve(pendingAction.id, false)}
                            disabled={resolving}
                          >
                            {resolving ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            거부
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Agent 자동 요약 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      Agent 자동 요약
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed">
                        {displayEvent.summary || '이 이벤트에 대한 요약 정보가 없습니다.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>


                {/* 액션 히스토리 */}
                {historyActions.map((action) => (
                  <Card key={action.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        {action.action}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="p-4 border-t flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleClipDownload}
            disabled={!clipReady || clipError}
          >
            <Download className="h-4 w-4 mr-2" />
            클립 다운로드
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleOpenReport}
              disabled={!displayEvent.report}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              보고서 보기
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={!displayEvent.report}>
                  <Download className="h-4 w-4 mr-2" />
                  보고서 다운로드
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDownloadReport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF 형식
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadReport('docx')}>
                  <FileText className="h-4 w-4 mr-2" />
                  DOCX 형식 (Word/한글 호환)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
