'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Play, 
  Pause, 
  Download, 
  AlertCircle, 
  AlertTriangle, 
  Shield, 
  Clock,
  FileText,
  Video,
  Brain
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Event } from "@/types";
import { useState } from "react";

interface EventDetailModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getEventTypeBadge = (type: Event['type']) => {
  switch (type) {
    case 'assault':
      return <Badge variant="destructive">폭행</Badge>;
    case 'theft':
      return <Badge variant="destructive">절도</Badge>;
    case 'suspicious':
      return <Badge className="bg-warning text-warning-foreground">의심</Badge>;
    default:
      return <Badge className="bg-success text-success-foreground">정상</Badge>;
  }
};

const getStatusBadge = (status: Event['status']) => {
  switch (status) {
    case 'processing':
      return <Badge variant="secondary" className="bg-primary/10 text-primary">처리중</Badge>;
    case 'resolved':
      return <Badge variant="outline" className="text-success border-success/30">완료</Badge>;
  }
};

export function EventDetailModal({ event, open, onOpenChange }: EventDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {event.type === 'assault' || event.type === 'theft' ? (
                <AlertCircle className="h-6 w-6 text-destructive" />
              ) : event.type === 'suspicious' ? (
                <AlertTriangle className="h-6 w-6 text-warning" />
              ) : (
                <Shield className="h-6 w-6 text-success" />
              )}
              <div>
                <DialogTitle className="text-xl">{event.description}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getEventTypeBadge(event.type)}
                  {getStatusBadge(event.status)}
                  <span className="text-sm text-muted-foreground">
                    {event.cameraName}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(event.timestamp), 'yyyy.MM.dd HH:mm:ss', { locale: ko })}
              </div>
              <div className="text-xs mt-0.5">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: ko })}
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
              {/* 영상 클립 + 요약 탭 */}
              <TabsContent value="clip" className="m-0 space-y-4">
                {/* 비디오 플레이어 */}
                <Card>
                  <CardContent className="p-0">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            {isPlaying ? (
                              <Pause className="h-10 w-10 text-primary" />
                            ) : (
                              <Play className="h-10 w-10 text-primary ml-1" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.cameraName} - 이벤트 클립
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.timestamp), 'yyyy.MM.dd HH:mm:ss', { locale: ko })}
                          </p>
                        </div>
                      </div>
                      
                      {/* 비디오 컨트롤 바 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center gap-3">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20"
                            onClick={() => setIsPlaying(!isPlaying)}
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: isPlaying ? '45%' : '0%' }}
                            />
                          </div>
                          <span className="text-xs text-white/80">00:45 / 01:30</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI 자동 요약 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      AI 자동 요약
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

                {/* 이벤트 정보 요약 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">발생 위치</p>
                    <p className="text-sm font-medium">{event.cameraName}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">이벤트 유형</p>
                    <p className="text-sm font-medium">
                      {event.type === 'assault' ? '폭행' : 
                       event.type === 'theft' ? '절도' : 
                       event.type === 'suspicious' ? '의심 행동' : '정상'}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">발생 시각</p>
                    <p className="text-sm font-medium">
                      {format(new Date(event.timestamp), 'HH:mm:ss', { locale: ko })}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">처리 상태</p>
                    <p className="text-sm font-medium">
                      {event.status === 'processing' ? '처리중' : '완료'}
                    </p>
                  </div>
                </div>

                {/* AI 자동 대응 */}
                {event.aiAction && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        AI 자동 대응
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{event.aiAction}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* 분석 보고서 탭 */}
              <TabsContent value="report" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      LLM 상황 분석 보고서
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.analysisReport ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                          {event.analysisReport.split('\n').map((line, index) => {
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

        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            보고서 다운로드
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
