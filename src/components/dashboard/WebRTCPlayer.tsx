'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebRTC, useStreamSubscription } from '@/contexts/WebRTCContext';
import { cn } from '@/lib/utils';

interface WebRTCPlayerProps {
  cameraId: string;
  streamUrl: string;      // WebRTC WHEP URL
  accessToken: string;    // JWT 액세스 토큰
  active: boolean;
  connected: boolean;
  fullscreen?: boolean;
}

type PlayerState = 'idle' | 'connecting' | 'playing' | 'error';

export function WebRTCPlayer({
  cameraId,
  streamUrl,
  accessToken,
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
        setErrorMessage(streamInfo.errorMessage || '스트림 연결 실패');
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
      // 전역 Context로 연결 (streamUrl, accessToken은 props로 전달받음)
      await connectStream(cameraId, accessToken, streamUrl);
    } catch (error) {
      isConnectingRef.current = false;
      setLocalState('error');
      // 에러 메시지 한글화
      if (error instanceof Error) {
        const msg = error.message;
        if (msg.includes('401') || msg.includes('403')) {
          setErrorMessage('인증 실패');
        } else if (msg.includes('Network') || msg.includes('fetch')) {
          setErrorMessage('네트워크 연결 실패');
        } else if (msg.includes('timeout') || msg.includes('Timeout')) {
          setErrorMessage('연결 시간 초과');
        } else {
          setErrorMessage(msg);
        }
      } else {
        setErrorMessage('스트림 연결 실패');
      }
    }
  }, [cameraId, accessToken, streamUrl, connectStream]);

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

  // 비활성화 또는 오프라인일 때 - 아무것도 렌더링하지 않음
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
        className={cn(
          "absolute inset-0 w-full h-full",
          fullscreen ? 'object-contain' : 'object-cover',
          localState === 'playing' ? 'block' : 'hidden'
        )}
      />

      {localState === 'connecting' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 py-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">연결 중...</p>
          </div>
        </div>
      )}

      {localState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 py-3">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-sm font-medium mb-2 text-foreground">{errorMessage}</p>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-primary/10"
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
    </>
  );
}
