import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Event } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 이벤트 타입 한글 변환
export function getEventTypeKorean(type: Event['type']): string {
  const typeMap: Record<Event['type'], string> = {
    assault: '폭행',
    burglary: '절도',
    dump: '투기',
    swoon: '실신',
    vandalism: '파손'
  };
  return typeMap[type] || '알 수 없음';
}

