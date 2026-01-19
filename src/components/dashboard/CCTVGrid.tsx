'use client';

import { useState } from "react";
import { Camera, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ManagedCamera } from "@/types";
import { CameraDetailModal } from "./CameraDetailModal";

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
    // Update local selected camera for immediate UI feedback
    if (selectedCamera && selectedCamera.id === cameraId) {
      setSelectedCamera({ ...selectedCamera, alias });
    }
  };

  const handleToggleActive = (cameraId: string, active: boolean) => {
    if (onToggleActive) {
      onToggleActive(cameraId, active);
    }
    // Update local selected camera for immediate UI feedback
    if (selectedCamera && selectedCamera.id === cameraId) {
      setSelectedCamera({ ...selectedCamera, active });
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
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
            {/* Video placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
              <div className="text-muted-foreground/40">
                <Video className="h-8 w-8" />
              </div>
              {/* Simulated video noise effect */}
              <div className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Camera info overlay */}
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-background/90 to-transparent">
              <div className="flex items-center gap-1.5 min-w-0">
                <Camera className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-medium truncate">{camera.alias}</span>
              </div>
            </div>

            {/* Camera ID */}
            <div className="absolute top-2 left-2">
              <span className="text-[10px] font-mono text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded">
                {camera.name}
              </span>
            </div>

            {/* Online/Offline indicator */}
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

            {/* Inactive (OFF) overlay */}
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
