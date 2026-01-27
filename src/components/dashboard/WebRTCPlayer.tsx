'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Video, Loader2, AlertCircle } from 'lucide-react';
import { camerasApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useWebRTC, useStreamSubscription } from '@/contexts/WebRTCContext';

interface WebRTCPlayerProps {
  cameraId: string;
  cameraName: string;
  active: boolean;
  connected: boolean;
  fullscreen?: boolean;
}

type PlayerState = 'idle' | 'connecting' | 'playing' | 'error';

export function WebRTCPlayer({
  cameraId,
  cameraName,
  active,
  connected,
  fullscreen = false
}: WebRTCPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { connectStream } = useWebRTC();
  const streamInfo = useStreamSubscription(active && connected ? cameraId : null);

  const [localState, setLocalState] = useState<PlayerState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const isConnectingRef = useRef(false);

  // 전역 스트림 상태를 로컬 상태로 동기화
  useEffect(() => {
    if (!streamInfo) {
      if (active && connected) {
        // 아직 스트림이 없으면 idle 상태 유지
      } else {
        setLocalState('idle');
      }
      return;
    }

    switch (streamInfo.state) {
      case 'connecting':
        setLocalState('connecting');
        break;
      case 'playing':
        setLocalState('playing');
        isConnectingRef.current = false;
        // 비디오에 스트림 연결
        if (videoRef.current && streamInfo.stream) {
          videoRef.current.srcObject = streamInfo.stream;
          videoRef.current.play().catch(() => {});
        }
        break;
      case 'error':
        setLocalState('error');
        setErrorMessage(streamInfo.errorMessage || '연결 실패');
        isConnectingRef.current = false;
        break;
    }
  }, [streamInfo, active, connected]);

  // 스트림 시작
  const startStream = useCallback(async () => {
    if (isConnectingRef.current) return;
    isConnectingRef.current = true;

    setLocalState('connecting');
    setErrorMessage('');

    try {
      // 스트림 토큰 요청
      const { streamUrl, token } = await camerasApi.requestStream(cameraId);

      // URL에서 path 추출 (예: http://localhost:8889/cam1/whep -> cam1)
      const urlObj = new URL(streamUrl);
      const pathParts = urlObj.pathname.split('/');
      const path = pathParts[1];
      const mediamtxUrl = `${urlObj.protocol}//${urlObj.host}`;

      // 전역 Context로 연결
      await connectStream(cameraId, token, mediamtxUrl, path);
    } catch (error) {
      isConnectingRef.current = false;
      setLocalState('error');
      setErrorMessage(error instanceof Error ? error.message : '연결 실패');
    }
  }, [cameraId, connectStream]);

  // active/connected 상태 변경 시
  useEffect(() => {
    if (active && connected) {
      // 이미 playing 상태면 재연결하지 않음
      if (localState !== 'playing' && !isConnectingRef.current && !streamInfo) {
        startStream();
      }
    } else {
      // 비활성화 시 비디오만 해제 (전역 스트림은 유지)
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setLocalState('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, connected]);

  // 비활성화 또는 오프라인일 때
  if (!connected || !active) {
    return null;
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full ${
          fullscreen ? 'object-contain' : 'object-cover'
        } ${localState === 'playing' ? 'block' : 'hidden'}`}
      />

      {localState === 'connecting' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 py-3 rounded-lg border border-white/30 bg-black/40">
            <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2 icon-shadow" />
            <p className="text-sm text-white font-medium text-shadow">연결 중...</p>
          </div>
        </div>
      )}

      {localState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 py-3 rounded-lg border border-white/30 bg-black/40">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2 icon-shadow" />
            <p className="text-sm text-white font-medium mb-2 text-shadow">{errorMessage}</p>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                startStream();
              }}
            >
              다시 시도
            </Button>
          </div>
        </div>
      )}

      {localState === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 py-3 rounded-lg border border-white/30 bg-black/40">
            <Video className="h-8 w-8 text-white/80 mx-auto mb-1 icon-shadow" />
            <p className="text-xs text-white/80 text-shadow-sm">{cameraName}</p>
          </div>
        </div>
      )}
    </>
  );
}
