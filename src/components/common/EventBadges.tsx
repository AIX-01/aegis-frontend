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

interface CameraBadgeProps {
  location: string;
  name: string;
  size?: 'sm' | 'default';
}

interface NotificationTypeBadgeProps {
  type: Notification['type'];
  size?: 'sm' | 'default';
}


// 이벤트 타입 배지 (흰색 배경, 검은 글씨)
export function EventTypeBadge({ type, size = 'default' }: EventTypeBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs' : '';

  const typeLabel = {
    assault: '폭행',
    burglary: '절도',
    dump: '투기',
    swoon: '실신',
    vandalism: '파손'
  }[type] || '알 수 없음';

  return <Badge className={`bg-white text-black border border-border ${sizeClass}`}>{typeLabel}</Badge>;
}

// 카메라 배지 (흰색 배경, 검은 글씨, location(name) 형식)
export function CameraBadge({ location, name, size = 'default' }: CameraBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs' : '';

  return (
    <Badge className={`bg-white text-black border border-border ${sizeClass}`}>
      {location}({name})
    </Badge>
  );
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

// 이벤트 위험도 아이콘
export function EventIcon({ risk, className }: { risk: Event['risk']; className?: string }) {
  const baseClass = className || 'h-4 w-4';

  switch (risk) {
    case 'abnormal':
      return <AlertCircle className={`${baseClass} text-destructive`} />;
    case 'suspicious':
      return <AlertTriangle className={`${baseClass} text-warning`} />;
    default:
      return <AlertCircle className={`${baseClass} text-muted-foreground`} />;
  }
}

