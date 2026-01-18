// Mock data for development API routes (stored in memory)
import type { Camera, Event, AIResponse, Notification, User, DailyStat, EventTypeStat, MonthlyEventData } from '@/types';

// Mock Users (메모리 저장)
export const mockUsers: User[] = [
  {
    id: 'admin-001',
    email: 'admin@safety.com',
    name: 'Super Admin',
    role: 'admin',
    assignedCameras: ['all'],
    createdAt: new Date().toISOString(),
    approved: true,
  },
];

// Mock Passwords (메모리 저장)
export const mockPasswords: Record<string, string> = {
  'admin@safety.com': 'admin123',
};

// Mock Refresh Tokens (메모리 저장)
export const mockRefreshTokens: Map<string, string> = new Map(); // token -> userId

// Cameras
export const mockCameras: Camera[] = [
  { id: 'cam-1', name: 'CAM-01', location: '1층 로비', status: 'normal' },
  { id: 'cam-2', name: 'CAM-02', location: '1층 출입구', status: 'alert', alertType: 'assault' },
  { id: 'cam-3', name: 'CAM-03', location: '2층 복도', status: 'normal' },
  { id: 'cam-4', name: 'CAM-04', location: '주차장 A구역', status: 'warning', alertType: 'suspicious' },
  { id: 'cam-5', name: 'CAM-05', location: '주차장 B구역', status: 'normal' },
  { id: 'cam-6', name: 'CAM-06', location: '3층 사무실', status: 'normal' },
  { id: 'cam-7', name: 'CAM-07', location: '옥상 출입구', status: 'normal' },
  { id: 'cam-8', name: 'CAM-08', location: '지하 창고', status: 'alert', alertType: 'theft' },
  { id: 'cam-9', name: 'CAM-09', location: '비상계단', status: 'normal' },
];

