'use client';

import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Event as AegisEvent } from "@/types";
import { useState, useEffect } from "react";
import { EventDetailModal } from "./EventDetailModal";
import { EventTypeBadge, EventStatusBadge, EventIcon, CameraBadge } from "@/components/common/EventBadges";
import { getEventTypeKorean } from "@/lib/utils";
import { Clock } from "lucide-react";
import { eventsApi } from "@/lib/api";

interface EventLogProps {
  events: AegisEvent[];
}


// risk에 따른 왼쪽 라인 색상
const getRiskBorderStyle = (risk: AegisEvent['risk']) => {
  switch (risk) {
    case 'abnormal':
      return 'border-l-4 border-l-destructive';
    case 'suspicious':
      return 'border-l-4 border-l-warning';
    default:
      return 'border-l-4 border-l-muted';
  }
};

export function EventLog({ events }: EventLogProps) {
  const [selectedEvent, setSelectedEvent] = useState<AegisEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEventClick = (event: AegisEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  // 토스트 클릭 시 이벤트 모달 열기
  useEffect(() => {
    const handleOpenModal = (e: globalThis.Event) => {
      const customEvent = e as CustomEvent<{ eventId: string }>;
      const { eventId } = customEvent.detail;
      // 현재 목록에서 먼저 찾기
      const foundEvent = events.find(ev => ev.id === eventId);
      if (foundEvent) {
        setSelectedEvent(foundEvent);
        setModalOpen(true);
      } else {
        // 목록에 없으면 API로 조회
        eventsApi.getById(eventId)
          .then(event => {
            setSelectedEvent(event);
            setModalOpen(true);
          })
          .catch(() => {
            // 이벤트를 찾을 수 없음
          });
      }
    };

    window.addEventListener('aegis:open-event-modal', handleOpenModal);
    return () => {
      window.removeEventListener('aegis:open-event-modal', handleOpenModal);
    };
  }, [events]);

  return (
    <>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event)}
            className={`p-3 rounded-lg border bg-card/50 border-border/50 cursor-pointer ${getRiskBorderStyle(event.risk)}`}
          >
            <div className="flex items-center gap-3">
              <div>
                <EventIcon risk={event.risk} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <EventTypeBadge type={event.type} risk={event.risk} size="sm" />
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