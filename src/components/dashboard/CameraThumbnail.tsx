"use client";

import { useState, useEffect, useCallback } from "react";
import { Video } from "lucide-react";
import { camerasApi } from "@/lib/api";

interface CameraThumbnailProps {
  cameraId: string;
  active: boolean;
  connected: boolean;
}

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

    try {
      const response = await camerasApi.getThumbnail(cameraId);
      if (response.image) {
        setThumbnailSrc(`data:image/jpeg;base64,${response.image}`);
        setError(false);
      }
    } catch {
      setError(true);
    }
  }, [cameraId, active, connected]);

  // 초기 로드 및 탭 visibility 변경 시 재로드
  useEffect(() => {
    fetchThumbnail();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchThumbnail();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchThumbnail]);

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
