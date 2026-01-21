'use client';

import { useEffect, useRef, useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAccessToken } from '@/lib/axios';
import type { Notification, ManagedCamera } from '@/types';

/**
 * SSE를 통한 실시간 알림 및 카메라 업데이트 수신 훅
 * - @microsoft/fetch-event-source 사용 (Authorization 헤더 지원)
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 콜백 함수들을 ref로 저장하여 의존성 문제 방지
  const onNotificationRef = useRef(onNotification);
  const onCameraUpdateRef = useRef(onCameraUpdate);
  const onCameraRefreshRef = useRef(onCameraRefresh);
  const toastRef = useRef(toast);

  // 콜백 함수들이 변경될 때 ref 업데이트
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    onCameraUpdateRef.current = onCameraUpdate;
  }, [onCameraUpdate]);

  useEffect(() => {
    onCameraRefreshRef.current = onCameraRefresh;
  }, [onCameraRefresh]);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // user를 ref로 저장하여 connect 내에서 참조
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const connect = useCallback(() => {
    if (!userRef.current) return;

    // 기존 연결 정리
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const accessToken = getAccessToken();

    fetchEventSource('/api/notifications/stream', {
      method: 'GET',
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
      signal: abortController.signal,

      onopen: async (response) => {
        if (response.ok) {
          console.log('SSE 연결 성공');
        } else if (response.status === 401 || response.status === 403) {
          console.error('SSE 인증 실패:', response.status);
          throw new Error('인증 실패');
        } else {
          console.error('SSE 연결 실패:', response.status);
          throw new Error('연결 실패');
        }
      },

      onmessage: (event) => {
        const eventType = event.event;
        const data = event.data;

        if (eventType === 'connect') {
          console.log('SSE 연결 확인:', data);
          return;
        }

        if (eventType === 'notification') {
          try {
            const notification: Notification = JSON.parse(data);
            console.log('SSE 알림 수신:', notification);
            onNotificationRef.current?.(notification);
            toastRef.current({
              title: notification.title,
              description: notification.message,
              variant: notification.type === 'alert' ? 'destructive' : 'default',
            });
          } catch (error) {
            console.error('SSE 알림 파싱 오류:', error);
          }
          return;
        }

        if (eventType === 'camera-update') {
          try {
            const camera: ManagedCamera = JSON.parse(data);
            console.log('SSE 카메라 업데이트 수신:', camera);
            onCameraUpdateRef.current?.(camera);
          } catch (error) {
            console.error('SSE 카메라 업데이트 파싱 오류:', error);
          }
          return;
        }

        if (eventType === 'camera-refresh') {
          console.log('SSE 카메라 목록 갱신 요청:', data);
          onCameraRefreshRef.current?.();
          return;
        }
      },

      onerror: (error) => {
        console.error('SSE 연결 오류:', error);

        // 5초 후 재연결 시도
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('SSE 재연결 시도...');
          connect();
        }, 5000);

        throw error;
      },

      onclose: () => {
        console.log('SSE 연결 종료');
      },
    }).catch(() => {
      // fetchEventSource 종료됨
    });
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      console.log('SSE 연결 해제');
    }
  }, []);


  // user 변경 시 연결/해제 처리
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
