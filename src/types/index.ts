// Camera types
export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'normal' | 'alert' | 'warning' | 'offline';
  alertType?: 'assault' | 'theft' | 'suspicious';
}

export interface ManagedCamera extends Camera {
  ipAddress: string;
  resolution: string;
  active: boolean;
}

// Event types
export interface Event {
  id: string;
  cameraId: string;
  cameraName: string;
  type: 'assault' | 'theft' | 'suspicious' | 'normal';
  timestamp: Date;
  status: 'pending' | 'processing' | 'resolved';
  description: string;
  aiAction?: string;
  clipUrl?: string;
  summary?: string;
  analysisReport?: string;
}

// AI Response types
export interface AIResponse {
  id: string;
  eventId: string;
  action: string;
  timestamp: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

// Notification types
export interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
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
