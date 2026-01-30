'use client';

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CCTVGrid } from "@/components/dashboard/CCTVGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useStreams } from "@/hooks/useMonitoring";
import { useToast } from "@/hooks/use-toast";
import { camerasApi } from "@/lib/api";
import type { ManagedCamera } from "@/types";

export function DashboardContent() {
  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const pageSize = 9;

  const { data: camerasPage, isLoading } = useStreams(page, pageSize);
  const { toast } = useToast();

  const fetchedCameras = camerasPage?.content ?? [];
  const totalPages = camerasPage?.totalPages ?? 0;

  // 로컬 상태 (낙관적 UI 업데이트용)
  const [cameras, setCameras] = useState<ManagedCamera[]>([]);

  // 이전 데이터 참조 (불필요한 업데이트 방지)
  const prevFetchedRef = useRef<string>('');

  // 서버 데이터와 동기화 (SSE에서 캐시 무효화 시 자동 갱신)
  useEffect(() => {
    if (!fetchedCameras) return;

    const currentJson = JSON.stringify(fetchedCameras);
    if (prevFetchedRef.current !== currentJson) {
      prevFetchedRef.current = currentJson;
      setCameras(fetchedCameras);
    }
  }, [fetchedCameras]);


  const displayCameras = cameras.length > 0 ? cameras : (fetchedCameras ?? []);

  const handleUpdateLocation = async (cameraId: string, location: string) => {
    // 낙관적 UI 업데이트
    const prevCameras = [...cameras];
    setCameras(prev => prev.map(cam =>
      cam.id === cameraId ? { ...cam, location } : cam
    ));

    try {
      await camerasApi.update(cameraId, { location });
      toast({
        title: "장소 수정 완료",
        description: `카메라 장소가 "${location}"(으)로 변경되었습니다.`,
      });
    } catch {
      // 실패 시 롤백
      setCameras(prevCameras);
      toast({
        title: "장소 수정 실패",
        description: "카메라 장소 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleToggleEnabled = async (cameraId: string, enabled: boolean) => {
    // 낙관적 UI 업데이트 (Option A: enabled=false면 analysisEnabled도 false)
    const prevCameras = [...cameras];
    setCameras(prev => prev.map(cam =>
      cam.id === cameraId
        ? { ...cam, enabled, analysisEnabled: enabled ? cam.analysisEnabled : false }
        : cam
    ));

    try {
      await camerasApi.update(cameraId, { enabled });
      toast({
        title: enabled ? "카메라 ON" : "카메라 OFF",
        description: enabled
          ? "카메라가 활성화되었습니다."
          : "카메라가 비활성화되었습니다.",
      });
    } catch {
      // 실패 시 롤백
      setCameras(prevCameras);
      toast({
        title: "상태 변경 실패",
        description: "카메라 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAnalysis = async (cameraId: string, analysisEnabled: boolean) => {
    // 낙관적 UI 업데이트
    const prevCameras = [...cameras];
    setCameras(prev => prev.map(cam =>
      cam.id === cameraId ? { ...cam, analysisEnabled } : cam
    ));

    try {
      await camerasApi.update(cameraId, { analysisEnabled });
      toast({
        title: analysisEnabled ? "AI 분석 ON" : "AI 분석 OFF",
        description: analysisEnabled
          ? "AI 분석이 활성화되었습니다."
          : "AI 분석이 비활성화되었습니다.",
      });
    } catch {
      // 실패 시 롤백
      setCameras(prevCameras);
      toast({
        title: "상태 변경 실패",
        description: "AI 분석 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="카메라">
        <Card className="soft-shadow h-[calc(100vh-8rem)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                실시간 카메라 모니터링
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                총 {camerasPage?.totalElements ?? 0}대
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)] flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">로딩 중...</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto">
                  <CCTVGrid
                    cameras={displayCameras}
                    onUpdateLocation={handleUpdateLocation}
                    onToggleEnabled={handleToggleEnabled}
                    onToggleAnalysis={handleToggleAnalysis}
                  />
                </div>
                {/* 페이지네이션 - 항상 표시 */}
                <div className="flex items-center justify-center gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    이전
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {Math.max(1, totalPages)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={totalPages <= 1 || page >= totalPages - 1}
                  >
                    다음
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
