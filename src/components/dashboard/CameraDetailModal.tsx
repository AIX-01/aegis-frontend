'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Pencil,
  Check,
  X,
  WifiOff,
  Brain,
  Power,
  ArrowLeft,
} from "lucide-react";
import type { ManagedCamera } from "@/types";
import { cn } from "@/lib/utils";
import { WebRTCPlayer } from "./WebRTCPlayer";

interface CameraDetailModalProps {
  camera: ManagedCamera | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateAlias: (cameraId: string, alias: string) => void;
  onToggleEnabled: (cameraId: string, enabled: boolean) => void;
  onToggleAnalysis: (cameraId: string, analysisEnabled: boolean) => void;
}

export function CameraDetailModal({
  camera,
  open,
  onOpenChange,
  onUpdateAlias,
  onToggleEnabled,
  onToggleAnalysis,
}: CameraDetailModalProps) {
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [aliasInput, setAliasInput] = useState('');

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isEditingAlias) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, isEditingAlias, onOpenChange]);

  if (!camera || !open) return null;

  const handleStartEdit = () => {
    setAliasInput(camera.alias);
    setIsEditingAlias(true);
  };

  const handleSaveAlias = () => {
    if (aliasInput.trim()) {
      onUpdateAlias(camera.id, aliasInput.trim());
    }
    setIsEditingAlias(false);
  };

  const handleCancelEdit = () => {
    setIsEditingAlias(false);
    setAliasInput('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveAlias();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      handleCancelEdit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* 상단 헤더 */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-background via-background/80 to-transparent">
        <div className="flex items-center justify-between p-4">
          {/* 왼쪽: 뒤로가기 + 카메라 정보 */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              {/* 별칭 편집 */}
              {isEditingAlias ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="h-9 w-56 text-lg font-semibold bg-background/50 backdrop-blur-sm"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 bg-background/50 backdrop-blur-sm"
                    onClick={handleSaveAlias}
                  >
                    <Check className="h-4 w-4 text-success" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 bg-background/50 backdrop-blur-sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold">{camera.alias}</h1>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleStartEdit}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground font-mono">{camera.name}</p>
            </div>
          </div>

          {/* 오른쪽: 상태 배지들 */}
          <div className="flex items-center gap-3">
            {/* 연결 상태 */}
            {camera.connected ? (
              <Badge variant="outline" className="bg-success/20 text-success border-success/30 backdrop-blur-sm">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                Offline
              </Badge>
            )}

            {/* AI 분석 상태 */}
            {camera.enabled && camera.analysisEnabled && (
              <Badge className="bg-primary/90 backdrop-blur-sm">
                <Brain className="h-3 w-3 mr-1" />
                AI 분석 중
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* 비디오 영역 - 전체 화면 */}
      <div className="absolute inset-0 bg-black">
        <WebRTCPlayer
          cameraId={camera.id}
          cameraName={camera.name}
          active={camera.enabled}
          connected={camera.connected}
        />

        {/* LIVE 표시 */}
        {camera.connected && camera.enabled && (
          <div className="absolute top-20 left-4 z-10">
            <Badge className="bg-destructive text-destructive-foreground">
              <span className="h-2 w-2 rounded-full bg-current animate-pulse mr-2" />
              LIVE
            </Badge>
          </div>
        )}

        {/* 오프라인 오버레이 */}
        {!camera.connected && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
            <div className="text-center">
              <WifiOff className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">카메라 연결 끊김</p>
            </div>
          </div>
        )}

        {/* OFF 오버레이 */}
        {camera.connected && !camera.enabled && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
            <div className="text-center">
              <Video className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">카메라 OFF</p>
            </div>
          </div>
        )}
      </div>

      {/* 하단 컨트롤 바 */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="flex items-center justify-center gap-8 p-6">
          {/* 카메라 ON/OFF */}
          <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm rounded-full px-5 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <Power className="h-4 w-4" />
              <span>카메라</span>
            </div>
            <Switch
              checked={camera.enabled}
              onCheckedChange={(checked) => onToggleEnabled(camera.id, checked)}
            />
          </div>

          {/* AI 분석 */}
          <div className={cn(
            "flex items-center gap-3 bg-background/50 backdrop-blur-sm rounded-full px-5 py-2.5",
            !camera.enabled && "opacity-50"
          )}>
            <div className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              <span>AI 분석</span>
            </div>
            <Switch
              checked={camera.analysisEnabled}
              onCheckedChange={(checked) => onToggleAnalysis(camera.id, checked)}
              disabled={!camera.enabled}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
