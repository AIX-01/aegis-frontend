'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { camerasApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useWebRTC, useStreamSubscription } from '@/contexts/WebRTCContext';
import { cn } from '@/lib/utils';

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
  cameraName: _cameraName,
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
      // 스트림 토큰 요청
      const { streamUrl, token } = await camerasApi.requestStream(cameraId);


      // URL 유효성 검사
      if (!streamUrl) {
        throw new Error('스트림 URL을 받지 못했습니다');
      }

      // URL에서 path 추출
      let fullUrl: URL;
      try {
        if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
          fullUrl = new URL(streamUrl);
        } else {
          fullUrl = new URL(streamUrl, window.location.origin);
        }
      } catch {
        throw new Error('잘못된 스트림 URL 형식입니다');
      }

      // 경로에서 카메라 이름 추출: /stream/cam1/whep -> cam1
      const pathParts = fullUrl.pathname.split('/').filter(Boolean);
      const whepIndex = pathParts.indexOf('whep');
      const path = whepIndex > 0 ? pathParts[whepIndex - 1] : pathParts[pathParts.length - 2];


      if (!path || path === 'whep' || path === 'stream') {
        throw new Error('스트림 경로를 찾을 수 없습니다');
      }

      const mediamtxUrl = `${fullUrl.protocol}//${fullUrl.host}`;

      // 전역 Context로 연결
      await connectStream(cameraId, token, mediamtxUrl, path);
    } catch (error) {
      isConnectingRef.current = false;
      setLocalState('error');
      // 에러 메시지 한글화
      if (error instanceof Error) {
        const msg = error.message;
        if (msg.includes('Failed to construct') || msg.includes('Invalid URL')) {
          setErrorMessage('스트림 URL 오류');
        } else if (msg.includes('Network') || msg.includes('fetch')) {
          setErrorMessage('네트워크 연결 실패');
        } else if (msg.includes('timeout') || msg.includes('Timeout')) {
          setErrorMessage('연결 시간 초과');
        } else if (msg.includes('401') || msg.includes('403')) {
          setErrorMessage('인증 실패');
        } else if (msg.includes('400')) {
          setErrorMessage('잘못된 요청');
        } else if (msg.includes('404')) {
          setErrorMessage('스트림을 찾을 수 없음');
        } else {
          setErrorMessage(msg);
        }
      } else {
        setErrorMessage('스트림 연결 실패');
      }
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
