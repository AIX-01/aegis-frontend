// Camera types
export interface Camera {
  id: string;
  name: string;           // 미디어서버 원본 이름 (수정 불가)
  connected: boolean;     // 온라인/오프라인 (미디어서버 연결 여부)
}

export interface ManagedCamera extends Camera {
  alias: string;          // 별칭 (수정 가능)
  active: boolean;        // ON/OFF (사용자 제어)
}

export interface CameraUpdateRequest {
  alias?: string;
  active?: boolean;
}

// Event types
export interface Event {
  id: string;
  cameraId: string;
  cameraName: string;
  type: 'assault' | 'burglary' | 'dump' | 'swoon' | 'vandalism';
  timestamp: string;      // ISO8601 string (백엔드 호환)
  status: 'processing' | 'resolved';
  description: string;
  aiAction?: string;
  clipUrl?: string;
  summary?: string;
  analysisReport?: string;
}

export interface EventUpdateStatusRequest {
  status: 'processing' | 'resolved';
}

// Notification types
export interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;      // ISO8601 string (백엔드 호환)
  read: boolean;
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
  resolved: number;
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

// Summary Stats types
export interface SummaryStats {
  todayEvents: number;
  aiResponseRate: number;
  avgResponseTime: number;
  activeAlerts: number;
  todayEventsChange: number;
  aiResponseRateChange: number;
}


// System types
export interface SystemStatus {
  status: string;
  message: string;
}

export interface StorageInfo {
  usedStorage: number;
  totalStorage: number;
}

// User update types
export interface UserUpdateRequest {
  name?: string;
  role?: UserRole;
  assignedCameras?: string[];
}

// Stream types
export interface StreamAccessResponse {
  streamUrl: string;
  token: string;
  cameraId: string;
  cameraName: string;
}

export interface ThumbnailResponse {
  image: string;  // Base64 encoded JPEG
}
