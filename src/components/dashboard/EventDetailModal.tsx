'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download,
  Clock,
  FileText,
  Video,
  Brain,
  VideoOff,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Shield
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
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [clipLoading, setClipLoading] = useState(false);
  const [clipError, setClipError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && event?.id) {
      if (!event.clipUrl) {
        setClipUrl(null);
        setClipLoading(false);
        setClipError(false);
        return;
      }

      setClipLoading(true);
      setClipError(false);

      eventsApi.getClipBlobUrl(event.id)
        .then((url) => {
          setClipUrl(url);
        })
        .catch(() => {
          setClipError(true);
        })
        .finally(() => {
          setClipLoading(false);
        });
    }

    return () => {
      if (clipUrl) {
        URL.revokeObjectURL(clipUrl);
        setClipUrl(null);
      }
    };
  }, [open, event?.id, event?.clipUrl]);

  const handleDownload = async () => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {event.type === 'assault' || event.type === 'burglary' ? (
                <AlertCircle className="h-6 w-6 text-destructive" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-warning" />
              )}
              <div>
                <DialogTitle className="text-xl">
                  {event.cameraName}에서 {getEventTypeKorean(event.type)} 감지
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <EventTypeBadge type={event.type} />
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

        <Tabs defaultValue="clip" className="flex-1">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clip" className="gap-2">
                <Video className="h-4 w-4" />
                영상 클립 + 요약
              </TabsTrigger>
              <TabsTrigger value="report" className="gap-2">
                <FileText className="h-4 w-4" />
                분석 보고서
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="p-6">
              <TabsContent value="clip" className="m-0 space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      {clipLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <div className="text-center">
                            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">클립 로딩 중...</p>
                          </div>
                        </div>
                      )}
                      {!clipLoading && clipUrl && !clipError ? (
                        <video
                          ref={videoRef}
                          src={clipUrl}
                          className="w-full h-full object-contain bg-black"
                          onError={() => setClipError(true)}
                          controls
                        />
                      ) : !clipLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-muted-foreground/10 flex items-center justify-center mx-auto mb-3">
                              <VideoOff className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {clipError
                                ? '클립을 불러올 수 없습니다'
                                : !event.clipUrl
                                  ? '클립이 저장되지 않았습니다'
                                  : '클립이 아직 준비되지 않았습니다'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {!event.clipUrl
                                ? '클립 추출에 실패했거나 저장되지 않았습니다'
                                : event.status === 'processing'
                                  ? '클립 추출 중...'
                                  : '클립 없음'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {clipUrl && !clipError && (
                      <div className="p-3 border-t flex justify-end">
                        <Button size="sm" variant="outline" onClick={handleDownload}>
                          <Download className="h-4 w-4 mr-2" />
                          클립 다운로드
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

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

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">발생 위치</p>
                    <p className="text-sm font-medium">{event.cameraName}</p>
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

                {event.actions && event.actions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        권장 조치
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {event.actions.map((action, idx) => (
                          <li key={idx}>• {JSON.stringify(action)}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="report" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      LLM 상황 분석 보고서
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.report ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                          {event.report.split('\n').map((line, index) => {
                            if (line.startsWith('## ')) {
                              return <h2 key={index} className="text-lg font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
                            }
                            if (line.startsWith('### ')) {
                              return <h3 key={index} className="text-base font-semibold mt-3 mb-1">{line.replace('### ', '')}</h3>;
                            }
                            if (line.startsWith('- ')) {
                              return <p key={index} className="ml-4">{line}</p>;
                            }
                            if (line.match(/^\d+\./)) {
                              return <p key={index} className="ml-4">{line}</p>;
                            }
                            return <p key={index}>{line}</p>;
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>이 이벤트에 대한 분석 보고서가 없습니다.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <div className="p-4 border-t flex justify-end">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              닫기
            </Button>
            {event.report && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                보고서 다운로드
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
