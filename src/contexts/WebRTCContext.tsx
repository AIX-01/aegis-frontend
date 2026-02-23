'use client';

import React, { createContext, useContext, useRef, useCallback, useEffect, useState } from 'react';

interface StreamInfo {
  pc: RTCPeerConnection | null;
  stream: MediaStream | null;
  cameraId: string;
  state: 'connecting' | 'playing' | 'error';
  errorMessage?: string;
}

interface WebRTCContextType {
  // 스트림 가져오기 (없으면 null)
  getStream: (cameraId: string) => StreamInfo | null;
  // 스트림 연결 시작 (accessToken: JWT 액세스 토큰)
  connectStream: (cameraId: string, accessToken: string, streamUrl: string) => Promise<void>;
  // 스트림 연결 해제
  disconnectStream: (cameraId: string) => void;
  // 스트림 상태 구독
  subscribeToStream: (cameraId: string, callback: (info: StreamInfo | null) => void) => () => void;
  // 현재 활성 그리드 카메라 ID 설정
  setActiveGridCameras: (cameraIds: string[]) => void;
  // 모든 스트림 정리
  cleanupAll: () => void;
}

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export function WebRTCProvider({ children }: { children: React.ReactNode }) {
  // 스트림 저장소
  const streamsRef = useRef<Map<string, StreamInfo>>(new Map());
  // 구독자 저장소
  const subscribersRef = useRef<Map<string, Set<(info: StreamInfo | null) => void>>>(new Map());
  // 현재 활성 그리드 카메라 ID
  const activeGridCamerasRef = useRef<Set<string>>(new Set());
  // AbortController 저장소
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // 구독자에게 알림
  const notifySubscribers = useCallback((cameraId: string, info: StreamInfo | null) => {
    const subs = subscribersRef.current.get(cameraId);
    if (subs) {
      subs.forEach(cb => cb(info));
    }
  }, []);

  // 스트림 가져오기
  const getStream = useCallback((cameraId: string): StreamInfo | null => {
    return streamsRef.current.get(cameraId) || null;
  }, []);

  // 스트림 연결
  const connectStream = useCallback(async (
    cameraId: string,
    accessToken: string,
    streamUrl: string
  ): Promise<void> => {
    // 이미 연결 중이거나 연결됨
    const existing = streamsRef.current.get(cameraId);
    if (existing && (existing.state === 'connecting' || existing.state === 'playing')) {
      return;
    }

    // 기존 연결 정리
    const existingAbort = abortControllersRef.current.get(cameraId);
    if (existingAbort) {
      existingAbort.abort();
    }

    const abortController = new AbortController();
    abortControllersRef.current.set(cameraId, abortController);

    // 임시 상태 설정
    const tempInfo: StreamInfo = {
      pc: null,
      stream: null,
      cameraId,
      state: 'connecting',
    };
    streamsRef.current.set(cameraId, tempInfo);
    notifySubscribers(cameraId, tempInfo);

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      // 트랙 수신 시
      pc.ontrack = (event) => {
        if (abortController.signal.aborted) return;
        if (event.streams[0]) {
          const info: StreamInfo = {
            pc,
            stream: event.streams[0],
            cameraId,
            state: 'playing',
          };
          streamsRef.current.set(cameraId, info);
          notifySubscribers(cameraId, info);
        }
      };

      // ICE 연결 상태 변경
      pc.oniceconnectionstatechange = () => {
        if (abortController.signal.aborted) return;
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          const info: StreamInfo = {
            pc,
            stream: streamsRef.current.get(cameraId)?.stream || null,
            cameraId,
            state: 'error',
            errorMessage: '영상 수신 중단',
          };
          streamsRef.current.set(cameraId, info);
          notifySubscribers(cameraId, info);
        }
      };

      // Transceiver 추가
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });

      // Offer 생성
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // WHEP URL 생성 (streamUrl은 /stream/cam1/whep 형식)
      const whepUrl = new URL(streamUrl, window.location.origin).href;

      // Basic Auth: base64(_:accessToken)
      const credentials = btoa(`_:${accessToken}`);

      const response = await fetch(whepUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'Authorization': `Basic ${credentials}`,
        },
        body: offer.sdp,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`스트림 서버 응답 오류 (${response.status})`);
      }

      const answerSdp = await response.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

    } catch (error) {
      if (abortController.signal.aborted) return;

      // 에러 시에도 AbortController 정리
      abortControllersRef.current.delete(cameraId);

      const info: StreamInfo = {
        pc: null,
        stream: null,
        cameraId,
        state: 'error',
        errorMessage: error instanceof Error ? error.message : '연결 실패',
      };
      streamsRef.current.set(cameraId, info);
      notifySubscribers(cameraId, info);
    }
  }, [notifySubscribers]);

  // 스트림 연결 해제
  const disconnectStream = useCallback((cameraId: string) => {
    const abortController = abortControllersRef.current.get(cameraId);
    if (abortController) {
      abortController.abort();
      abortControllersRef.current.delete(cameraId);
    }

    const info = streamsRef.current.get(cameraId);
    if (info?.pc) {
      info.pc.close();
    }
    streamsRef.current.delete(cameraId);
    notifySubscribers(cameraId, null);
  }, [notifySubscribers]);

  // 스트림 구독
  const subscribeToStream = useCallback((
    cameraId: string,
    callback: (info: StreamInfo | null) => void
  ): (() => void) => {
    if (!subscribersRef.current.has(cameraId)) {
      subscribersRef.current.set(cameraId, new Set());
    }
    subscribersRef.current.get(cameraId)!.add(callback);

    // 초기값 전달
    const current = streamsRef.current.get(cameraId);
    callback(current || null);

    // 구독 해제 함수 반환
    return () => {
      const subs = subscribersRef.current.get(cameraId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          subscribersRef.current.delete(cameraId);
        }
      }
    };
  }, []);

  // 활성 그리드 카메라 설정
  const setActiveGridCameras = useCallback((cameraIds: string[]) => {
    const newSet = new Set(cameraIds);
    const oldSet = activeGridCamerasRef.current;

    // 제거된 카메라 연결 해제
    oldSet.forEach(id => {
      if (!newSet.has(id)) {
        disconnectStream(id);
      }
    });

    activeGridCamerasRef.current = newSet;
  }, [disconnectStream]);

  // 모든 스트림 정리
  const cleanupAll = useCallback(() => {
    abortControllersRef.current.forEach(ac => ac.abort());
    abortControllersRef.current.clear();

    streamsRef.current.forEach((info) => {
      if (info.pc) {
        info.pc.close();
      }
    });
    streamsRef.current.clear();
    activeGridCamerasRef.current.clear();
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  const value: WebRTCContextType = {
    getStream,
    connectStream,
    disconnectStream,
    subscribeToStream,
    setActiveGridCameras,
    cleanupAll,
  };

  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTC() {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within WebRTCProvider');
  }
  return context;
}

// 특정 카메라 스트림을 구독하는 훅
export function useStreamSubscription(cameraId: string | null) {
  const { subscribeToStream } = useWebRTC();
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);

  useEffect(() => {
    if (!cameraId) {
      setStreamInfo(null);
      return;
    }

    const unsubscribe = subscribeToStream(cameraId, setStreamInfo);
    return unsubscribe;
  }, [cameraId, subscribeToStream]);

  return streamInfo;
}
