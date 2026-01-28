'use client';

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Monitor, ClipboardList, BarChart3, Users, Settings, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/types";
import { NotificationModal } from "@/components/notifications/NotificationModal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

interface HeaderProps {
  // 향후 확장을 위해 인터페이스 유지
}

const navItems = [
  { title: "카메라", url: "/", icon: Monitor },
  { title: "이벤트", url: "/events", icon: ClipboardList },
  { title: "통계", url: "/statistics", icon: BarChart3 },
];

const adminNavItems = [
  { title: "멤버 관리", url: "/members", icon: Users },
];

export function Header(_props: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // 앱 로드 시 모든 페이지 prefetch (탭 전환 속도 개선)
  useEffect(() => {
    router.prefetch('/events');
    router.prefetch('/statistics');
    router.prefetch('/members');
    router.prefetch('/settings');
  }, [router]);

  // React Query로 알림 목록 조회 (SSE에서 자동 갱신)
  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => notificationsApi.getAll(),
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };


  const isActive = (url: string) => {
    if (url === '/') return pathname === '/';
    return pathname.startsWith(url);
  };

  return (
    <>
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-semibold text-base hidden sm:block">AEGIS</span>
            </button>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.url}
                  variant={isActive(item.url) ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive(item.url) && "bg-secondary"
                  )}
                  onClick={() => router.push(item.url)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.title}</span>
                </Button>
              ))}
              {isAdmin && adminNavItems.map((item) => (
                <Button
                  key={item.url}
                  variant={isActive(item.url) ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive(item.url) && "bg-secondary"
                  )}
                  onClick={() => router.push(item.url)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.title}</span>
                </Button>
              ))}
            </nav>
          </div>

          {/* Right: Profile + Actions */}
          <div className="flex items-center gap-2">
            {/* Profile */}
            <div className="flex items-center gap-2 pr-3 border-r border-border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.name?.charAt(0) || '?'}
                </span>
              </div>
              <span className="text-sm font-medium hidden md:block">{user?.name || '사용자'}</span>
            </div>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setNotificationModalOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-0.5 -right-0.5 h-4 min-w-4 text-[10px] px-1"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <NotificationModal 
        notifications={notifications}
        open={notificationModalOpen}
        onOpenChange={setNotificationModalOpen}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
}