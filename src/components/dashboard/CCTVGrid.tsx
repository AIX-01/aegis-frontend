'use client';

import { useState, useEffect, useMemo } from "react";
import { Camera, ChevronLeft, ChevronRight, Brain, Power, ArrowLeft, Pencil, Check, X, WifiOff, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ManagedCamera } from "@/types";
import { WebRTCPlayer } from "./WebRTCPlayer";
import { useWebRTC } from "@/contexts/WebRTCContext";

const CAMERAS_PER_PAGE = 9;
const GRID_PAGE_STORAGE_KEY = 'aegis_cctv_grid_page';

// 공통: 상태 배지 (ON/OFF + AI)
function StatusBadges({ camera }: { camera: ManagedCamera }) {
  return (
    <div className="flex items-center gap-1">
      {camera.enabled ? (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-white/20 backdrop-blur-sm text-success border-success/50">
          <Power className="h-2.5 w-2.5 mr-0.5" />
          ON
        </Badge>
      ) : (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-white/20 backdrop-blur-sm text-white border-white/50">
          <Power className="h-2.5 w-2.5 mr-0.5" />
          OFF
        </Badge>
      )}
      {camera.enabled && camera.analysisEnabled && (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-white/20 backdrop-blur-sm text-primary border-primary/50">
          <Brain className="h-2.5 w-2.5 mr-0.5" />
          AI
        </Badge>
      )}
    </div>
  );
}

// 공통: 연결 상태 배지
function ConnectionBadge({ camera }: { camera: ManagedCamera }) {
  return camera.connected ? (
    <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-white/20 backdrop-blur-sm text-success border-success/50">
      <span className="relative flex h-1.5 w-1.5 mr-1">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
      </span>
      Online
    </Badge>
  ) : (
    <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-white/20 backdrop-blur-sm text-white border-white/50">
      Offline
    </Badge>
  );
}

