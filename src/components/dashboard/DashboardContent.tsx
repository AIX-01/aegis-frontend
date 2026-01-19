'use client';

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CCTVGrid } from "@/components/dashboard/CCTVGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor } from "lucide-react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useStreams } from "@/hooks/useMonitoring";
import { useToast } from "@/hooks/use-toast";
import type { ManagedCamera } from "@/types";

export function DashboardContent() {
  const { data: fetchedCameras = [], isLoading } = useStreams();
  const { toast } = useToast();

  // Local state for optimistic UI updates
  const [cameras, setCameras] = useState<ManagedCamera[]>([]);

  // Sync with fetched data
  useEffect(() => {
    if (fetchedCameras.length > 0 && cameras.length === 0) {
      setCameras(fetchedCameras);
    }
  }, [fetchedCameras, cameras.length]);

  const displayCameras = cameras.length > 0 ? cameras : fetchedCameras;

  const handleUpdateAlias = (cameraId: string, alias: string) => {
    setCameras(prev => prev.map(cam =>
      cam.id === cameraId ? { ...cam, alias } : cam
    ));
    toast({
      title: "별칭 수정 완료",
      description: `카메라 별칭이 "${alias}"(으)로 변경되었습니다.`,
    });
  };

  const handleToggleActive = (cameraId: string, active: boolean) => {
    setCameras(prev => prev.map(cam =>
      cam.id === cameraId ? { ...cam, active } : cam
    ));
    toast({
      title: active ? "카메라 ON" : "카메라 OFF",
      description: active
        ? "카메라가 활성화되었습니다."
        : "카메라가 비활성화되었습니다.",
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="카메라">
        <Card className="soft-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              실시간 카메라 모니터링
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">로딩 중...</p>
              </div>
            ) : (
              <CCTVGrid
                cameras={displayCameras}
                onUpdateAlias={handleUpdateAlias}
                onToggleActive={handleToggleActive}
              />
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
