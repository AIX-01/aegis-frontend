'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Video,
  Pencil,
  Check,
  X,
  Wifi,
  WifiOff,
  Brain,
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

  if (!camera) return null;

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveAlias();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                camera.connected ? "bg-success/10" : "bg-muted"
              )}>
                {camera.connected ? (
                  <Wifi className="h-5 w-5 text-success" />
                ) : (
                  <WifiOff className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <span className="font-mono text-muted-foreground">{camera.name}</span>
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {/* Editable Alias */}
                  {isEditingAlias ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={aliasInput}
                        onChange={(e) => setAliasInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-7 w-48 text-sm"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveAlias}>
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">{camera.alias}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={handleStartEdit}
                      >
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Connection status + Switches */}
            <div className="flex items-center gap-4">
              {/* Connection status (Online/Offline) */}
              {camera.connected ? (
                <div className="flex items-center gap-1.5 text-success">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  <span className="text-sm font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>
                  </span>
                  <span className="text-sm font-medium">Offline</span>
                </div>
              )}

              {/* 카메라 활성화 스위치 */}
              <div className="flex items-center gap-2 pl-4 border-l">
                <Label htmlFor="enabled-switch" className="text-sm text-muted-foreground">
                  카메라
                </Label>
                <Switch
                  id="enabled-switch"
                  checked={camera.enabled}
                  onCheckedChange={(checked) => onToggleEnabled(camera.id, checked)}
                />
              </div>

              {/* AI 분석 스위치 (enabled=true일 때만 활성화) */}
              <div className="flex items-center gap-2 pl-4 border-l">
                <Label
                  htmlFor="analysis-switch"
                  className={cn(
                    "text-sm flex items-center gap-1",
                    camera.enabled ? "text-muted-foreground" : "text-muted-foreground/50"
                  )}
                >
                  <Brain className="h-3.5 w-3.5" />
                  AI 분석
                </Label>
                <Switch
                  id="analysis-switch"
                  checked={camera.analysisEnabled}
                  onCheckedChange={(checked) => onToggleAnalysis(camera.id, checked)}
                  disabled={!camera.enabled}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* Video Stream */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {/* WebRTC Player */}
            <WebRTCPlayer
              cameraId={camera.id}
              cameraName={camera.name}
              active={camera.enabled}
              connected={camera.connected}
            />

            {/* Live indicator overlay */}
            {camera.connected && camera.enabled && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium z-10">
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                LIVE
              </div>
            )}

            {/* AI 분석 활성화 표시 */}
            {camera.connected && camera.enabled && camera.analysisEnabled && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium z-10">
                <Brain className="h-3 w-3" />
                AI
              </div>
            )}

            {/* Offline overlay */}
            {!camera.connected && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <WifiOff className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">카메라 연결 끊김</p>
                </div>
              </div>
            )}

            {/* Inactive (OFF) overlay */}
            {camera.connected && !camera.enabled && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">카메라 OFF</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
