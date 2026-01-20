'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Notification, ManagedCamera } from '@/types';

/**
 * SSE를 통한 실시간 알림 및 카메라 업데이트 수신 훅
 * - 로그인 상태에서 자동 연결
 * - 새 알림 수신 시 토스트 표시
 * - 카메라 업데이트/목록 갱신 이벤트 수신
 * - 연결 끊김 시 자동 재연결
 */
export function useNotificationStream(
  onNotification?: (notification: Notification) => void,
  onCameraUpdate?: (camera: ManagedCamera) => void,
  onCameraRefresh?: () => void
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!user) return;

    // 기존 연결 정리
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // SSE 연결 생성
    const eventSource = new EventSource('/api/notifications/stream', {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log('SSE 연결 성공');
    };

    // 연결 확인 이벤트
    eventSource.addEventListener('connect', (event) => {
      console.log('SSE 연결 확인:', event.data);
    });

    // 알림 수신 이벤트
    eventSource.addEventListener('notification', (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        console.log('SSE 알림 수신:', notification);

        // 콜백 호출 (알림 목록 갱신용)
        onNotification?.(notification);

        // 토스트 알림 표시
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'alert' ? 'destructive' : 'default',
        });
      } catch (error) {
        console.error('SSE 알림 파싱 오류:', error);
      }
    });

    // 카메라 업데이트 이벤트 (개별 카메라 변경)
    eventSource.addEventListener('camera-update', (event) => {
      try {
        const camera: ManagedCamera = JSON.parse(event.data);
        console.log('SSE 카메라 업데이트 수신:', camera);
        onCameraUpdate?.(camera);
      } catch (error) {
        console.error('SSE 카메라 업데이트 파싱 오류:', error);
      }
    });

    // 카메라 목록 갱신 이벤트 (새 카메라 추가/연결 상태 변경)
    eventSource.addEventListener('camera-refresh', (event) => {
      console.log('SSE 카메라 목록 갱신 요청:', event.data);
      onCameraRefresh?.();
    });

    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류:', error);
      eventSource.close();
      eventSourceRef.current = null;

      // 5초 후 재연결 시도
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('SSE 재연결 시도...');
        connect();
      }, 5000);
    };

    eventSourceRef.current = eventSource;
  }, [user, onNotification, onCameraUpdate, onCameraRefresh, toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('SSE 연결 해제');
    }
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  return { connect, disconnect };
}
