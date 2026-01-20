'use client';

import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ManagedCamera } from "@/types";
import { CameraDetailModal } from "./CameraDetailModal";
import { CameraThumbnail } from "./CameraThumbnail";

interface CCTVGridProps {
  cameras: ManagedCamera[];
  onUpdateAlias?: (cameraId: string, alias: string) => void;
  onToggleActive?: (cameraId: string, active: boolean) => void;
}

const CAMERAS_PER_PAGE = 9;

export function CCTVGrid({ cameras, onUpdateAlias, onToggleActive }: CCTVGridProps) {
  const [selectedCamera, setSelectedCamera] = useState<ManagedCamera | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(cameras.length / CAMERAS_PER_PAGE);
  const startIndex = currentPage * CAMERAS_PER_PAGE;
  const visibleCameras = cameras.slice(startIndex, startIndex + CAMERAS_PER_PAGE);

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

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <>
      <div className="relative">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background",
            (totalPages <= 1 || currentPage === 0) && "opacity-30 pointer-events-none"
          )}
          onClick={handlePrevPage}
          disabled={totalPages <= 1 || currentPage === 0}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Camera Grid */}
        <div
          className="grid grid-cols-3 grid-rows-3 gap-3 transition-opacity duration-300"
          style={{ minHeight: 'calc((100vw - 20rem) * 0.5625 / 3 * 3 + 1.5rem)' }}
        >
          {visibleCameras.map((camera) => (
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
              {/* Thumbnail */}
              <CameraThumbnail
                cameraId={camera.id}
                active={camera.active}
                connected={camera.connected}
              />

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

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background",
            (totalPages <= 1 || currentPage === totalPages - 1) && "opacity-30 pointer-events-none"
          )}
          onClick={handleNextPage}
          disabled={totalPages <= 1 || currentPage === totalPages - 1}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Page Indicator */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentPage === index
                    ? "bg-primary w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => setCurrentPage(index)}
              />
            ))}
          </div>
        )}
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
