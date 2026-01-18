'use client';

import { Camera, Video, AlertTriangle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Camera as CameraType } from "@/types";

interface CCTVGridProps {
  cameras: CameraType[];
}

const getStatusStyles = (status: CameraType['status']) => {
  switch (status) {
    case 'alert':
      return 'border-destructive bg-destructive/5 alert-pulse';
    case 'warning':
      return 'border-warning bg-warning/5';
    case 'offline':
      return 'border-muted bg-muted/50 opacity-60';
    default:
      return 'border-border hover:border-primary/30';
  }
};

const getStatusBadge = (status: CameraType['status'], alertType?: CameraType['alertType']) => {
  switch (status) {
    case 'alert':
      return (
        <Badge variant="destructive" className="text-xs gap-1">
          <AlertCircle className="h-3 w-3" />
          {alertType === 'assault' ? '폭행' : alertType === 'theft' ? '절도' : '위험'}
        </Badge>
      );
    case 'warning':
      return (
        <Badge className="bg-warning text-warning-foreground text-xs gap-1">
          <AlertTriangle className="h-3 w-3" />
          의심
        </Badge>
      );
    case 'offline':
      return (
        <Badge variant="secondary" className="text-xs">
          오프라인
        </Badge>
      );
    default:
      return null;
  }
};

export function CCTVGrid({ cameras }: CCTVGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {cameras.map((camera) => (
        <Card
          key={camera.id}
          className={cn(
            "relative overflow-hidden transition-all duration-300 cursor-pointer",
            "aspect-video border-2",
            getStatusStyles(camera.status)
          )}
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Camera className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-medium truncate">{camera.location}</span>
              </div>
              {getStatusBadge(camera.status, camera.alertType)}
            </div>
          </div>

          {/* Camera ID */}
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-mono text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded">
              {camera.name}
            </span>
          </div>

          {/* Live indicator */}
          {camera.status !== 'offline' && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-[10px] font-medium text-success">LIVE</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
