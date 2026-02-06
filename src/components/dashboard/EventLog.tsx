'use client';

import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Event } from "@/types";
import { useState } from "react";
import { EventDetailModal } from "./EventDetailModal";
import { EventTypeBadge, EventStatusBadge, EventIcon, CameraBadge } from "@/components/common/EventBadges";
import { Clock } from "lucide-react";

interface EventLogProps {
  events: Event[];
}

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

export function EventLog({ events }: EventLogProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event)}
            className="p-3 rounded-lg border bg-card/50 border-border/50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div>
                <EventIcon risk={event.risk} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <EventTypeBadge type={event.type} size="sm" />
                  <EventStatusBadge status={event.status} size="sm" />
                  <CameraBadge location={event.cameraLocation} name={event.cameraName} size="sm" />
                </div>
                <p className="text-sm mt-1 font-medium">
                  {event.cameraLocation}에서 {getEventTypeKorean(event.type)} 감지
                </p>
                {event.summary && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {event.summary}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(event.occurredAt), 'yyyy.MM.dd HH:mm:ss', { locale: ko })}
                </div>
                <div className="mt-0.5">
                  {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true, locale: ko })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EventDetailModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}