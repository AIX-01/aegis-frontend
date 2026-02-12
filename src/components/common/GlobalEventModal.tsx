'use client';

import { useState, useEffect } from 'react';
import { EventDetailModal } from '@/components/dashboard/EventDetailModal';
import { eventsApi } from '@/lib/api';
import type { Event as AegisEvent } from '@/types';

/**
 * 전역 이벤트 모달
 * - 어디서든 aegis:open-event-modal 이벤트로 열 수 있음
 * - 토스트 클릭 시 이벤트 상세 모달 표시
 */
export function GlobalEventModal() {
  const [event, setEvent] = useState<AegisEvent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = async (e: globalThis.Event) => {
      const customEvent = e as CustomEvent<{ eventId: string }>;
      const { eventId } = customEvent.detail;

      try {
        const eventData = await eventsApi.getById(eventId);
        setEvent(eventData);
        setOpen(true);
      } catch {
        // 이벤트를 찾을 수 없음
      }
    };

    window.addEventListener('aegis:open-event-modal', handleOpenModal);
    return () => {
      window.removeEventListener('aegis:open-event-modal', handleOpenModal);
    };
  }, []);

  return (
    <EventDetailModal
      event={event}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

