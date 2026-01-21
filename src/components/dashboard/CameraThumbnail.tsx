'use client';

import { useState, useEffect, useCallback } from 'react';
import { Video } from 'lucide-react';
import { camerasApi } from '@/lib/api';

interface CameraThumbnailProps {
  cameraId: string;
  active: boolean;
  connected: boolean;
}

// 썸네일 캐시 (TTL 3초)
const thumbnailCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 3000; // 3초

export function CameraThumbnail({
  cameraId,
  active,
  connected,
}: CameraThumbnailProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const fetchThumbnail = useCallback(async () => {
    if (!active || !connected) {
      setThumbnailSrc(null);
      return;
    }

    // 캐시 확인 (TTL 3초)
    const cached = thumbnailCache.get(cameraId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setThumbnailSrc(cached.data);
      setError(false);
      return;
    }

    try {
      const response = await camerasApi.getThumbnail(cameraId);
      if (response.image) {
        const src = `data:image/jpeg;base64,${response.image}`;
        thumbnailCache.set(cameraId, { data: src, timestamp: Date.now() });
        setThumbnailSrc(src);
        setError(false);
      }
    } catch {
      setError(true);
    }
  }, [cameraId, active, connected]);

  // 초기 로드 및 visibility 변경 시 재로드
  useEffect(() => {
    fetchThumbnail();

    // 탭 visibility 변경 감지
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchThumbnail();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchThumbnail]);

  // 썸네일이 있으면 이미지 표시
  if (thumbnailSrc && !error) {
    return (
      <div className="absolute inset-0">
        <img
          src={thumbnailSrc}
          alt="Camera thumbnail"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 썸네일이 없으면 placeholder
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
      <div className="text-muted-foreground/40">
        <Video className="h-8 w-8" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
