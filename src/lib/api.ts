import api, { setAccessToken } from './axios';
import type {
  ManagedCamera,
  CameraUpdateRequest,
  Event,
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
  PageResponse,
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
  getAll: async (page = 0, size = 6): Promise<PageResponse<ManagedCamera>> => {
    const response = await api.get<PageResponse<ManagedCamera>>(`/api/cameras?page=${page}&size=${size}`);
    return response.data;
  },

  // 전체 목록 조회 (멤버 관리 - 카메라 할당용)
  getAllList: async (): Promise<ManagedCamera[]> => {
    const response = await api.get<ManagedCamera[]>('/api/cameras/all');
    return response.data;
  },

  update: async (id: string, data: CameraUpdateRequest): Promise<ManagedCamera> => {
    const response = await api.patch<ManagedCamera>(`/api/cameras/${id}`, data);
    return response.data;
  },
};

// Events API
export const eventsApi = {
  getAll: async (page = 0, size = 20): Promise<PageResponse<Event>> => {
    const response = await api.get<PageResponse<Event>>(`/api/events?page=${page}&size=${size}`);
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


  deleteAll: async (): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>('/api/notifications');
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
  getAll: async (page = 0, size = 20): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>(`/api/users?page=${page}&size=${size}`);
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


