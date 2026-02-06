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
  Shield,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Event } from "@/types";
import { useState, useRef, useEffect } from "react";
import { eventsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { EventTypeBadge, EventStatusBadge } from "@/components/common/EventBadges";

interface EventDetailModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailModal({ event, open, onOpenChange }: EventDetailModalProps) {
  const [clipLoading, setClipLoading] = useState(false);
  const [clipError, setClipError] = useState(false);
  const [clipReady, setClipReady] = useState(false);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !event?.id || !event?.clipUrl) {
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
    eventsApi.getClipUrl(event.id)
      .then((url) => {
        setClipUrl(url);
        setClipLoading(false);
      })
      .catch(() => {
        setClipError(true);
        setClipLoading(false);
      });
  }, [open, event?.id, event?.clipUrl]);

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
    if (event?.clipUrl) {
      try {
        await eventsApi.downloadClip(event.id, `event-${event.id}.mp4`);
      } catch {
        toast({
          title: "다운로드 실패",
          description: "클립 다운로드에 실패했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  // 보고서 새 창에서 열기
  const handleOpenReport = () => {
    if (event?.id) {
      window.open(`/api/events/${event.id}/report`, '_blank');
    }
  };

  // 보고서 다운로드 (PDF/DOCX)
  const handleDownloadReport = async (format: 'pdf' | 'docx') => {
    if (!event?.id) return;

    try {
      const response = await fetch(`/api/events/${event.id}/report`);
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
            filename: `report-${event.id}.pdf`,
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
        a.download = `report-${event.id}.doc`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "다운로드 완료",
        description: `보고서가 ${format.toUpperCase()} 형식으로 다운로드되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "보고서 다운로드에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getEventTypeKorean = (type: Event['type']) => {
    const typeMap = {
      assault: '폭행',
      burglary: '절도',
      dump: '투기',
      swoon: '실신',
      vandalism: '파손'
    };
    return typeMap[type] || '알 수 없음';
  };

  if (!event) return null;

  // risk에 따른 아이콘 반환
  const getRiskIcon = () => {
    switch (event.risk) {
      case 'abnormal':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      case 'suspicious':
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      default:
        return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRiskIcon()}
              <div>
                <DialogTitle className="text-xl">
                  {event.cameraLocation}에서 {getEventTypeKorean(event.type)} 감지
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <EventTypeBadge type={event.type} risk={event.risk} />
                  <EventStatusBadge status={event.status} />
                  <span className="text-sm text-muted-foreground">
                    {event.cameraName}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(event.occurredAt), 'yyyy.MM.dd HH:mm:ss', { locale: ko })}
              </div>
              <div className="text-xs mt-0.5">
                {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true, locale: ko })}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 좌측: 영상 (고정) / 우측: 요약 (스크롤) */}
        <div className="flex flex-1 overflow-hidden">
          {/* 좌측: 영상 영역 */}
          <div className="w-1/2 p-6 border-r flex flex-col">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex-shrink-0">
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
              {event.clipUrl && (
                <video
                  ref={videoRef}
                  className={`w-full h-full object-contain bg-black ${!clipReady || clipError ? 'hidden' : ''}`}
                  controls
                />
              )}

              {/* 에러/없음 상태 */}
              {!clipLoading && (!clipReady || clipError || !event.clipUrl) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center mx-auto mb-3">
                      <VideoOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {clipError
                        ? '클립을 불러올 수 없습니다'
                        : !event.clipUrl
                          ? '클립이 저장되지 않았습니다'
                          : '클립이 아직 준비되지 않았습니다'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {clipReady && !clipError && (
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="outline" onClick={handleClipDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  클립 다운로드
                </Button>
              </div>
            )}
          </div>

          {/* 우측: 요약 영역 (스크롤) */}
          <div className="w-1/2 flex flex-col">
            <ScrollArea className="flex-1 h-[450px]">
              <div className="p-6 space-y-4">
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
                        {event.summary || '이 이벤트에 대한 요약 정보가 없습니다.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* 이벤트 정보 그리드 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">발생 위치</p>
                    <p className="text-sm font-medium">{event.cameraLocation}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">이벤트 유형</p>
                    <p className="text-sm font-medium">{getEventTypeKorean(event.type)}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">발생 시각</p>
                    <p className="text-sm font-medium">
                      {format(new Date(event.occurredAt), 'HH:mm:ss', { locale: ko })}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">처리 상태</p>
                    <p className="text-sm font-medium">
                      {event.status === 'processing' ? '분석중' : '분석완료'}
                    </p>
                  </div>
                </div>

                {/* 권장 조치 */}
                {event.actions && event.actions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        권장 조치
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        {event.actions.map((action) => (
                          <li key={action.id} className="flex flex-col gap-0.5">
                            <span>• {action.log}</span>
                            <span className="text-xs text-muted-foreground/70 ml-3">
                              {new Date(action.triggeredAt).toLocaleString('ko-KR')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="p-4 border-t flex justify-between items-center">
          <div className="flex gap-2">
            {event.report && (
              <>
                <Button variant="outline" onClick={handleOpenReport}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  보고서 보기
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
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
              </>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
