'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";
import type { Notification } from "@/types";
import { cn } from "@/lib/utils";
import { NotificationTypeBadge, NotificationIcon } from "@/components/common/EventBadges";

interface NotificationModalProps {
  notifications: Notification[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead: (id: string) => void;
}


export function NotificationModal({ 
  notifications, 
  open, 
  onOpenChange, 
  onMarkAsRead
}: NotificationModalProps) {
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleViewAll = () => {
    onOpenChange(false);
    router.push('/events');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              알림
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                  {unreadCount}
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
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!notification.read) {
                        onMarkAsRead(notification.id);
                      }
                    }}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      notification.read 
                        ? "bg-transparent hover:bg-muted/50" 
                        : "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <NotificationIcon type={notification.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <NotificationTypeBadge type={notification.type} size="sm" />
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
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

        <div className="p-3 border-t">
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            onClick={handleViewAll}
          >
            알림 더보기
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}