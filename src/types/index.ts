// Camera types
export interface Camera {
  id: string;
  name: string;           // 미디어서버 원본 이름 (수정 불가)
  connected: boolean;     // 온라인/오프라인 (미디어서버 연결 여부)
}

export interface ManagedCamera extends Camera {
  location: string;          // 장소 (수정 가능)
  enabled: boolean;       // 카메라 활성화 (메인 스위치)
  analysisEnabled: boolean; // AI 분석 활성화 (enabled=true일 때만 유효)
  streamUrl: string;      // WebRTC WHEP URL
}

export interface CameraUpdateRequest {
  location?: string;
  enabled?: boolean;
  analysisEnabled?: boolean;
}

// Event types
export interface EventAction {
  id: string;
  log: string;
  triggeredAt: string;
}

export interface Event {
  id: string;
  cameraId: string;
  cameraName: string;
  risk: 'normal' | 'suspicious' | 'abnormal';
  type: 'assault' | 'burglary' | 'dump' | 'swoon' | 'vandalism';
  occurredAt: string;
  status: 'processing' | 'analyzed';
  clipUrl?: string;
  summary?: string;
  riskScore?: string;
  actions?: EventAction[];
  ragReferences?: Record<string, unknown>[];
  report?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;      // ISO8601 string (백엔드 호환)
  eventId?: string;
}

// User types
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedCameras: string[];
  createdAt: string;
  approved: boolean;
}

// Stats types
export interface DailyStat {
  day: string;
  events: number;
  analyzed: number;
}

export interface EventTypeStat {
  type: string;
  count: number;
  color: string;
}

export interface MonthlyEventData {
  [date: string]: {
    events: number;
    alerts: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}


// User update types
export interface UserUpdateRequest {
  name?: string;
  role?: UserRole;
  assignedCameras?: string[];
}

// 페이지네이션 응답 타입
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