// Events
export const mockEvents: Event[] = [
  {
    id: 'evt-1',
    cameraId: 'cam-2',
    cameraName: '1층 출입구',
    type: 'assault',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    status: 'processing',
    description: '물리적 충돌 감지됨',
    aiAction: '경비실 호출 및 영상 녹화 시작',
    clipUrl: '/clips/evt-1.mp4',
    summary: '2명의 인물 간 물리적 충돌이 감지되었습니다. 오후 2시 35분경 1층 출입구에서 언쟁 후 몸싸움으로 발전한 것으로 분석됩니다.',
    analysisReport: `## 상황 분석 보고서

### 기본 정보
- **발생 시각**: ${new Date(Date.now() - 2 * 60 * 1000).toLocaleString('ko-KR')}
- **위치**: 1층 출입구 (CAM-02)
- **감지 유형**: 폭행/물리적 충돌

### 상황 요약
1층 출입구에서 2명의 성인 남성 간 물리적 충돌이 발생하였습니다. 초기 언쟁에서 시작하여 신체 접촉으로 이어진 것으로 파악됩니다.

### AI 분석 결과
- **위협 수준**: 높음 (Level 4/5)
- **관련 인원**: 2명 (직접 관여), 3명 (목격자)
- **지속 시간**: 약 45초

### 자동 대응 조치
1. ✅ 경비실 자동 호출 완료
2. ✅ 영상 증거 자동 저장 시작
3. ⏳ 경찰 신고 대기 (관리자 승인 필요)

### 권장 조치
- 현장 경비원 즉시 투입
- 해당 구역 추가 모니터링 강화
- 관련자 신원 확인 후 기록 보관`,
  },
  {
    id: 'evt-2',
    cameraId: 'cam-8',
    cameraName: '지하 창고',
    type: 'theft',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'processing',
    description: '비인가 물품 반출 시도',
    aiAction: '출입문 잠금 및 관리자 알림',
    clipUrl: '/clips/evt-2.mp4',
    summary: '지하 창고에서 비인가 인원이 물품 반출을 시도하는 장면이 감지되었습니다.',
    analysisReport: `## 상황 분석 보고서

### 기본 정보
- **발생 시각**: ${new Date(Date.now() - 5 * 60 * 1000).toLocaleString('ko-KR')}
- **위치**: 지하 창고 (CAM-08)
- **감지 유형**: 절도/비인가 반출

### 상황 요약
지하 창고 구역에서 출입 기록이 없는 1인이 물품을 외부로 반출하려는 시도가 감지되었습니다.

### AI 분석 결과
- **위협 수준**: 높음 (Level 4/5)
- **관련 인원**: 1명
- **반출 시도 물품**: 박스 2개

### 자동 대응 조치
1. ✅ 출입문 자동 잠금 완료
2. ✅ 관리자 알림 발송 완료
3. ⏳ SMS 발송 진행 중

### 권장 조치
- 해당 인원 현장 확보
- 물품 목록 대조 확인
- 경찰 신고 검토`,
  },
  {
    id: 'evt-3',
    cameraId: 'cam-4',
    cameraName: '주차장 A구역',
    type: 'suspicious',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    status: 'pending',
    description: '장시간 배회 감지',
    aiAction: '모니터링 강화',
    clipUrl: '/clips/evt-3.mp4',
    summary: '주차장 A구역에서 1인이 약 15분간 특정 차량 주변을 배회하는 것이 감지되었습니다.',
    analysisReport: `## 상황 분석 보고서

### 기본 정보
- **발생 시각**: ${new Date(Date.now() - 10 * 60 * 1000).toLocaleString('ko-KR')}
- **위치**: 주차장 A구역 (CAM-04)
- **감지 유형**: 의심 행동/배회

### 상황 요약
주차장 A구역에서 신원 미상의 1인이 약 15분간 특정 차량(흰색 세단) 주변을 배회하고 있습니다.

### AI 분석 결과
- **위협 수준**: 중간 (Level 3/5)
- **관련 인원**: 1명
- **행동 패턴**: 반복적 접근 및 차량 내부 확인 시도

### 자동 대응 조치
1. ✅ 추적 카메라 활성화 완료
2. ⏳ 지속 모니터링 중

### 권장 조치
- 경비원 현장 확인 권장
- 해당 차량 소유자 연락 검토`,
  },
  {
    id: 'evt-4',
    cameraId: 'cam-1',
    cameraName: '1층 로비',
    type: 'normal',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'resolved',
    description: '일반 방문객 출입',
    summary: '정상적인 방문객 출입이 기록되었습니다.',
  },
  {
    id: 'evt-5',
    cameraId: 'cam-3',
    cameraName: '2층 복도',
    type: 'suspicious',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'resolved',
    description: '빠른 이동 감지 (오인식)',
    aiAction: '분석 후 정상 판정',
    summary: '직원의 급한 이동이 의심 행동으로 오인식되었으나, 분석 결과 정상으로 판정되었습니다.',
    analysisReport: `## 상황 분석 보고서

### 기본 정보
- **발생 시각**: ${new Date(Date.now() - 45 * 60 * 1000).toLocaleString('ko-KR')}
- **위치**: 2층 복도 (CAM-03)
- **감지 유형**: 의심 행동 → 오인식 (정상)

### 상황 요약
2층 복도에서 빠른 이동이 감지되어 초기 의심 행동으로 분류되었으나, AI 추가 분석 결과 해당 인원은 등록된 직원으로 확인되었습니다.

### AI 분석 결과
- **최종 판정**: 정상
- **오인식 사유**: 급한 이동 속도가 임계값 초과
- **신원 확인**: 3층 사무실 직원 (ID: EMP-0234)

### 조치 결과
- 추가 조치 불필요
- 정상 종료 처리 완료`,
  },
  {
    id: 'evt-6',
    cameraId: 'cam-5',
    cameraName: '주차장 B구역',
    type: 'normal',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: 'resolved',
    description: '차량 입출차',
    summary: '정상적인 차량 입출차가 기록되었습니다.',
  },
];

