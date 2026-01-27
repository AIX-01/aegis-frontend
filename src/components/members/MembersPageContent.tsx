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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Camera as CameraIcon, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Camera Permission Editor Component
const CameraPermissionEditor: React.FC<{
  user: User;
  cameras: CameraType[];
  onSave: (cameraIds: string[]) => void;
}> = ({ user, cameras, onSave }) => {
  const [allCameras, setAllCameras] = useState(user.assignedCameras.includes('all'));
  const [selectedCameras, setSelectedCameras] = useState<string[]>(
    user.assignedCameras.includes('all') ? cameras.map(c => c.id) : user.assignedCameras
  );

  const handleToggleAll = (checked: boolean) => {
    setAllCameras(checked);
    if (checked) {
      setSelectedCameras(cameras.map(c => c.id));
    }
  };

  const handleToggleCamera = (cameraId: string, checked: boolean) => {
    if (checked) {
      setSelectedCameras([...selectedCameras, cameraId]);
    } else {
      setSelectedCameras(selectedCameras.filter(id => id !== cameraId));
      setAllCameras(false);
    }
  };

  const handleSave = () => {
    if (allCameras) {
      onSave(['all']);
    } else {
      onSave(selectedCameras);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <Label htmlFor="all-cameras" className="font-medium">전체 카메라 접근</Label>
        <Switch
          id="all-cameras"
          checked={allCameras}
          onCheckedChange={handleToggleAll}
        />
      </div>

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
              disabled={allCameras}
            />
            <Label htmlFor={`camera-${camera.id}`} className="text-sm cursor-pointer flex-1">
              {camera.alias} <span className="text-muted-foreground">({camera.name})</span>
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
  const { user: currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // React Query로 사용자 목록 조회 (SSE에서 자동 갱신)
  const { data: users = [] } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => usersApi.getAll(),
    enabled: isAdmin,
  });

  // React Query로 카메라 목록 조회
  const { data: cameras = [] } = useQuery({
    queryKey: queryKeys.cameras.all,
    queryFn: () => camerasApi.getAll(),
    enabled: isAdmin,
  });

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [isAdmin, router]);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.cameras.all });
  };

  const handleApprove = async (userId: string) => {
    try {
      await usersApi.approve(userId);
      refreshData();
      toast({
        title: '승인 완료',
        description: '멤버가 승인되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '승인 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await usersApi.delete(userId);
      refreshData();
      toast({
        title: '거절 완료',
        description: '가입 요청이 거절되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: '삭제 불가',
        description: '자신의 계정은 삭제할 수 없습니다.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await usersApi.delete(userId);
      refreshData();
      toast({
        title: '삭제 완료',
        description: '멤버가 삭제되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '삭제 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      await usersApi.update(userId, { role });
      refreshData();
      toast({
        title: '역할 변경',
        description: `역할이 ${role === 'admin' ? '관리자' : '일반 사용자'}로 변경되었습니다.`,
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '역할 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCameras = async (userId: string, cameraIds: string[]) => {
    try {
      await usersApi.update(userId, { assignedCameras: cameraIds });
      refreshData();
      setIsEditDialogOpen(false);
      toast({
        title: '카메라 권한 변경',
        description: '카메라 접근 권한이 업데이트되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '권한 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const pendingUsers = users.filter((u: User) => !u.approved);
  const approvedUsers = users.filter((u: User) => u.approved);


  return (
    <ProtectedRoute requireAdmin>
    <DashboardLayout title="멤버 관리">
      <div className="space-y-6">

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">멤버 목록</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              승인 대기
              {pendingUsers.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            {/* Members Table */}
            <Card>
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
                          <Dialog open={isEditDialogOpen && selectedUser?.id === member.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (open) setSelectedUser(member);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
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

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(member.id)}
                            disabled={member.id === currentUser?.id}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingUsers.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="pt-6 text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">승인 대기 중인 요청이 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingUsers.map((pending) => (
                  <Card key={pending.id} className="glass-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                              {pending.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{pending.name}</p>
                            <p className="text-sm text-muted-foreground">{pending.email}</p>
                            <p className="text-xs text-muted-foreground">
                              신청일: {new Date(pending.createdAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
