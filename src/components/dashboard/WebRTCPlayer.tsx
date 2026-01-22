'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Video, Loader2, AlertCircle } from 'lucide-react';
import { camerasApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface WebRTCPlayerProps {
  cameraId: string;
  cameraName: string;
  active: boolean;
  connected: boolean;
}

type PlayerState = 'idle' | 'connecting' | 'playing' | 'error';

export function WebRTCPlayer({
  cameraId,
  cameraName,
  active,
  connected
}: WebRTCPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [state, setState] = useState<PlayerState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const startStream = useCallback(async () => {
    if (!active || !connected) return;

    setState('connecting');
    setErrorMessage('');

    try {
      // 1. 스트림 토큰 요청
      const { streamUrl, token } = await camerasApi.requestStream(cameraId);

      // 2. RTCPeerConnection 생성
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // 3. 트랙 수신 시 비디오에 연결
      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setState('playing');
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          setState('error');
          setErrorMessage('연결이 끊어졌습니다');
        }
      };

      // 4. Transceiver 추가 (recvonly)
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });

      // 5. Offer 생성
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 6. WHEP 요청 (토큰을 path에 포함: /cam/whep -> /cam__token/whep)
      // MediaMTX는 path를 그대로 인증 요청에 전달함
      const urlParts = streamUrl.split('/');
      const whepIndex = urlParts.findIndex(p => p === 'whep');
      if (whepIndex > 0) {
        urlParts[whepIndex - 1] = `${urlParts[whepIndex - 1]}__${token}`;
      }
      const whepUrl = urlParts.join('/');

      console.log('[WebRTC] streamUrl:', streamUrl);
      console.log('[WebRTC] token:', token);
      console.log('[WebRTC] whepUrl:', whepUrl);

      const response = await fetch(whepUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        throw new Error(`WHEP 요청 실패: ${response.status}`);
      }

      // 7. Answer 설정
      const answerSdp = await response.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

    } catch (error) {
      console.error('WebRTC connection failed:', error);
      setState('error');
      setErrorMessage(error instanceof Error ? error.message : '연결 실패');
    }
  }, [cameraId, active, connected]);

  const stopStream = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState('idle');
  }, []);

  // 모달 열릴 때 자동 연결, 닫힐 때 정리
  useEffect(() => {
    if (active && connected) {
      startStream();
    }

    return () => {
      stopStream();
    };
  }, [active, connected, startStream, stopStream]);

  // 비활성화 또는 오프라인일 때
  if (!connected || !active) {
    return null; // 부모 컴포넌트에서 오버레이 처리
  }

  // 연결 중
  if (state === 'connecting') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">연결 중...</p>
        </div>
      </div>
    );
  }

  // 에러
  if (state === 'error') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
          <Button variant="outline" size="sm" onClick={startStream}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // 대기 중 (idle)
  if (state === 'idle') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Video className="h-12 w-12 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">{cameraName}</p>
        </div>
      </div>
    );
  }

  // 재생 중
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}