// 공통: 카메라 정보 (아이콘 + 별명 + 실명)
function CameraInfo({
  camera,
  showEdit = false,
  onEditClick
}: {
  camera: ManagedCamera;
  showEdit?: boolean;
  onEditClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Camera className="h-3.5 w-3.5 text-white flex-shrink-0" />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-white truncate">{camera.alias}</span>
          {showEdit && onEditClick && (
            <Button size="icon" variant="ghost" className="h-5 w-5 text-white hover:bg-white/10" onClick={onEditClick}>
              <Pencil className="h-2.5 w-2.5 text-white" />
            </Button>
          )}
        </div>
        <span className="text-[10px] font-mono text-white/80 truncate">{camera.name}</span>
      </div>
    </div>
  );
}

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
  // localStorage에서 페이지 상태 복원
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(GRID_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [selectedCamera, setSelectedCamera] = useState<ManagedCamera | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [aliasInput, setAliasInput] = useState('');


  const { setActiveGridCameras } = useWebRTC();

  const totalPages = Math.max(1, Math.ceil(cameras.length / CAMERAS_PER_PAGE));

  const currentCameras = useMemo(() => {
    const start = currentPage * CAMERAS_PER_PAGE;
    return cameras.slice(start, start + CAMERAS_PER_PAGE);
  }, [cameras, currentPage]);

  // 페이지 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(GRID_PAGE_STORAGE_KEY, currentPage.toString());
  }, [currentPage]);

  // 현재 그리드 카메라 변경 시 WebRTC Context에 알림
  useEffect(() => {
    const activeIds = currentCameras
      .filter(cam => cam.enabled && cam.connected)
      .map(cam => cam.id);
    setActiveGridCameras(activeIds);
  }, [currentCameras, setActiveGridCameras]);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen && !isEditingAlias) {
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
  }, [isModalOpen, isEditingAlias]);

  const goToPrevPage = () => setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));

  const handleCameraClick = (camera: ManagedCamera) => {
    setSelectedCamera(camera);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditingAlias(false);
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

  const handleStartEdit = () => {
    if (selectedCamera) {
      setAliasInput(selectedCamera.alias);
      setIsEditingAlias(true);
    }
  };

  const handleSaveAlias = () => {
    if (selectedCamera && aliasInput.trim()) {
      handleUpdateAlias(selectedCamera.id, aliasInput.trim());
    }
    setIsEditingAlias(false);
  };

  const handleCancelEdit = () => {
    setIsEditingAlias(false);
    setAliasInput('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveAlias();
    else if (e.key === 'Escape') { e.stopPropagation(); handleCancelEdit(); }
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
                  ? "border-transparent hover:border-primary/30 bg-muted"
                  : "border-muted bg-muted"
              )}
              onClick={() => handleCameraClick(camera)}
            >
              {/* WebRTC 플레이어 */}
              <div className="absolute inset-0">
                <WebRTCPlayer
                  cameraId={camera.id}
                  cameraName={camera.name}
                  active={camera.enabled}
                  connected={camera.connected}
                />
              </div>

              {/* 좌상단: 카메라 정보 - 오프라인이면 검은 텍스트 */}
              <div className="absolute top-2 left-2 z-10">
                <div className="flex items-center gap-1.5">
                  <Camera className={cn("h-3.5 w-3.5 flex-shrink-0", camera.connected ? "text-white" : "text-foreground")} />
                  <div className="flex flex-col min-w-0">
                    <span className={cn("text-xs font-medium truncate", camera.connected ? "text-white" : "text-foreground")}>{camera.alias}</span>
                    <span className={cn("text-[10px] font-mono truncate", camera.connected ? "text-white/80" : "text-muted-foreground")}>{camera.name}</span>
                  </div>
                </div>
              </div>

              {/* 우상단: 연결 + 상태 배지 - 오프라인이면 다른 스타일 */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                {camera.connected ? (
                  <>
                    <StatusBadges camera={camera} />
                    <ConnectionBadge camera={camera} />
                  </>
                ) : (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-muted text-muted-foreground border-border">
                    Offline
                  </Badge>
                )}
              </div>

              {/* OFF 오버레이 - 연결된 상태에서만 */}
              {camera.connected && !camera.enabled && (
                <div className="absolute inset-0 flex items-center justify-center z-[5]">
                  <span className="text-sm font-semibold text-white px-3 py-1.5 rounded-md border border-white/30 bg-black/40">
                    카메라 OFF
                  </span>
                </div>
              )}

              {/* 오프라인 오버레이 - 흰 배경에 검은 텍스트 */}
              {!camera.connected && (
                <div className="absolute inset-0 flex items-center justify-center z-[5]">
                  <span className="text-sm font-semibold text-foreground">
                    신호 없음
                  </span>
                </div>
              )}
            </Card>
          ))}

          {/* 빈 셀 */}
          {Array.from({ length: CAMERAS_PER_PAGE - currentCameras.length }).map((_, i) => (
            <Card key={`empty-${i}`} className="border-2 border-dashed border-muted bg-muted/20 aspect-video" />
          ))}
        </div>

        {/* 페이지네이션 - 항상 표시 */}
        <div className="flex justify-center items-center gap-4 mt-4">
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
            {currentPage + 1} / {totalPages}
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
              cameraName={selectedCamera.name}
              active={selectedCamera.enabled}
              connected={selectedCamera.connected}
              fullscreen
            />
          </div>

          {/* 좌상단: 뒤로가기 + 카메라 정보 */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={handleCloseModal}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {isEditingAlias ? (
              <div className="flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-white" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <Input
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      className="h-6 w-32 text-xs font-medium bg-black/50 border-white/30 text-white"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:bg-white/10" onClick={handleSaveAlias}>
                      <Check className="h-3 w-3 text-success" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:bg-white/10" onClick={handleCancelEdit}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-[10px] font-mono text-white/80">{selectedCamera.name}</span>
                </div>
              </div>
            ) : (
              <CameraInfo camera={selectedCamera} showEdit onEditClick={handleStartEdit} />
            )}
          </div>

          {/* 우상단: 연결 + 상태 배지 */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
            <StatusBadges camera={selectedCamera} />
            <ConnectionBadge camera={selectedCamera} />
          </div>

          {/* 하단 컨트롤 (반투명, 중앙) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/40 border border-white/20 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-white">
              <Power className="h-3.5 w-3.5 text-white" />
              <span className="text-white">카메라</span>
              <Switch
                checked={selectedCamera.enabled}
                onCheckedChange={(checked) => handleToggleEnabled(selectedCamera.id, checked)}
                className="scale-90"
              />
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className={cn("flex items-center gap-2 text-xs text-white", !selectedCamera.enabled && "opacity-50")}>
              <Brain className="h-3.5 w-3.5 text-white" />
              <span className="text-white">AI 분석</span>
              <Switch
                checked={selectedCamera.analysisEnabled}
                onCheckedChange={(checked) => handleToggleAnalysis(selectedCamera.id, checked)}
                disabled={!selectedCamera.enabled}
                className="scale-90"
              />
            </div>
          </div>


          {/* 오프라인 오버레이 */}
          {!selectedCamera.connected && (
            <div className="absolute inset-0 flex items-center justify-center z-[5]">
              <div className="text-center px-6 py-4 rounded-lg border border-white/30 bg-black/40">
                <WifiOff className="h-12 w-12 text-white mx-auto mb-2" />
                <p className="text-base text-white font-semibold">카메라 신호 없음</p>
                <p className="text-xs text-white/80 mt-1">카메라가 꺼져있거나 네트워크 문제입니다</p>
              </div>
            </div>
          )}

          {/* OFF 오버레이 */}
          {selectedCamera.connected && !selectedCamera.enabled && (
            <div className="absolute inset-0 flex items-center justify-center z-[5]">
              <div className="text-center px-6 py-4 rounded-lg border border-white/30 bg-black/40">
                <Video className="h-12 w-12 text-white mx-auto mb-2" />
                <p className="text-base text-white font-semibold">카메라 OFF</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
