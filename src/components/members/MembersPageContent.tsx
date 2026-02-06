'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi, camerasApi } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import type { User, ManagedCamera as CameraType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Camera as CameraIcon, CheckCircle, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 카메라 권한 편집 컴포넌트
const CameraPermissionEditor: React.FC<{
  user: User;
  cameras: CameraType[];
  onSave: (cameraIds: string[]) => void;
}> = ({ user, cameras, onSave }) => {
  const [selectedCameras, setSelectedCameras] = useState<string[]>(user.assignedCameras);

  const handleToggleCamera = (cameraId: string, checked: boolean) => {
    setSelectedCameras(prev =>
      checked ? [...prev, cameraId] : prev.filter(id => id !== cameraId)
    );
  };

  const handleSave = () => onSave(selectedCameras);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className="flex items-center gap-2 p-2 rounded-lg border bg-card"
          >
            <Switch
              id={`camera-${camera.id}`}
              checked={selectedCameras.includes(camera.id)}
              onCheckedChange={(checked) => handleToggleCamera(camera.id, checked)}
            />
            <Label htmlFor={`camera-${camera.id}`} className="text-sm cursor-pointer flex-1">
              {camera.location} <span className="text-muted-foreground">({camera.name})</span>
            </Label>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button onClick={handleSave}>저장</Button>
      </DialogFooter>
    </div>
  );
};

