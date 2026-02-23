'use client';

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CCTVGrid } from "@/components/dashboard/CCTVGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor } from "lucide-react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useStreams } from "@/hooks/useMonitoring";
import { useToast } from "@/hooks/use-toast";
import { camerasApi } from "@/lib/api";
import type { ManagedCamera } from "@/types";

const CAMERAS_PER_PAGE = 6;
const GRID_PAGE_STORAGE_KEY = 'aegis_cctv_grid_page';

export function DashboardContent() {
  const { toast } = useToast();

  // 페이지 상태 (localStorage에서 복원)
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(GRID_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // 서버 페이지네이션으로 카메라 조회
  const { data: cameraPage, isLoading } = useStreams(currentPage, CAMERAS_PER_PAGE);

  // 로컬 상태 (낙관적 UI 업데이트용)
  const [cameras, setCameras] = useState<ManagedCamera[]>([]);

  // 이전 데이터 참조 (불필요한 업데이트 방지)
  const prevFetchedRef = useRef<string>('');

  // 서버 데이터와 동기화 (SSE에서 캐시 무효화 시 자동 갱신)
  useEffect(() => {
    if (!cameraPage?.content) return;

    const currentJson = JSON.stringify(cameraPage.content);
    if (prevFetchedRef.current !== currentJson) {
      prevFetchedRef.current = currentJson;
      setCameras(cameraPage.content);
    }
  }, [cameraPage]);

  // 페이지 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(GRID_PAGE_STORAGE_KEY, currentPage.toString());
  }, [currentPage]);

  // 페이지 범위 초과 시 조정
  useEffect(() => {
    if (cameraPage && currentPage >= cameraPage.totalPages && cameraPage.totalPages > 0) {
      setCurrentPage(cameraPage.totalPages - 1);
    }
  }, [cameraPage, currentPage]);

  const displayCameras = cameras.length > 0 ? cameras : (cameraPage?.content ?? []);
  const totalPages = cameraPage?.totalPages ?? 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
        variant: "success",
      });
    } catch {
      // 실패 시 롤백
      setCameras(prevCameras);
      toast({
        title: "장소 수정 실패",
        description: "카메라 장소 변경에 실패했습니다.",
        variant: "alert",
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
        variant: "success",
      });
    } catch {
      // 실패 시 롤백
      setCameras(prevCameras);
      toast({
        title: "상태 변경 실패",
        description: "카메라 상태 변경에 실패했습니다.",
        variant: "alert",
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
        variant: "success",
      });
    } catch {
      // 실패 시 롤백
      setCameras(prevCameras);
      toast({
        title: "상태 변경 실패",
        description: "AI 분석 상태 변경에 실패했습니다.",
        variant: "alert",
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="카메라">
        <Card className="soft-shadow h-[calc(100vh-6.5rem)] flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              실시간 카메라 모니터링
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">로딩 중...</p>
              </div>
            ) : (
              <CCTVGrid
                cameras={displayCameras}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onUpdateLocation={handleUpdateLocation}
                onToggleEnabled={handleToggleEnabled}
                onToggleAnalysis={handleToggleAnalysis}
              />
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
