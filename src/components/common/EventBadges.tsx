'use client';

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Event, Notification } from "@/types";

interface EventTypeBadgeProps {
  type: Event['type'];
  size?: 'sm' | 'default';
}

interface EventStatusBadgeProps {
  status: Event['status'];
  size?: 'sm' | 'default';
}

interface NotificationTypeBadgeProps {
  type: Notification['type'];
  size?: 'sm' | 'default';
}

// 이벤트 타입 배지
export function EventTypeBadge({ type, size = 'default' }: EventTypeBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs' : '';

  switch (type) {
    case 'assault':
      return <Badge variant="destructive" className={sizeClass}>폭행</Badge>;
    case 'burglary':
      return <Badge variant="destructive" className={sizeClass}>절도</Badge>;
    case 'dump':
      return <Badge className={`bg-warning text-warning-foreground ${sizeClass}`}>투기</Badge>;
    case 'swoon':
      return <Badge className={`bg-warning text-warning-foreground ${sizeClass}`}>실신</Badge>;
    case 'vandalism':
      return <Badge className={`bg-warning text-warning-foreground ${sizeClass}`}>파손</Badge>;
    default:
      return <Badge className={`bg-muted text-muted-foreground ${sizeClass}`}>알 수 없음</Badge>;
  }
}

// 이벤트 상태 배지
export function EventStatusBadge({ status, size = 'default' }: EventStatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs' : '';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  switch (status) {
    case 'processing':
      return (
        <Badge variant="secondary" className={`bg-primary/10 text-primary ${sizeClass}`}>
          분석중
        </Badge>
      );
    case 'analyzed':
      return (
        <Badge className={`bg-success/10 text-success gap-1 ${sizeClass}`}>
          <CheckCircle2 className={iconSize} />
          분석완료
        </Badge>
      );
  }
}

// 알림 타입 배지
export function NotificationTypeBadge({ type, size = 'default' }: NotificationTypeBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs' : '';

  switch (type) {
    case 'alert':
      return <Badge variant="destructive" className={sizeClass}>긴급</Badge>;
    case 'warning':
      return <Badge className={`bg-warning text-warning-foreground ${sizeClass}`}>경고</Badge>;
    case 'success':
      return <Badge className={`bg-success/10 text-success ${sizeClass}`}>완료</Badge>;
    default:
      return <Badge variant="secondary" className={sizeClass}>정보</Badge>;
  }
}

// 알림 타입 아이콘
export function NotificationIcon({ type, className }: { type: Notification['type']; className?: string }) {
  const baseClass = className || 'h-5 w-5';

  switch (type) {
    case 'alert':
      return <AlertCircle className={`${baseClass} text-destructive`} />;
    case 'warning':
      return <AlertTriangle className={`${baseClass} text-warning`} />;
    case 'success':
      return <CheckCircle2 className={`${baseClass} text-success`} />;
    default:
      return <Info className={`${baseClass} text-muted-foreground`} />;
  }
}

// 이벤트 타입 아이콘
export function EventIcon({ type, className }: { type: Event['type']; className?: string }) {
  const baseClass = className || 'h-4 w-4';

  switch (type) {
    case 'assault':
    case 'burglary':
      return <AlertCircle className={`${baseClass} text-destructive`} />;
    case 'dump':
    case 'swoon':
    case 'vandalism':
      return <AlertTriangle className={`${baseClass} text-warning`} />;
    default:
      return <CheckCircle2 className={`${baseClass} text-success`} />;
  }
}

