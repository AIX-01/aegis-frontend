'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { manualsApi } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { Manual } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ManualCard } from './ManualCard';
import { ManualEditModal } from './ManualEditModal';

export function ManualsPageContent() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<Manual | null>(null);
  const pageSize = 20;

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 매뉴얼 목록 조회
  const { data: manualsPage, isLoading: isManualsLoading } = useQuery({
    queryKey: [...queryKeys.manuals.all, page, pageSize],
    queryFn: () => manualsApi.getAll(page, pageSize),
    enabled: isAdmin,
  });

  const manuals = manualsPage?.content ?? [];
  const totalPages = manualsPage?.totalPages ?? 0;

  // 페이지 범위 조정
  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [totalPages, page]);

  // 관리자 아니면 리다이렉트
  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isLoading, router]);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.manuals.all });
  };

  // 매뉴얼 enabled 토글
  const handleToggleEnabled = async (manual: Manual) => {
    try {
      await manualsApi.update(manual.id, { enabled: !manual.enabled });
      toast({
        title: manual.enabled ? '매뉴얼 비활성화' : '매뉴얼 활성화',
        description: `${manual.name}이(가) ${manual.enabled ? '비활성화' : '활성화'}되었습니다.`,
      });
      refreshData();
    } catch {
      toast({
        title: '오류',
        description: '매뉴얼 상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 매뉴얼 삭제
  const handleDelete = async (manualId: string) => {
    try {
      await manualsApi.delete(manualId);
      toast({
        title: '삭제 완료',
        description: '매뉴얼이 삭제되었습니다.',
      });
      setEditingManual(null);
      refreshData();
    } catch {
      toast({
        title: '오류',
        description: '매뉴얼 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold">매뉴얼 관리</h1>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              새 매뉴얼
            </Button>
          </div>

          {/* 목록 */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto space-y-3"
          >
            {isManualsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : manuals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">등록된 매뉴얼이 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              manuals.map((manual) => (
                <ManualCard
                  key={manual.id}
                  manual={manual}
                  onToggleEnabled={() => handleToggleEnabled(manual)}
                  onClick={() => setEditingManual(manual)}
                />
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 생성 모달 */}
        <ManualEditModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={refreshData}
        />

        {/* 수정 모달 */}
        <ManualEditModal
          open={!!editingManual}
          onOpenChange={(open) => !open && setEditingManual(null)}
          manual={editingManual || undefined}
          onSuccess={refreshData}
          onDelete={handleDelete}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

