'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Notification } from "@/types";
import { NotificationTypeBadge, NotificationIcon } from "@/components/common/EventBadges";
import { notificationsApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

interface NotificationModalProps {
  notifications: Notification[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function NotificationModal({ 
  notifications, 
  open, 
  onOpenChange, 
}: NotificationModalProps) {
  const queryClient = useQueryClient();
  const notificationCount = notifications.length;

  // 모달이 닫힐 때 전체 삭제
  const handleOpenChange = async (isOpen: boolean) => {
    if (!isOpen && notificationCount > 0) {
      try {
        await notificationsApi.deleteAll();
        await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      } catch {
        // 전체 삭제 실패 무시
      }
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              알림
              {notificationCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                  {notificationCount}
                </Badge>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">새로운 알림이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <NotificationIcon type={notification.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <NotificationTypeBadge type={notification.type} size="sm" />
                        </div>
                        <p className="text-sm font-medium mt-1">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ko })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}