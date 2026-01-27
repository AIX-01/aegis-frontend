'use client';

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Shield } from "lucide-react";
import type { Event } from "@/types";
import { useState } from "react";
import { EventDetailModal } from "./EventDetailModal";
import { EventTypeBadge, EventStatusBadge, EventIcon } from "@/components/common/EventBadges";

interface EventLogProps {
  events: Event[];
  onStatusChange?: (eventId: string, newStatus: Event['status']) => void;
}



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
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event)}
            className="p-3 rounded-lg border bg-card/50 border-border/50 cursor-pointer"
          >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <EventIcon type={event.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <EventTypeBadge type={event.type} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {event.cameraName}
                    </span>
                  </div>
                  <p className="text-sm mt-1 font-medium">{event.description}</p>
                  {event.agentAction && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Shield className="h-3 w-3 text-primary" />
                      Agent: {event.agentAction}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: ko })}
                    </span>
                    <EventStatusBadge status={event.status} size="sm" />
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
        onStatusChange={handleStatusChange}
      />
    </>
  );
}