export function MembersPageContent() {
  const router = useRouter();
  const { user: currentUser, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // 각 탭별 페이지 상태
  const [approvedPage, setApprovedPage] = useState(0);
  const [pendingPage, setPendingPage] = useState(0);
  const pageSize = 20;

  // 스크롤 컨테이너 참조
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // 페이지 변경 핸들러 (스크롤 상단 이동)
  const handleApprovedPageChange = (newPage: number) => {
    setApprovedPage(newPage);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePendingPageChange = (newPage: number) => {
    setPendingPage(newPage);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 승인된 사용자 목록 조회 (최신 가입순)
  const { data: approvedUsersPage } = useQuery({
    queryKey: [...queryKeys.users.all, 'approved', approvedPage, pageSize],
    queryFn: () => usersApi.getApproved(approvedPage, pageSize),
    enabled: isAdmin,
  });

  // 미승인 사용자 목록 조회 (최신 가입순)
  const { data: pendingUsersPage } = useQuery({
    queryKey: [...queryKeys.users.all, 'pending', pendingPage, pageSize],
    queryFn: () => usersApi.getPending(pendingPage, pageSize),
    enabled: isAdmin,
  });

  const approvedUsers = approvedUsersPage?.content ?? [];
  const approvedTotalPages = approvedUsersPage?.totalPages ?? 0;

  const pendingUsers = pendingUsersPage?.content ?? [];
  const pendingTotalPages = pendingUsersPage?.totalPages ?? 0;

  // SSE 업데이트로 totalPages가 변경되면 현재 페이지 범위 조정
  useEffect(() => {
    if (approvedTotalPages > 0 && approvedPage >= approvedTotalPages) {
      setApprovedPage(approvedTotalPages - 1);
    }
  }, [approvedTotalPages, approvedPage]);

  useEffect(() => {
    if (pendingTotalPages > 0 && pendingPage >= pendingTotalPages) {
      setPendingPage(pendingTotalPages - 1);
    }
  }, [pendingTotalPages, pendingPage]);

  // React Query로 카메라 전체 목록 조회 (카메라 할당용)
  const { data: cameras = [] } = useQuery({
    queryKey: queryKeys.cameras.managed,
    queryFn: () => camerasApi.getAllList(),
    enabled: isAdmin,
  });


  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [isAdmin, isLoading, router]);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  };

  // 공통 API 호출 래퍼
  const handleApiCall = async (
    apiCall: () => Promise<unknown>,
    successTitle: string,
    successDescription: string,
    errorDescription: string
  ) => {
    try {
      await apiCall();
      await refreshData();
      toast({ title: successTitle, description: successDescription });
    } catch {
      toast({ title: '오류', description: errorDescription, variant: 'destructive' });
    }
  };

  const handleApprove = (userId: string) =>
    handleApiCall(
      () => usersApi.approve(userId),
      '승인 완료', '멤버가 승인되었습니다.', '승인 처리 중 오류가 발생했습니다.'
    );

  const handleReject = (userId: string) =>
    handleApiCall(
      () => usersApi.delete(userId),
      '거절 완료', '가입 요청이 거절되었습니다.', '처리 중 오류가 발생했습니다.'
    );

  const handleDelete = (userId: string) =>
    handleApiCall(
      () => usersApi.delete(userId),
      '삭제 완료', '멤버가 삭제되었습니다.', '삭제 처리 중 오류가 발생했습니다.'
    );

  const handleUpdateRole = (userId: string, role: 'user' | 'admin') =>
    handleApiCall(
      () => usersApi.update(userId, { role }),
      '역할 변경', `역할이 ${role === 'admin' ? '관리자' : '일반 사용자'}로 변경되었습니다.`, '역할 변경 중 오류가 발생했습니다.'
    );

  const handleUpdateCameras = async (userId: string, cameraIds: string[]) => {
    await handleApiCall(
      () => usersApi.update(userId, { assignedCameras: cameraIds }),
      '카메라 권한 변경', '카메라 접근 권한이 업데이트되었습니다.', '권한 변경 중 오류가 발생했습니다.'
    );
    setIsEditDialogOpen(false);
  };



  return (
    <ProtectedRoute requireAdmin>
    <DashboardLayout title="멤버 관리">
      <Card className="soft-shadow h-[calc(100vh-6.5rem)] flex flex-col">
        <Tabs defaultValue="members" className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                멤버 관리
              </CardTitle>
              <TabsList>
                <TabsTrigger value="members">멤버 목록</TabsTrigger>
                <TabsTrigger value="pending" className="relative">
                  승인 대기
                  {(pendingUsersPage?.totalElements ?? 0) > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {pendingUsersPage?.totalElements}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col">
            <TabsContent value="members" className="flex-1 m-0 data-[state=active]:flex flex-col overflow-hidden">
              {/* Members Table */}
              <div ref={scrollContainerRef} className="flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>카메라 권한</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedUsers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Select
                          value={member.role}
                          onValueChange={(value: 'user' | 'admin') => handleUpdateRole(member.id, value)}
                          disabled={member.id === currentUser?.id}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">일반 사용자</SelectItem>
                            <SelectItem value="admin">관리자</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {member.assignedCameras.includes('all')
                            ? '전체'
                            : `${member.assignedCameras.length}개`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog open={isEditDialogOpen && editingUserId === member.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (open) setEditingUserId(member.id);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={member.role === 'admin'}
                                title={member.role === 'admin' ? '관리자는 전체 카메라 접근 권한을 가집니다' : '카메라 권한 설정'}
                              >
                                <CameraIcon className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>카메라 권한 설정</DialogTitle>
                                <DialogDescription>
                                  {member.name}님에게 접근 가능한 카메라를 설정합니다
                                </DialogDescription>
                              </DialogHeader>
                              <CameraPermissionEditor
                                user={member}
                                cameras={cameras}
                                onSave={(cameraIds) => handleUpdateCameras(member.id, cameraIds)}
                              />
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={member.id === currentUser?.id}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>멤버 삭제</DialogTitle>
                                <DialogDescription>
                                  {member.name}님을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="destructive" onClick={() => handleDelete(member.id)}>
                                  삭제
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </div>
              {/* 승인된 사용자 페이지네이션 */}
              <div className="flex justify-center items-center gap-4 pt-4 border-t flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleApprovedPageChange(Math.max(0, approvedPage - 1))}
                  className="h-8 w-8"
                  disabled={approvedPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                  {approvedPage + 1} / {Math.max(1, approvedTotalPages)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleApprovedPageChange(Math.min(approvedTotalPages - 1, approvedPage + 1))}
                  className="h-8 w-8"
                  disabled={approvedTotalPages <= 1 || approvedPage >= approvedTotalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="flex-1 m-0 data-[state=active]:flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto flex flex-col">
                {pendingUsers.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">승인 대기 중인 요청이 없습니다</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>신청일</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((pending) => (
                        <TableRow key={pending.id}>
                          <TableCell className="font-medium">{pending.name}</TableCell>
                          <TableCell>{pending.email}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(pending.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(pending.id)}
                              >
                                거절
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(pending.id)}
                              >
                                승인
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              {/* 미승인 사용자 페이지네이션 */}
              <div className="flex justify-center items-center gap-4 pt-4 border-t flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePendingPageChange(Math.max(0, pendingPage - 1))}
                  className="h-8 w-8"
                  disabled={pendingPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                  {pendingPage + 1} / {Math.max(1, pendingTotalPages)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePendingPageChange(Math.min(pendingTotalPages - 1, pendingPage + 1))}
                  className="h-8 w-8"
                  disabled={pendingTotalPages <= 1 || pendingPage >= pendingTotalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
