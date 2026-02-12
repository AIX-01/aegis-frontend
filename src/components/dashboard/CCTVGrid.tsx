'use client';

import { useState, useEffect, useMemo } from "react";
import { Camera, ChevronLeft, ChevronRight, Brain, Power, ArrowLeft, Pencil, Check, X, WifiOff, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/lib/axios";
import type { ManagedCamera } from "@/types";
import { WebRTCPlayer } from "./WebRTCPlayer";
import { useWebRTC } from "@/contexts/WebRTCContext";


// 공통: 상태 배지 (ON/OFF + AI) - 밝은 배경용
function StatusBadges({ camera }: { camera: ManagedCamera }) {
  return (
    <div className="flex items-center gap-1">
      {camera.enabled ? (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-background/80 text-success border-success/50">
          <Power className="h-2.5 w-2.5 mr-0.5" />
          ON
        </Badge>
      ) : (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-background/80 text-muted-foreground border-border">
          <Power className="h-2.5 w-2.5 mr-0.5" />
          OFF
        </Badge>
      )}
      {camera.enabled && camera.analysisEnabled && (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-background/80 text-primary border-primary/50">
          <Brain className="h-2.5 w-2.5 mr-0.5" />
          AI
        </Badge>
      )}
    </div>
  );
}

// 공통: 연결 상태 배지 - 밝은 배경용
function ConnectionBadge({ camera }: { camera: ManagedCamera }) {
  return camera.connected ? (
    <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-background/80 text-success border-success/50">
      <span className="relative flex h-1.5 w-1.5 mr-1">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
      </span>
      Online
    </Badge>
  ) : (
    <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-background/80 text-muted-foreground border-border">
      Offline
    </Badge>
  );
}

// 공통: 카메라 정보 (아이콘 + 장소 + 실명)
function CameraInfo({
  camera,
  showEdit = false,
  onEditClick,
  size = 'default',
  noBorder = false,
  // 편집 모드 props
  isEditing = false,
  editValue = '',
  onEditChange,
  onEditSave,
  onEditCancel,
  onEditKeyDown
}: {
  camera: ManagedCamera;
  showEdit?: boolean;
  onEditClick?: () => void;
  size?: 'sm' | 'default';
  noBorder?: boolean;
  // 편집 모드 props
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (value: string) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
  onEditKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const isSmall = size === 'sm';
  const containerClass = noBorder
    ? "flex items-center gap-1.5"
    : "flex items-center gap-1.5 bg-background/80 border border-border rounded-md px-2 py-1";

  if (isEditing && onEditChange && onEditSave && onEditCancel && onEditKeyDown) {
    return (
      <div className={containerClass}>
        <Camera className={cn("flex-shrink-0 text-foreground", isSmall ? "h-3 w-3" : "h-3.5 w-3.5")} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Input
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={onEditKeyDown}
              className="h-6 w-32 text-xs font-medium"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-6 w-6 text-foreground hover:bg-primary/10" onClick={onEditSave}>
              <Check className="h-3 w-3 text-success" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-foreground hover:bg-primary/10" onClick={onEditCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          <span className={cn("font-mono text-muted-foreground", isSmall ? "text-[8px]" : "text-[10px]")}>{camera.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Camera className={cn("flex-shrink-0 text-foreground", isSmall ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1">
          <span className={cn("font-medium text-foreground truncate", isSmall ? "text-[10px]" : "text-xs")}>{camera.location}</span>
          {showEdit && onEditClick && (
            <Button size="icon" variant="ghost" className="h-5 w-5 text-foreground hover:bg-primary/10" onClick={onEditClick}>
              <Pencil className="h-2.5 w-2.5 text-foreground" />
            </Button>
          )}
        </div>
        <span className={cn("font-mono text-muted-foreground truncate", isSmall ? "text-[8px]" : "text-[10px]")}>{camera.name}</span>
      </div>
    </div>
  );
}

// 공통: OFF 오버레이
function OffOverlay({ size = 'default' }: { size?: 'sm' | 'default' }) {
  const isSmall = size === 'sm';
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[5]">
      <div className="text-center">
        <Video className={cn("text-muted-foreground mx-auto", isSmall ? "h-8 w-8 mb-1" : "h-12 w-12 mb-2")} />
        <p className={cn("text-foreground font-semibold", isSmall ? "text-sm" : "text-base")}>카메라 OFF</p>
      </div>
    </div>
  );
}

// 공통: 오프라인 오버레이
function OfflineOverlay({ size = 'default' }: { size?: 'sm' | 'default' }) {
  const isSmall = size === 'sm';
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[5]">
      <div className="text-center">
        <WifiOff className={cn("text-muted-foreground mx-auto", isSmall ? "h-8 w-8 mb-1" : "h-12 w-12 mb-2")} />
        <p className={cn("text-foreground font-semibold", isSmall ? "text-sm" : "text-base")}>신호 없음</p>
      </div>
    </div>
  );
}

interface CCTVGridProps {
  cameras: ManagedCamera[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUpdateLocation?: (cameraId: string, location: string) => void;
  onToggleEnabled?: (cameraId: string, enabled: boolean) => void;
  onToggleAnalysis?: (cameraId: string, analysisEnabled: boolean) => void;
}

export function CCTVGrid({
  cameras,
  currentPage,
  totalPages,
  onPageChange,
  onUpdateLocation,
  onToggleEnabled,
  onToggleAnalysis
}: CCTVGridProps) {
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  // cameras prop에서 selectedCamera 파생 (항상 최신 상태 유지)
  const selectedCamera = useMemo(() => {
    if (!selectedCameraId) return null;
    return cameras.find(c => c.id === selectedCameraId) || null;
  }, [cameras, selectedCameraId]);

  const { setActiveGridCameras } = useWebRTC();

  // 현재 그리드 카메라 변경 시 WebRTC Context에 알림
  useEffect(() => {
    const activeIds = cameras
      .filter(cam => cam.enabled && cam.connected)
      .map(cam => cam.id);
    setActiveGridCameras(activeIds);
  }, [cameras, setActiveGridCameras]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen && !isEditingLocation) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen, isEditingLocation]);

  const goToPrevPage = () => onPageChange(currentPage === 0 ? totalPages - 1 : currentPage - 1);
  const goToNextPage = () => onPageChange(currentPage === totalPages - 1 ? 0 : currentPage + 1);

  const handleCameraClick = (camera: ManagedCamera) => {
    setSelectedCameraId(camera.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditingLocation(false);
  };

  const handleUpdateLocation = (cameraId: string, location: string) => {
    onUpdateLocation?.(cameraId, location);
  };

  const handleToggleEnabled = (cameraId: string, enabled: boolean) => {
    onToggleEnabled?.(cameraId, enabled);
  };

  const handleToggleAnalysis = (cameraId: string, analysisEnabled: boolean) => {
    onToggleAnalysis?.(cameraId, analysisEnabled);
  };

  const handleStartEdit = () => {
    if (selectedCamera) {
      setLocationInput(selectedCamera.location);
      setIsEditingLocation(true);
    }
  };

  const handleSaveLocation = () => {
    if (selectedCamera && locationInput.trim()) {
      handleUpdateLocation(selectedCamera.id, locationInput.trim());
    }
    setIsEditingLocation(false);
  };

  const handleCancelEdit = () => {
    setIsEditingLocation(false);
    setLocationInput('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveLocation();
    else if (e.key === 'Escape') { e.stopPropagation(); handleCancelEdit(); }
  };


  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* 3x2 그리드 */}
        <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2 p-1 content-start overflow-auto">
          {cameras.map((camera) => (
            <Card
              key={camera.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 cursor-pointer aspect-video",
                "border-2 hover:ring-2 hover:ring-primary/20",
                camera.connected
                  ? "border-transparent hover:border-primary/30 bg-muted"
                  : "border-muted bg-muted"
              )}
              onClick={() => handleCameraClick(camera)}
            >
              {/* WebRTC 플레이어 */}
              <div className="absolute inset-0">
                <WebRTCPlayer
                  cameraId={camera.id}
                  streamUrl={camera.streamUrl}
                  accessToken={getAccessToken() || ''}
                  active={camera.enabled}
                  connected={camera.connected}
                />
              </div>

              {/* 좌상단: 카메라 정보 */}
              <div className="absolute top-2 left-2 z-10">
                <CameraInfo camera={camera} size="sm" />
              </div>

              {/* 우상단: 상태 + 연결 배지 */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                <StatusBadges camera={camera} />
                <ConnectionBadge camera={camera} />
              </div>

              {/* OFF 오버레이 - 연결된 상태에서만 */}
              {camera.connected && !camera.enabled && <OffOverlay size="sm" />}

              {/* 오프라인 오버레이 */}
              {!camera.connected && <OfflineOverlay size="sm" />}
            </Card>
          ))}
        </div>

        {/* 페이지네이션 - 항상 표시 */}
        <div className="flex justify-center items-center gap-4 pt-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevPage}
            className="h-8 w-8"
            disabled={totalPages <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {currentPage + 1} / {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            className="h-8 w-8"
            disabled={totalPages <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 전체화면 모달 */}
      {isModalOpen && selectedCamera && (
        <div className="fixed inset-0 z-50 bg-muted">
          {/* 비디오 영역 - WebRTCPlayer 직접 렌더링 (전역 스트림 공유) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <WebRTCPlayer
              cameraId={selectedCamera.id}
              streamUrl={selectedCamera.streamUrl}
              accessToken={getAccessToken() || ''}
              active={selectedCamera.enabled}
              connected={selectedCamera.connected}
              fullscreen
            />
          </div>

          {/* 좌상단: 뒤로가기 + 카메라 정보 + 컨트롤 */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-3 bg-background/80 border border-border rounded-md px-2 py-1.5">
            {/* 뒤로가기 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-foreground hover:bg-primary/10"
              onClick={handleCloseModal}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-border" />

            {/* 카메라 정보 */}
            <CameraInfo
              camera={selectedCamera}
              showEdit={!isEditingLocation}
              onEditClick={handleStartEdit}
              noBorder
              isEditing={isEditingLocation}
              editValue={locationInput}
              onEditChange={setLocationInput}
              onEditSave={handleSaveLocation}
              onEditCancel={handleCancelEdit}
              onEditKeyDown={handleInputKeyDown}
            />

            <div className="w-px h-5 bg-border" />

            {/* 카메라 ON/OFF 컨트롤 */}
            <div className="flex items-center gap-2">
              <Power className="h-3.5 w-3.5 text-foreground" />
              <span className="text-xs text-foreground">카메라</span>
              <Switch
                checked={selectedCamera.enabled}
                onCheckedChange={(checked) => handleToggleEnabled(selectedCamera.id, checked)}
                className="scale-90"
              />
            </div>

            <div className="w-px h-5 bg-border" />

            {/* AI 분석 컨트롤 */}
            <div className={cn(
              "flex items-center gap-2",
              !selectedCamera.enabled && "opacity-50"
            )}>
              <Brain className="h-3.5 w-3.5 text-foreground" />
              <span className="text-xs text-foreground">AI</span>
              <Switch
                checked={selectedCamera.analysisEnabled}
                onCheckedChange={(checked) => handleToggleAnalysis(selectedCamera.id, checked)}
                disabled={!selectedCamera.enabled}
                className="scale-90"
              />
            </div>
          </div>

          {/* 우상단: 상태 + 연결 배지 */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
            <StatusBadges camera={selectedCamera} />
            <ConnectionBadge camera={selectedCamera} />
          </div>

          {/* 오프라인 오버레이 */}
          {!selectedCamera.connected && <OfflineOverlay />}

          {/* OFF 오버레이 */}
          {selectedCamera.connected && !selectedCamera.enabled && <OffOverlay />}
        </div>
      )}
    </>
  );
}
