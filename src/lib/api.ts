import api, { setAccessToken } from './axios';
import type {
  Camera,
  Event,
  Notification,
  User,
  DailyStat,
  EventTypeStat,
  MonthlyEventData,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  RefreshResponse,
  SummaryStats,
  SystemStatus,
  StorageInfo,
} from '@/types';

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', data);
    setAccessToken(response.data.accessToken);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
    setAccessToken(null);
  },

  refresh: async (): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>('/api/auth/refresh');
    setAccessToken(response.data.accessToken);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },
};

// Cameras API
export const camerasApi = {
  getAll: async (): Promise<Camera[]> => {
    const response = await api.get<Camera[]>('/api/cameras');
    return response.data;
  },
};

// Events API
export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/api/events');
    return response.data;
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/api/notifications');
    return response.data;
  },
};

// Stats API
export const statsApi = {
  getDaily: async (): Promise<DailyStat[]> => {
    const response = await api.get<DailyStat[]>('/api/stats?type=daily');
    return response.data;
  },

  getEventTypes: async (): Promise<EventTypeStat[]> => {
    const response = await api.get<EventTypeStat[]>('/api/stats?type=event-types');
    return response.data;
  },

  getMonthly: async (): Promise<MonthlyEventData> => {
    const response = await api.get<MonthlyEventData>('/api/stats?type=monthly');
    return response.data;
  },

  getSummary: async (): Promise<SummaryStats> => {
    const response = await api.get<SummaryStats>('/api/stats?type=summary');
    return response.data;
  },

  getSystemStatus: async (): Promise<SystemStatus> => {
    const response = await api.get<SystemStatus>('/api/stats?type=system');
    return response.data;
  },

  getStorageInfo: async (): Promise<StorageInfo> => {
    const response = await api.get<StorageInfo>('/api/stats?type=storage');
    return response.data;
  },
};

// Users API (Admin)
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/api/users');
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(`/api/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },

  approve: async (id: string): Promise<User> => {
    const response = await api.patch<User>(`/api/users/${id}/approve`);
    return response.data;
  },
};
