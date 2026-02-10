'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { actionsApi } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { Action } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ActionCard } from './ActionCard';
import { ActionEditModal } from './ActionEditModal';

export function ActionsPageContent() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const pageSize = 20;

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 액션 목록 조회
  const { data: actionsPage, isLoading: isActionsLoading } = useQuery({
    queryKey: [...queryKeys.actions.all, page, pageSize],
    queryFn: () => actionsApi.getAll(page, pageSize),
    enabled: isAdmin,
  });

  const actions = actionsPage?.content ?? [];
  const totalPages = actionsPage?.totalPages ?? 0;

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
    queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });
  };

  // 액션 enabled 토글
  const handleToggleEnabled = async (action: Action) => {
    try {
      await actionsApi.update(action.id, { enabled: !action.enabled });
      toast({
        title: action.enabled ? '액션 비활성화' : '액션 활성화',
        description: `${action.name}이(가) ${action.enabled ? '비활성화' : '활성화'}되었습니다.`,
      });
      refreshData();
    } catch {
      toast({
        title: '오류',
        description: '액션 상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 액션 삭제
  const handleDelete = async (actionId: string) => {
    try {
      await actionsApi.delete(actionId);
      toast({
        title: '삭제 완료',
        description: '액션이 삭제되었습니다.',
      });
      setEditingAction(null);
      refreshData();
    } catch {
      toast({
        title: '오류',
        description: '액션 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="액션 관리">
        <Card className="soft-shadow h-[calc(100vh-6.5rem)] flex flex-col">
          {/* 헤더 */}
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                액션 목록
              </CardTitle>
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 액션
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col">
            {/* 목록 */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-auto space-y-3"
            >
              {isActionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : actions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">등록된 액션이 없습니다.</p>
                </div>
              ) : (
                actions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onToggleEnabled={() => handleToggleEnabled(action)}
                    onClick={() => setEditingAction(action)}
                  />
                ))
              )}
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center gap-4 pt-4 border-t flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                className="h-8 w-8"
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                className="h-8 w-8"
                disabled={totalPages <= 1 || page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 생성 모달 */}
        <ActionEditModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={refreshData}
        />

        {/* 수정 모달 */}
        <ActionEditModal
          open={!!editingAction}
          onOpenChange={(open) => !open && setEditingAction(null)}
          action={editingAction || undefined}
          onSuccess={refreshData}
          onDelete={handleDelete}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

