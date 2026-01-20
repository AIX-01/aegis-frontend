'use client';

import { useState, useEffect } from 'react';
import { Video } from 'lucide-react';
import { camerasApi } from '@/lib/api';

interface CameraThumbnailProps {
  cameraId: string;
  active: boolean;
  connected: boolean;
  refreshInterval?: number; // ms, default 3000
}

export function CameraThumbnail({
  cameraId,
  active,
  connected,
  refreshInterval = 3000
}: CameraThumbnailProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!active || !connected) {
      setThumbnailSrc(null);
      return;
    }

    const fetchThumbnail = async () => {
      try {
        const response = await camerasApi.getThumbnail(cameraId);
        if (response.image) {
          setThumbnailSrc(`data:image/jpeg;base64,${response.image}`);
          setError(false);
        }
      } catch {
        setError(true);
      }
    };

    // 즉시 한 번 실행
    fetchThumbnail();

    // 주기적으로 갱신
    const interval = setInterval(fetchThumbnail, refreshInterval);

    return () => clearInterval(interval);
  }, [cameraId, active, connected, refreshInterval]);

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
      {/* Simulated video noise effect */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