// AI Responses
export const mockAIResponses: AIResponse[] = [
  {
    id: 'res-1',
    eventId: 'evt-1',
    action: '경비실 자동 호출',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    status: 'completed',
  },
  {
    id: 'res-2',
    eventId: 'evt-1',
    action: '영상 증거 자동 저장',
    timestamp: new Date(Date.now() - 2 * 60 * 1000 + 5000),
    status: 'completed',
  },
  {
    id: 'res-3',
    eventId: 'evt-2',
    action: '출입문 잠금 활성화',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'completed',
  },
  {
    id: 'res-4',
    eventId: 'evt-2',
    action: '관리자 SMS 발송',
    timestamp: new Date(Date.now() - 5 * 60 * 1000 + 3000),
    status: 'in_progress',
  },
  {
    id: 'res-5',
    eventId: 'evt-3',
    action: '추적 카메라 활성화',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    status: 'pending',
  },
];

// Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'alert',
    title: '폭행 감지',
    message: '1층 출입구에서 물리적 충돌이 감지되었습니다.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    eventId: 'evt-1',
  },
  {
    id: 'notif-2',
    type: 'alert',
    title: '절도 시도 감지',
    message: '지하 창고에서 비인가 물품 반출 시도가 감지되었습니다.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    eventId: 'evt-2',
  },
  {
    id: 'notif-3',
    type: 'warning',
    title: '의심 행동 감지',
    message: '주차장 A구역에서 장시간 배회가 감지되었습니다.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    read: false,
    eventId: 'evt-3',
  },
  {
    id: 'notif-4',
    type: 'success',
    title: 'AI 대응 완료',
    message: '2층 복도 의심 행동 건이 정상 처리되었습니다.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    read: true,
    eventId: 'evt-5',
  },
  {
    id: 'notif-5',
    type: 'info',
    title: '시스템 알림',
    message: '야간 모드가 자동으로 활성화되었습니다.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'notif-6',
    type: 'info',
    title: '정기 점검 완료',
    message: '모든 카메라 시스템 정기 점검이 완료되었습니다.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
  },
];

// Stats
export const mockDailyStats: DailyStat[] = [
  { day: '월', events: 12, resolved: 11 },
  { day: '화', events: 8, resolved: 8 },
  { day: '수', events: 15, resolved: 14 },
  { day: '목', events: 10, resolved: 10 },
  { day: '금', events: 18, resolved: 16 },
  { day: '토', events: 6, resolved: 6 },
  { day: '일', events: 4, resolved: 4 },
];

export const mockEventTypeStats: EventTypeStat[] = [
  { type: '정상', count: 245, color: 'hsl(var(--success))' },
  { type: '의심', count: 32, color: 'hsl(var(--warning))' },
  { type: '폭행', count: 8, color: 'hsl(var(--destructive))' },
  { type: '절도', count: 5, color: 'hsl(var(--chart-5))' },
];

export const mockMonthlyEventData: MonthlyEventData = {
  '2026-01-01': { events: 5, alerts: 1 },
  '2026-01-02': { events: 8, alerts: 2 },
  '2026-01-03': { events: 3, alerts: 0 },
  '2026-01-05': { events: 12, alerts: 3 },
  '2026-01-06': { events: 7, alerts: 1 },
  '2026-01-07': { events: 4, alerts: 0 },
  '2026-01-08': { events: 9, alerts: 2 },
  '2026-01-09': { events: 6, alerts: 1 },
  '2026-01-10': { events: 11, alerts: 4 },
  '2026-01-11': { events: 5, alerts: 0 },
  '2026-01-12': { events: 8, alerts: 2 },
  '2026-01-13': { events: 23, alerts: 5 },
};

// Helper: Generate tokens
export const generateAccessToken = (userId: string): string => {
  return `access_${userId}_${Date.now()}`;
};

export const generateRefreshToken = (userId: string): string => {
  const token = `refresh_${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  mockRefreshTokens.set(token, userId);
  return token;
};

export const validateRefreshToken = (token: string): string | null => {
  return mockRefreshTokens.get(token) || null;
};

export const removeRefreshToken = (token: string): void => {
  mockRefreshTokens.delete(token);
};
