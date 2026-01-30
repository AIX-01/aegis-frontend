'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAccessToken } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import type { Notification } from '@/types';

const isDev = process.env.NODE_ENV === 'development';

interface SseContextType {
  isConnected: boolean;
}

const SseContext = createContext<SseContextType | undefined>(undefined);

/**
 * SSE 전역 Provider
 * - 로그인 시 단일 SSE 연결 생성
 * - 로그아웃 시 연결 해제
 * - 모든 이벤트를 React Query 캐시 무효화로 처리
 */
export const SseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  // ref로 최신 값 유지
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // 알림 처리
  const handleNotification = useCallback((data: string) => {
    try {
      const notification: Notification = JSON.parse(data);
      if (isDev) console.log('[SSE] 알림:', notification);

      // 알림 목록 갱신 (fire-and-forget)
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

      // 토스트 표시
      toastRef.current({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'alert' ? 'destructive' : 'default',
      });
    } catch (error) {
      if (isDev) console.error('[SSE] 알림 파싱 오류:', error);
    }
  }, [queryClient]);

  // 카메라 업데이트 처리
  const handleCameraUpdate = useCallback((data: string) => {
    try {
      if (isDev) console.log('[SSE] 카메라 업데이트:', data);

      // 카메라 목록 갱신 (fire-and-forget)
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameras.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameras.managed });
    } catch (error) {
      if (isDev) console.error('[SSE] 카메라 업데이트 처리 오류:', error);
    }
  }, [queryClient]);

  // 이벤트 업데이트 처리
  const handleEventUpdate = useCallback((data: string) => {
    try {
      if (isDev) console.log('[SSE] 이벤트 업데이트:', data);

      // 이벤트 목록 갱신 (fire-and-forget)
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    } catch (error) {
      if (isDev) console.error('[SSE] 이벤트 업데이트 처리 오류:', error);
    }
  }, [queryClient]);

  // 이벤트 삭제 처리
  const handleEventDeleted = useCallback((data: string) => {
    try {
      if (isDev) console.log('[SSE] 이벤트 삭제:', data);

      // 이벤트 목록 갱신 (fire-and-forget)
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    } catch (error) {
      if (isDev) console.error('[SSE] 이벤트 삭제 처리 오류:', error);
    }
  }, [queryClient]);

  // 멤버 업데이트 처리
  const handleMemberUpdate = useCallback((data: string) => {
    try {
      if (isDev) console.log('[SSE] 멤버 업데이트:', data);

      // 멤버 목록 갱신 (fire-and-forget)
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.pending });
    } catch (error) {
      if (isDev) console.error('[SSE] 멤버 업데이트 처리 오류:', error);
    }
  }, [queryClient]);

  const connect = useCallback(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      if (isDev) console.log('[SSE] 연결 스킵: 토큰 없음');
      return;
    }

    // 기존 연결 정리
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    fetchEventSource('/api/notifications/stream', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      signal: abortController.signal,

      onopen: async (response) => {
        if (response.ok) {
          isConnectedRef.current = true;
          if (isDev) console.log('[SSE] 연결 성공');
        } else if (response.status === 401 || response.status === 403) {
          if (isDev) console.error('[SSE] 인증 실패:', response.status);
          throw new Error('인증 실패');
        } else {
          if (isDev) console.error('[SSE] 연결 실패:', response.status);
          throw new Error('연결 실패');
        }
      },

      onmessage: (event) => {
        const eventType = event.event;
        const data = event.data;

        if (isDev) console.log(`[SSE] 이벤트 수신: ${eventType}`);

        switch (eventType) {
          case 'connect':
            if (isDev) console.log('[SSE] 연결 확인:', data);
            break;

          case 'notification':
            handleNotification(data);
            break;

          case 'camera':
            handleCameraUpdate(data);
            break;

          case 'event':
            handleEventUpdate(data);
            break;

          case 'event-deleted':
            handleEventDeleted(data);
            break;

          case 'member':
            handleMemberUpdate(data);
            break;

          default:
            if (isDev) console.log('[SSE] 알 수 없는 이벤트:', eventType, data);
        }
      },

      onerror: (error) => {
        if (isDev) console.error('[SSE] 연결 오류:', error);
        isConnectedRef.current = false;

        // 5초 후 재연결
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isDev) console.log('[SSE] 재연결 시도...');
          connect();
        }, 5000);

        throw error;
      },

      onclose: () => {
        if (isDev) console.log('[SSE] 연결 종료');
        isConnectedRef.current = false;
      },
    }).catch(() => {
      // fetchEventSource 종료됨
    });
  }, [handleNotification, handleCameraUpdate, handleEventUpdate, handleEventDeleted, handleMemberUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      isConnectedRef.current = false;
      if (isDev) console.log('[SSE] 연결 해제');
    }
  }, []);

  // 로그인/로그아웃 시 연결/해제
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

  return (
    <SseContext.Provider value={{ isConnected: isConnectedRef.current }}>
      {children}
    </SseContext.Provider>
  );
};

export const useSse = () => {
  const context = useContext(SseContext);
  if (context === undefined) {
    throw new Error('useSse must be used within an SseProvider');
  }
  return context;
};
