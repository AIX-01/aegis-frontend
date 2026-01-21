'use client';

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Lock,
  Trash2,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SettingsPageContent() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Profile states
  const [name, setName] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Delete account state
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // Sync user data when loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "이름 오류",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsProfileLoading(true);
    try {
      await authApi.updateProfile({ name: name.trim() });
      toast({
        title: "프로필 수정 완료",
        description: "개인정보가 성공적으로 수정되었습니다.",
      });
    } catch (error) {
      toast({
        title: "프로필 수정 실패",
        description: "프로필 수정에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: "비밀번호 변경 실패",
        description: err.response?.data?.error || "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleteLoading(true);
    try {
      await authApi.deleteAccount();
      toast({
        title: "회원 탈퇴 완료",
        description: "계정이 삭제되었습니다.",
      });
      logout();
    } catch (error) {
      toast({
        title: "회원 탈퇴 실패",
        description: "회원 탈퇴에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="설정">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 개인정보 수정 */}
          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                개인정보 수정
              </CardTitle>
              <CardDescription>
                프로필 정보를 수정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다</p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleUpdateProfile}
                disabled={isProfileLoading}
              >
                {isProfileLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isProfileLoading ? '저장 중...' : '변경사항 저장'}
              </Button>
            </CardContent>
          </Card>

          {/* 비밀번호 변경 */}
          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                비밀번호 변경
              </CardTitle>
              <CardDescription>
                계정 비밀번호를 변경합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">현재 비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">새 비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleUpdatePassword}
                disabled={isPasswordLoading || !currentPassword || !newPassword || !confirmPassword}
              >
                {isPasswordLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                {isPasswordLoading ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </CardContent>
          </Card>

          {/* 회원 탈퇴 */}
          <Card className="soft-shadow border-destructive/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                회원 탈퇴
              </CardTitle>
              <CardDescription>
                계정을 삭제하면 모든 데이터가 삭제되며 복구할 수 없습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    회원 탈퇴
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 계정과 관련된 모든 데이터가
                      영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleteLoading}
                    >
                      {isDeleteLoading ? '처리 중...' : '탈퇴하기'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
