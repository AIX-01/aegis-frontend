'use client';

import { useState, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationsApi, statsApi } from "@/lib/api";
import type { Notification, SystemStatus } from "@/types";
import { NotificationModal } from "@/components/notifications/NotificationModal";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
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
        // timestamp를 Date 객체로 변환
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

  return (
    <>
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="lg:hidden">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* System status */}
            <div className={cn(
              "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
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