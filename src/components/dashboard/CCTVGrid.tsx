'use client';

import { useState } from "react";
import { Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ManagedCamera } from "@/types";
import { CameraDetailModal } from "./CameraDetailModal";
import { CameraThumbnail } from "./CameraThumbnail";

interface CCTVGridProps {
  cameras: ManagedCamera[];
  onUpdateAlias?: (cameraId: string, alias: string) => void;
  onToggleActive?: (cameraId: string, active: boolean) => void;
}

export function CCTVGrid({ cameras, onUpdateAlias, onToggleActive }: CCTVGridProps) {
  const [selectedCamera, setSelectedCamera] = useState<ManagedCamera | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCameraClick = (camera: ManagedCamera) => {
    setSelectedCamera(camera);
    setIsModalOpen(true);
  };

  const handleUpdateAlias = (cameraId: string, alias: string) => {
    if (onUpdateAlias) {
      onUpdateAlias(cameraId, alias);
    }
    // 로컬 선택된 카메라 업데이트 (즉각적인 UI 피드백)
    if (selectedCamera && selectedCamera.id === cameraId) {
      setSelectedCamera({ ...selectedCamera, alias });
    }
  };

  const handleToggleActive = (cameraId: string, active: boolean) => {
    if (onToggleActive) {
      onToggleActive(cameraId, active);
    }
    // 로컬 선택된 카메라 업데이트 (즉각적인 UI 피드백)
    if (selectedCamera && selectedCamera.id === cameraId) {
      setSelectedCamera({ ...selectedCamera, active });
    }
  };

  return (
    <>
      {/* 카메라 그리드 - 스크롤 방식 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cameras.map((camera) => (
          <Card
            key={camera.id}
            className={cn(
              "relative overflow-hidden transition-all duration-300 cursor-pointer",
              "aspect-video border-2 hover:ring-2 hover:ring-primary/20",
              camera.connected
                ? "border-border hover:border-primary/30"
                : "border-muted bg-muted/50 opacity-60"
            )}
            onClick={() => handleCameraClick(camera)}
          >
            {/* 썸네일 */}
            <CameraThumbnail
              cameraId={camera.id}
              active={camera.active}
              connected={camera.connected}
            />

            {/* 카메라 정보 오버레이 */}
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-background/90 to-transparent">
              <div className="flex items-center gap-1.5 min-w-0">
                <Camera className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-medium truncate">{camera.alias}</span>
              </div>
            </div>

            {/* 카메라 ID */}
            <div className="absolute top-2 left-2">
              <span className="text-[10px] font-mono text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded">
                {camera.name}
              </span>
            </div>

            {/* 연결 상태 표시 */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {camera.connected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  <span className="text-[10px] font-medium text-success">Online</span>
                </>
              ) : (
                <span className="text-[10px] font-medium text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded">
                  Offline
                </span>
              )}
            </div>

            {/* 비활성(OFF) 오버레이 */}
            {camera.connected && !camera.active && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                  OFF
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <CameraDetailModal
        camera={selectedCamera}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUpdateAlias={handleUpdateAlias}
        onToggleActive={handleToggleActive}
      />
    </>
  );
}
