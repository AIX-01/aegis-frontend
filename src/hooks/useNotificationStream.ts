'use client';

import { useEffect, useRef, useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAccessToken } from '@/lib/axios';
import type { Notification, ManagedCamera } from '@/types';

const isDev = process.env.NODE_ENV === 'development';

/**
 * SSE를 통한 실시간 알림 및 카메라/이벤트/멤버 업데이트 수신 훅
 * - @microsoft/fetch-event-source 사용 (Authorization 헤더 지원)
 * - 로그인 상태에서 자동 연결
 * - 새 알림 수신 시 토스트 표시
 * - 카메라/이벤트/멤버 업데이트 이벤트 수신
 * - 연결 끊김 시 자동 재연결
 */
export function useNotificationStream(
  onNotification?: (notification: Notification) => void,
  onCameraUpdate?: (camera: ManagedCamera | string) => void,
  onEventUpdate?: (event: unknown) => void,
  onMemberUpdate?: (member: unknown) => void
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 콜백 함수들을 ref로 저장하여 의존성 문제 방지
  const onNotificationRef = useRef(onNotification);
  const onCameraUpdateRef = useRef(onCameraUpdate);
  const onEventUpdateRef = useRef(onEventUpdate);
  const onMemberUpdateRef = useRef(onMemberUpdate);
  const toastRef = useRef(toast);

  // 콜백 함수들이 변경될 때 ref 업데이트
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    onCameraUpdateRef.current = onCameraUpdate;
  }, [onCameraUpdate]);

  useEffect(() => {
    onEventUpdateRef.current = onEventUpdate;
  }, [onEventUpdate]);

  useEffect(() => {
    onMemberUpdateRef.current = onMemberUpdate;
  }, [onMemberUpdate]);

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
          if (isDev) console.log('SSE 연결 성공');
        } else if (response.status === 401 || response.status === 403) {
          if (isDev) console.error('SSE 인증 실패:', response.status);
          throw new Error('인증 실패');
        } else {
          if (isDev) console.error('SSE 연결 실패:', response.status);
          throw new Error('연결 실패');
        }
      },

      onmessage: (event) => {
        const eventType = event.event;
        const data = event.data;

        if (eventType === 'connect') {
          if (isDev) console.log('SSE 연결 확인:', data);
          return;
        }

        if (eventType === 'notification') {
          try {
            const notification: Notification = JSON.parse(data);
            if (isDev) console.log('SSE 알림 수신:', notification);
            onNotificationRef.current?.(notification);
            toastRef.current({
              title: notification.title,
              description: notification.message,
              variant: notification.type === 'alert' ? 'destructive' : 'default',
            });
          } catch (error) {
            if (isDev) console.error('SSE 알림 파싱 오류:', error);
          }
          return;
        }

        if (eventType === 'camera') {
          try {
            // "refresh" 같은 문자열이거나 카메라 객체일 수 있음
            const parsed = JSON.parse(data);
            if (isDev) console.log('SSE 카메라 이벤트 수신:', parsed);
            onCameraUpdateRef.current?.(parsed);
          } catch {
            // JSON 파싱 실패시 문자열 그대로 전달
            if (isDev) console.log('SSE 카메라 이벤트 수신 (문자열):', data);
            onCameraUpdateRef.current?.(data);
          }
          return;
        }

        if (eventType === 'event') {
          try {
            const event = JSON.parse(data);
            if (isDev) console.log('SSE 이벤트 수신:', event);
            onEventUpdateRef.current?.(event);
          } catch (error) {
            if (isDev) console.error('SSE 이벤트 파싱 오류:', error);
          }
          return;
        }

        if (eventType === 'member') {
          try {
            const member = JSON.parse(data);
            if (isDev) console.log('SSE 멤버 이벤트 수신:', member);
            onMemberUpdateRef.current?.(member);
          } catch (error) {
            if (isDev) console.error('SSE 멤버 이벤트 파싱 오류:', error);
          }
          return;
        }
      },

      onerror: (error) => {
        if (isDev) console.error('SSE 연결 오류:', error);

        // 5초 후 재연결 시도
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isDev) console.log('SSE 재연결 시도...');
          connect();
        }, 5000);

        throw error;
      },

      onclose: () => {
        if (isDev) console.log('SSE 연결 종료');
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
      if (isDev) console.log('SSE 연결 해제');
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
