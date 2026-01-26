'use client';

import { useState, useEffect, useMemo } from "react";
import { Camera, ChevronLeft, ChevronRight, Brain, Power } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ManagedCamera } from "@/types";
import { CameraDetailModal } from "./CameraDetailModal";
import { WebRTCPlayer } from "./WebRTCPlayer";

const CAMERAS_PER_PAGE = 9; // 3x3 그리드

interface CCTVGridProps {
  cameras: ManagedCamera[];
  onUpdateAlias?: (cameraId: string, alias: string) => void;
  onToggleEnabled?: (cameraId: string, enabled: boolean) => void;
  onToggleAnalysis?: (cameraId: string, analysisEnabled: boolean) => void;
}

export function CCTVGrid({
  cameras,
  onUpdateAlias,
  onToggleEnabled,
  onToggleAnalysis
}: CCTVGridProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState<ManagedCamera | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(cameras.length / CAMERAS_PER_PAGE));

  // 현재 페이지의 카메라들
  const currentCameras = useMemo(() => {
    const start = currentPage * CAMERAS_PER_PAGE;
    return cameras.slice(start, start + CAMERAS_PER_PAGE);
  }, [cameras, currentPage]);

  // 페이지 범위 조정 (카메라 수가 줄어들었을 때)
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // 무한궤도 페이지네이션
  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handleCameraClick = (camera: ManagedCamera) => {
    setSelectedCamera(camera);
    setIsModalOpen(true);
  };

  const handleUpdateAlias = (cameraId: string, alias: string) => {
    onUpdateAlias?.(cameraId, alias);
    if (selectedCamera?.id === cameraId) {
      setSelectedCamera({ ...selectedCamera, alias });
    }
  };

  const handleToggleEnabled = (cameraId: string, enabled: boolean) => {
    onToggleEnabled?.(cameraId, enabled);
    if (selectedCamera?.id === cameraId) {
      setSelectedCamera({
        ...selectedCamera,
        enabled,
        // Option A: enabled=false면 analysisEnabled도 false
        analysisEnabled: enabled ? selectedCamera.analysisEnabled : false
      });
    }
  };

  const handleToggleAnalysis = (cameraId: string, analysisEnabled: boolean) => {
    onToggleAnalysis?.(cameraId, analysisEnabled);
    if (selectedCamera?.id === cameraId) {
      setSelectedCamera({ ...selectedCamera, analysisEnabled });
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* 3x3 그리드 */}
        <div className="flex-1 grid grid-cols-3 gap-2 auto-rows-fr">
          {currentCameras.map((camera) => (
            <Card
              key={camera.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 cursor-pointer aspect-video",
                "border-2 hover:ring-2 hover:ring-primary/20",
                camera.connected
                  ? "border-border hover:border-primary/30"
                  : "border-muted bg-muted/50"
              )}
              onClick={() => handleCameraClick(camera)}
            >
              {/* WebRTC 플레이어 (현재 페이지만 연결) */}
              <div className="absolute inset-0">
                <WebRTCPlayer
                  cameraId={camera.id}
                  cameraName={camera.name}
                  active={camera.enabled}
                  connected={camera.connected}
                />
              </div>

              {/* 카메라 정보 오버레이 */}
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-background/95 via-background/70 to-transparent z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Camera className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium truncate">{camera.alias}</span>
                      <span className="text-[10px] font-mono text-muted-foreground truncate">{camera.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {camera.enabled ? (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-success/10 text-success border-success/30">
                        <Power className="h-2.5 w-2.5 mr-0.5" />
                        ON
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-muted text-muted-foreground border-muted-foreground/30">
                        <Power className="h-2.5 w-2.5 mr-0.5" />
                        OFF
                      </Badge>
                    )}
                    {camera.enabled && camera.analysisEnabled && (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-primary/30">
                        <Brain className="h-2.5 w-2.5 mr-0.5" />
                        AI
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* 연결 상태 표시 */}
              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                {camera.connected ? (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-success/20 text-success border-success/30">
                    <span className="relative flex h-1.5 w-1.5 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
                    </span>
                    Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-muted text-muted-foreground">
                    Offline
                  </Badge>
                )}
              </div>

              {/* 비활성(OFF) 오버레이 */}
              {camera.connected && !camera.enabled && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-[5]">
                  <span className="text-sm text-muted-foreground bg-background/80 px-3 py-1.5 rounded-md font-medium">
                    카메라 OFF
                  </span>
                </div>
              )}

              {/* 오프라인 오버레이 */}
              {!camera.connected && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-[5]">
                  <span className="text-sm text-muted-foreground bg-background/80 px-3 py-1.5 rounded-md font-medium">
                    연결 끊김
                  </span>
                </div>
              )}
            </Card>
          ))}

          {/* 빈 셀 채우기 (3x3 유지) */}
          {Array.from({ length: CAMERAS_PER_PAGE - currentCameras.length }).map((_, i) => (
            <Card
              key={`empty-${i}`}
              className="border-2 border-dashed border-muted bg-muted/20 aspect-video"
            />
          ))}
        </div>

        {/* 페이지네이션 버튼 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevPage}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <CameraDetailModal
        camera={selectedCamera}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUpdateAlias={handleUpdateAlias}
        onToggleEnabled={handleToggleEnabled}
        onToggleAnalysis={handleToggleAnalysis}
      />
    </>
  );
}
