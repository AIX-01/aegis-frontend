'use client';

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Bot, CheckCircle2, Clock, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AIResponse, Event } from "@/types";

interface AIResponseStatusProps {
  responses: AIResponse[];
  events: Event[];
}

const getStatusIcon = (status: AIResponse['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case 'in_progress':
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-success" />;
  }
};

export function AIResponseStatus({ responses, events }: AIResponseStatusProps) {
  const activeEvents = events.filter(e => e.status !== 'resolved' && e.type !== 'normal');
  const completedResponses = responses.filter(r => r.status === 'completed').length;
  const totalResponses = responses.length;
  const progressPercent = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI 대응 현황
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {activeEvents.length}건 활성
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        {/* Progress overview */}
        <div className="p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">대응 진행률</span>
            <span className="text-sm font-medium">{completedResponses}/{totalResponses} 완료</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Response timeline */}
        <div className="space-y-3">
          {responses.slice(0, 5).map((response, index) => (
            <div
              key={response.id}
              className="flex items-start gap-3 relative"
            >
              {/* Timeline connector */}
              {index < responses.slice(0, 5).length - 1 && (
                <div className="absolute left-[11px] top-6 w-0.5 h-[calc(100%+4px)] bg-border" />
              )}
              
              <div className="relative z-10 mt-0.5 p-1 bg-background rounded-full border">
                {getStatusIcon(response.status)}
              </div>
              
              <div className="flex-1 min-w-0 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{response.action}</span>
                  {response.status === 'in_progress' && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      진행중
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(response.timestamp, { addSuffix: true, locale: ko })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-lg font-semibold text-primary">{activeEvents.length}</div>
            <div className="text-xs text-muted-foreground">활성 알림</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-lg font-semibold text-success">{completedResponses}</div>
            <div className="text-xs text-muted-foreground">대응 완료</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-lg font-semibold">2.3초</div>
            <div className="text-xs text-muted-foreground">평균 반응</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
