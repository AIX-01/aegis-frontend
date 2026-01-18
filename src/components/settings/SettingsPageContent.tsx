'use client';

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  HardDrive,
  Users,
  Database,
  User,
  Lock,
  Trash2,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { statsApi } from "@/lib/api";
import type { StorageInfo } from "@/types";
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

  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  // Profile states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Sync user data when loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Fetch storage info
  useEffect(() => {
    const fetchStorageInfo = async () => {
      try {
        const data = await statsApi.getStorageInfo();
        setStorageInfo(data);
      } catch (error) {
        console.error('Failed to fetch storage info:', error);
      }
    };
    fetchStorageInfo();
  }, []);

  const usedStorage = storageInfo?.usedStorage ?? 0;
  const totalStorage = storageInfo?.totalStorage ?? 1;
  const storagePercentage = (usedStorage / totalStorage) * 100;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdateProfile = () => {
    toast({
      title: "프로필 수정 완료",
      description: "개인정보가 성공적으로 수정되었습니다.",
    });
  };

  const handleUpdatePassword = () => {
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

    toast({
      title: "비밀번호 변경 완료",
      description: "비밀번호가 성공적으로 변경되었습니다.",
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    toast({
      title: "회원 탈퇴 완료",
      description: "계정이 삭제되었습니다.",
    });
    logout();
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
          <div className="max-w-3xl space-y-6">
            {/* AI Settings */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  AI 감지 설정
                </CardTitle>
                <CardDescription>
                  AI의 이상 행동 감지 민감도를 조절합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sensitivity">감지 민감도</Label>
                    <span className="text-sm text-muted-foreground">높음</span>
                  </div>
                  <Slider
                    id="sensitivity"
                    defaultValue={[75]}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-response">자동 대응 활성화</Label>
                    <p className="text-sm text-muted-foreground">
                      위험 감지 시 자동으로 대응 조치를 실행합니다
                    </p>
                  </div>
                  <Switch id="auto-response" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="night-mode">야간 모드 강화</Label>
                    <p className="text-sm text-muted-foreground">
                      야간 시간대 감지 민감도를 자동 상향합니다
                    </p>
                  </div>
                  <Switch id="night-mode" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Storage Settings */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-primary" />
                  저장 공간
                </CardTitle>
                <CardDescription>
                  영상 클립 및 데이터 저장 공간 현황
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">사용 중</span>
                    <span className="text-sm text-muted-foreground">
                      {usedStorage}GB / {totalStorage}GB ({storagePercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={storagePercentage} className="h-3" />
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">영상 클립</span>
                    </div>
                    <span className="text-sm font-medium">180 GB</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">이벤트 로그</span>
                    </div>
                    <span className="text-sm font-medium">45 GB</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">분석 보고서</span>
                    </div>
                    <span className="text-sm font-medium">20 GB</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>자동 정리</Label>
                    <p className="text-sm text-muted-foreground">
                      30일 이상 된 영상을 자동으로 삭제합니다
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

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
                    <Label htmlFor="contact1">주 담당자</Label>
                    <Input id="contact1" placeholder="010-0000-0000" defaultValue="010-1234-5678" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact2">보조 담당자</Label>
                    <Input id="contact2" placeholder="010-0000-0000" defaultValue="010-9876-5432" />
                  </div>
                </div>
                <Button className="w-full">설정 저장</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="m-0">
          <div className="max-w-3xl space-y-6">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
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
                <Button className="w-full" onClick={handleUpdatePassword}>
                  <Lock className="h-4 w-4 mr-2" />
                  비밀번호 변경
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
