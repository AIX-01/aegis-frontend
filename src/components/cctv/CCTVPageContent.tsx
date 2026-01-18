'use client';

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Plus, Pencil, Trash2, MapPin, Power, PowerOff, Search, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { camerasApi } from "@/lib/api";
import type { Camera as CameraType, ManagedCamera } from "@/types";
import { cn } from "@/lib/utils";

export function CCTVPageContent() {
  const [cameras, setCameras] = useState<ManagedCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<ManagedCamera | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ipAddress: '',
    resolution: '1920x1080',
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const data = await camerasApi.getAll();
        const managedCameras: ManagedCamera[] = data.map((cam: CameraType, index: number) => ({
          ...cam,
          ipAddress: `192.168.1.${100 + index}`,
          resolution: '1920x1080',
          active: cam.status !== 'offline',
        }));
        setCameras(managedCameras);
      } catch (error) {
        console.error('Failed to fetch cameras:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  const alertCount = cameras.filter(c => c.status === 'alert').length;
  const warningCount = cameras.filter(c => c.status === 'warning').length;
  const activeCameras = cameras.filter(cam => cam.active).length;

  const filteredCameras = cameras.filter(cam =>
    cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cam.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    const newCamera: ManagedCamera = {
      id: `cam-${Date.now()}`,
      name: formData.name,
      location: formData.location,
      status: 'normal',
      ipAddress: formData.ipAddress,
      resolution: formData.resolution,
      active: true,
    };
    setCameras([...cameras, newCamera]);
    setIsAddDialogOpen(false);
    setFormData({ name: '', location: '', ipAddress: '', resolution: '1920x1080' });
    toast({
      title: "CCTV 등록 완료",
      description: `${newCamera.name}이(가) 등록되었습니다.`,
    });
  };

  const handleEdit = () => {
    if (!selectedCamera) return;
    setCameras(cameras.map(cam =>
      cam.id === selectedCamera.id
        ? {
            ...cam,
            name: formData.name,
            location: formData.location,
            ipAddress: formData.ipAddress,
            resolution: formData.resolution,
          }
        : cam
    ));
    setIsEditDialogOpen(false);
    setSelectedCamera(null);
    toast({
      title: "CCTV 수정 완료",
      description: "카메라 정보가 수정되었습니다.",
    });
  };

  const handleDelete = () => {
    if (!selectedCamera) return;
    setCameras(cameras.filter(cam => cam.id !== selectedCamera.id));
    setIsDeleteDialogOpen(false);
    setSelectedCamera(null);
    toast({
      title: "CCTV 삭제 완료",
      description: "카메라가 삭제되었습니다.",
    });
  };

  const handleToggleActive = (cameraId: string) => {
    setCameras(cameras.map(cam =>
      cam.id === cameraId
        ? { ...cam, active: !cam.active, status: !cam.active ? 'normal' : 'offline' }
        : cam
    ));
  };

  const openEditDialog = (camera: ManagedCamera) => {
    setSelectedCamera(camera);
    setFormData({
      name: camera.name,
      location: camera.location,
      ipAddress: camera.ipAddress,
      resolution: camera.resolution,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (camera: ManagedCamera) => {
    setSelectedCamera(camera);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (camera: ManagedCamera) => {
    if (camera.status === 'alert') {
      return <Badge variant="destructive">경고</Badge>;
    } else if (camera.status === 'warning') {
      return <Badge className="bg-warning text-warning-foreground">주의</Badge>;
    } else if (camera.active) {
      return <Badge className="bg-success text-success-foreground">정상</Badge>;
    } else {
      return <Badge variant="secondary">오프라인</Badge>;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="CCTV">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="CCTV">
        <div className="space-y-6">
          {/* Stats and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm py-1 px-3">
                총 {cameras.length}대
              </Badge>
              <Badge className="bg-success/10 text-success border-success/20 text-sm py-1 px-3">
                <Power className="h-3 w-3 mr-1" />
                활성 {activeCameras}대
              </Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">
                <PowerOff className="h-3 w-3 mr-1" />
                비활성 {cameras.length - activeCameras}대
              </Badge>
              {alertCount > 0 && (
                <Badge variant="destructive" className="text-sm py-1 px-3">
                  {alertCount}건 위험
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge className="bg-warning text-warning-foreground text-sm py-1 px-3">
                  {warningCount}건 의심
                </Badge>
              )}
            </div>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              카메라 추가
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="카메라 이름 또는 위치로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Camera Grid */}
          {filteredCameras.length === 0 ? (
            <Card className="soft-shadow">
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{searchQuery ? '검색 결과가 없습니다.' : '등록된 카메라가 없습니다.'}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCameras.map((camera) => (
                <Card
                  key={camera.id}
                  className={cn(
                    "soft-shadow overflow-hidden transition-all",
                    camera.status === 'alert' && "ring-2 ring-destructive",
                    camera.status === 'warning' && "ring-2 ring-warning"
                  )}
                >
                  {/* Thumbnail Area */}
                  <div className={cn(
                    "relative h-40 bg-muted flex items-center justify-center",
                    !camera.active && "opacity-50"
                  )}>
                    {camera.active ? (
                      <>
                        <Video className="h-12 w-12 text-muted-foreground/50" />
                        <span className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                          {camera.resolution}
                        </span>
                        <span className="absolute top-2 right-2">
                          {getStatusBadge(camera)}
                        </span>
                        {/* Live indicator */}
                        <span className="absolute top-2 left-2 flex items-center gap-1 text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded">
                          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                          LIVE
                        </span>
                      </>
                    ) : (
                      <>
                        <PowerOff className="h-12 w-12 text-muted-foreground/30" />
                        <span className="absolute top-2 right-2">
                          {getStatusBadge(camera)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Info Area */}
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{camera.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {camera.location}
                        </div>
                      </div>
                      <Switch
                        checked={camera.active}
                        onCheckedChange={() => handleToggleActive(camera.id)}
                      />
                    </div>

                    <div className="text-xs text-muted-foreground font-mono">
                      IP: {camera.ipAddress}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(camera)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(camera)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>카메라 추가</DialogTitle>
              <DialogDescription>
                새로운 CCTV 카메라를 등록합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-name">카메라 이름</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="CAM-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-location">위치</Label>
                <Input
                  id="add-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="1층 로비"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-ip">IP 주소</Label>
                <Input
                  id="add-ip"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-resolution">해상도</Label>
                <Select
                  value={formData.resolution}
                  onValueChange={(value) => setFormData({ ...formData, resolution: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                    <SelectItem value="2560x1440">2560x1440 (2K)</SelectItem>
                    <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                    <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAdd} disabled={!formData.name || !formData.location}>
                추가
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>카메라 수정</DialogTitle>
              <DialogDescription>
                카메라 정보를 수정합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">카메라 이름</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">위치</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-ip">IP 주소</Label>
                <Input
                  id="edit-ip"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-resolution">해상도</Label>
                <Select
                  value={formData.resolution}
                  onValueChange={(value) => setFormData({ ...formData, resolution: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                    <SelectItem value="2560x1440">2560x1440 (2K)</SelectItem>
                    <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                    <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleEdit}>
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>카메라 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedCamera?.name}을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
