'use client';

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Monitor, ClipboardList, BarChart3, Users, Settings, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationsApi, statsApi } from "@/lib/api";
import type { Notification, SystemStatus } from "@/types";
import { NotificationModal } from "@/components/notifications/NotificationModal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  title?: string;
}

const navItems = [
  { title: "카메라", url: "/", icon: Monitor },
  { title: "이벤트", url: "/events", icon: ClipboardList },
  { title: "통계", url: "/statistics", icon: BarChart3 },
];

const adminNavItems = [
  { title: "멤버 관리", url: "/members", icon: Users },
];

export function Header({ title: _title }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifData, statusData] = await Promise.all([
          notificationsApi.getAll(),
          statsApi.getSystemStatus(),
        ]);
        const parsedData = notifData.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsedData);
        setSystemStatus(statusData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'normal': return 'bg-success/10 text-success';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'error': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusDotColor = (status?: string) => {
    switch (status) {
      case 'normal': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted-foreground';
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

          {/* Right: Status + Notifications + Profile */}
          <div className="flex items-center gap-3">
            {/* System status */}
            <div className={cn(
              "hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
              getStatusColor(systemStatus?.status)
            )}>
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  getStatusDotColor(systemStatus?.status)
                )}></span>
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  getStatusDotColor(systemStatus?.status)
                )}></span>
              </span>
              <span className="font-medium">{systemStatus?.message ?? '상태 확인 중...'}</span>
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

            {/* Profile */}
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.name?.charAt(0) || '?'}
                </span>
              </div>
              <span className="text-sm font-medium hidden md:block">{user?.name || '사용자'}</span>
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