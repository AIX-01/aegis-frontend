import api, { setAccessToken } from './axios';
import type {
  ManagedCamera,
  CameraUpdateRequest,
  Event,
  Notification,
  User,
  UserUpdateRequest,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  RefreshResponse,
  PasswordChangeRequest,
  PageResponse,
  // --- New Stats Types ---
  DailySummary,
  PeriodTrend,
  EventTypeDistribution,
  CameraDistribution,
  PeriodSummary,
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
export interface EventFilters {
  risks?: string[];
  types?: string[];
  statuses?: string[];
  cameraIds?: string[];
  startDate?: string;
  endDate?: string;
}

const appendFilterParam = (params: URLSearchParams, key: string, values?: string[]) => {
  if (values === undefined) return;
  if (values.length === 0) {
    params.append(key, '_empty');
  } else {
    values.forEach(v => params.append(key, v));
  }
};

export const eventsApi = {
  getAll: async (page = 0, size = 20, filters?: EventFilters): Promise<PageResponse<Event>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (filters) {
      appendFilterParam(params, 'risks', filters.risks);
      appendFilterParam(params, 'types', filters.types);
      appendFilterParam(params, 'statuses', filters.statuses);
      appendFilterParam(params, 'cameraIds', filters.cameraIds);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
    }
    const response = await api.get<PageResponse<Event>>(`/api/events?${params.toString()}`);
    return response.data;
  },
  getClipUrl: async (id: string): Promise<string> => {
    const response = await api.get<{ url: string }>(`/api/events/${id}/clip-url`);
    return response.data.url;
  },
  downloadClip: async (id: string, filename?: string): Promise<void> => {
    const response = await api.get<{ url: string; filename: string }>(`/api/events/${id}/clip/download-url`);
    const link = document.createElement('a');
    link.href = response.data.url;
    link.download = filename || response.data.filename;
    link.click();
  },

  /** 이벤트 상세 조회 */
  getById: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/api/events/${id}`);
    return response.data;
  },

  /** 액션 승인/거부 (Human-in-the-Loop) */
  resolveAction: async (eventId: string, actionId: string, approved: boolean): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      `/api/events/${eventId}/actions/${actionId}/resolve`,
      { approved }
    );
    return response.data;
  },

  /** 보고서 HTML 조회 */
  getReport: async (id: string): Promise<string> => {
    const response = await api.get<string>(`/api/events/${id}/report`);
    return response.data;
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

// --- New Stats API ---
const getStats = async <T>(type: string, startDate?: string, endDate?: string): Promise<T> => {
  const params = new URLSearchParams();
  params.append('type', type);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const response = await api.get<T>(`/api/stats?${params.toString()}`);
  return response.data;
};

export const statsApi = {
  getDailySummary: (date: string) => getStats<DailySummary>('daily-summary', date, date),
  getPeriodTrend: (startDate?: string, endDate?: string) => getStats<PeriodTrend[]>('period-trend', startDate, endDate),
  getEventTypeDistribution: (startDate?: string, endDate?: string) => getStats<EventTypeDistribution[]>('event-type-distribution', startDate, endDate),
  getCameraDistribution: (startDate?: string, endDate?: string) => getStats<CameraDistribution[]>('camera-distribution', startDate, endDate),
  getPeriodSummary: (startDate?: string, endDate?: string) => getStats<PeriodSummary>('period-summary', startDate, endDate),
};


// Users API (Admin)
export const usersApi = {
  getApproved: async (page = 0, size = 20): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>(`/api/users?page=${page}&size=${size}`);
    return response.data;
  },
  getPending: async (page = 0, size = 20): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>(`/api/users/pending?page=${page}&size=${size}`);
    return response.data;
  },
  getPendingCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/api/users/pending/count');
    return response.data.count;
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
