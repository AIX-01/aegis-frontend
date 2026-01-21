'use client';

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { AlertCircle, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";
import { useState } from "react";
import { EventDetailModal } from "./EventDetailModal";

interface EventLogProps {
  events: Event[];
  onStatusChange?: (eventId: string, newStatus: Event['status']) => void;
}

const getEventIcon = (type: Event['type']) => {
  switch (type) {
    case 'assault':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'theft':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'suspicious':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    default:
      return <Shield className="h-4 w-4 text-success" />;
  }
};

const getEventTypeBadge = (type: Event['type']) => {
  switch (type) {
    case 'assault':
      return <Badge variant="destructive" className="text-xs">폭행</Badge>;
    case 'theft':
      return <Badge variant="destructive" className="text-xs">절도</Badge>;
    case 'suspicious':
      return <Badge className="bg-warning text-warning-foreground text-xs">의심</Badge>;
    default:
      return <Badge className="bg-success text-success-foreground text-xs">정상</Badge>;
  }
};

const getStatusBadge = (status: Event['status']) => {
  switch (status) {
    case 'processing':
      return (
        <Badge variant="secondary" className="text-xs gap-1">
          처리중
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="outline" className="text-xs gap-1 text-success border-success/30">
          <CheckCircle2 className="h-3 w-3" />
          완료
        </Badge>
      );
  }
};

export function EventLog({ events, onStatusChange }: EventLogProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleStatusChange = (eventId: string, newStatus: Event['status']) => {
    // 로컬 상태 업데이트
    if (selectedEvent?.id === eventId) {
      setSelectedEvent({ ...selectedEvent, status: newStatus });
    }
    onStatusChange?.(eventId, newStatus);
  };

  return (
    <>
      <ScrollArea className="h-[400px] pr-3">
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="p-3 rounded-lg border bg-card/50 border-border/50 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getEventTypeBadge(event.type)}
                    <span className="text-xs text-muted-foreground">
                      {event.cameraName}
                    </span>
                  </div>
                  <p className="text-sm mt-1 font-medium">{event.description}</p>
                  {event.aiAction && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Shield className="h-3 w-3 text-primary" />
                      AI: {event.aiAction}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: ko })}
                    </span>
                    {getStatusBadge(event.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <EventDetailModal 
        event={selectedEvent} 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}