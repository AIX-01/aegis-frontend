'use client';

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  User,
  Lock,
  Trash2,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Settings,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authApi, settingsApi } from "@/lib/api";
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
  const [phone, setPhone] = useState('');

  // Emergency contact states
  const [primaryPhone, setPrimaryPhone] = useState('010-1234-5678');
  const [primaryEmail, setPrimaryEmail] = useState('primary@company.com');
  const [secondaryPhone, setSecondaryPhone] = useState('010-9876-5432');
  const [secondaryEmail, setSecondaryEmail] = useState('secondary@company.com');
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);

  // Sync user data when loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);


  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleUpdateProfile = () => {
    toast({
      title: "프로필 수정 완료",
      description: "개인정보가 성공적으로 수정되었습니다.",
    });
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

  const handleDeleteAccount = () => {
    toast({
      title: "회원 탈퇴 완료",
      description: "계정이 삭제되었습니다.",
    });
    logout();
  };

  const handleSaveEmergencyContacts = async () => {
    setIsEmergencyLoading(true);
    try {
      await settingsApi.updateEmergencyContacts({
        primary: { phone: primaryPhone, email: primaryEmail },
        secondary: { phone: secondaryPhone, email: secondaryEmail },
      });
      toast({
        title: "저장 완료",
        description: "비상 연락처가 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "비상 연락처 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsEmergencyLoading(false);
    }
  };

  return (
    <ProtectedRoute>
    <DashboardLayout title="설정">
      <Tabs defaultValue="system" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="system" className="gap-2">
            <Settings className="h-4 w-4" />
            시스템 설정
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            마이페이지
          </TabsTrigger>
        </TabsList>

        {/* System Settings Tab */}
        <TabsContent value="system" className="m-0">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Contact Settings */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  비상 연락처
                </CardTitle>
                <CardDescription>
                  긴급 상황 시 연락할 담당자 정보를 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact1-phone">주 담당자 전화번호</Label>
                    <Input
                      id="contact1-phone"
                      placeholder="010-0000-0000"
                      value={primaryPhone}
                      onChange={(e) => setPrimaryPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact1-email">주 담당자 이메일</Label>
                    <Input
                      id="contact1-email"
                      type="email"
                      placeholder="example@email.com"
                      value={primaryEmail}
                      onChange={(e) => setPrimaryEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact2-phone">보조 담당자 전화번호</Label>
                    <Input
                      id="contact2-phone"
                      placeholder="010-0000-0000"
                      value={secondaryPhone}
                      onChange={(e) => setSecondaryPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact2-email">보조 담당자 이메일</Label>
                    <Input
                      id="contact2-email"
                      type="email"
                      placeholder="example@email.com"
                      value={secondaryEmail}
                      onChange={(e) => setSecondaryEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSaveEmergencyContacts}
                  disabled={isEmergencyLoading}
                >
                  {isEmergencyLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isEmergencyLoading ? '저장 중...' : '설정 저장'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="m-0">
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
                  <div className="grid gap-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleUpdateProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  변경사항 저장
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
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
                <Button className="w-full" onClick={handleUpdatePassword} disabled={isPasswordLoading}>
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
                  계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      회원 탈퇴
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        회원 탈퇴 확인
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        정말로 회원 탈퇴를 하시겠습니까? 모든 데이터가 영구적으로 삭제되며,
                        이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDeleteAccount}
                      >
                        탈퇴하기
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
