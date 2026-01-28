import api, { setAccessToken } from './axios';
import type {
  ManagedCamera,
  CameraUpdateRequest,
  Event,
  EventUpdateStatusRequest,
  Notification,
  User,
  UserUpdateRequest,
  DailyStat,
  EventTypeStat,
  MonthlyEventData,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  RefreshResponse,
  PasswordChangeRequest,
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

  changePassword: async (data: PasswordChangeRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch('/api/auth/password', data);
    return response.data;
  },

  updateProfile: async (data: { name: string }): Promise<User> => {
    const response = await api.patch<User>('/api/auth/me', data);
    return response.data;
  },

  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete('/api/auth/me');
    return response.data;
  },
};

// Cameras API
export const camerasApi = {
  getAll: async (): Promise<ManagedCamera[]> => {
    const response = await api.get<ManagedCamera[]>('/api/cameras');
    return response.data;
  },

  getById: async (id: string): Promise<ManagedCamera> => {
    const response = await api.get<ManagedCamera>(`/api/cameras/${id}`);
    return response.data;
  },

  update: async (id: string, data: CameraUpdateRequest): Promise<ManagedCamera> => {
    const response = await api.patch<ManagedCamera>(`/api/cameras/${id}`, data);
    return response.data;
  },
};

// Events API
export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/api/events');
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/api/events/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, data: EventUpdateStatusRequest): Promise<Event> => {
    const response = await api.patch<Event>(`/api/events/${id}/status`, data);
    return response.data;
  },

  /** 클립 Blob URL 가져오기 (인증 토큰 포함) */
  getClipBlobUrl: async (id: string): Promise<string> => {
    const response = await api.get(`/api/events/${id}/clip/stream`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },

  /** 클립 다운로드 (인증 토큰 포함) */
  downloadClip: async (id: string, filename?: string): Promise<void> => {
    const response = await api.get(`/api/events/${id}/clip`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `event-${id}.ts`;
    link.click();
    URL.revokeObjectURL(url);
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/api/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/api/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch<Notification>(`/api/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>('/api/notifications/read-all');
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/api/notifications/${id}`);
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
};

// Users API (Admin)
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/api/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/api/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: UserUpdateRequest): Promise<User> => {
    const response = await api.patch<User>(`/api/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/api/users/${id}`);
    return response.data;
  },

  approve: async (id: string): Promise<User> => {
    const response = await api.patch<User>(`/api/users/${id}/approve`);
    return response.data;
  },
};


