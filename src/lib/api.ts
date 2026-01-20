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
  SummaryStats,
  EmergencyContact,
  EmergencyContactUpdateRequest,
  SystemStatus,
  StorageInfo,
  StreamAccessResponse,
  ThumbnailResponse,
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

  requestStream: async (id: string): Promise<StreamAccessResponse> => {
    const response = await api.post<StreamAccessResponse>(`/api/cameras/${id}/stream`);
    return response.data;
  },

  getThumbnail: async (id: string): Promise<ThumbnailResponse> => {
    const response = await api.get<ThumbnailResponse>(`/api/cameras/${id}/thumbnail`);
    return response.data;
  },

  getThumbnailUrl: (id: string): string => {
    return `/api/cameras/${id}/thumbnail.jpg`;
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

// Settings API
export const settingsApi = {
  getEmergencyContacts: async (): Promise<EmergencyContact[]> => {
    const response = await api.get<EmergencyContact[]>('/api/settings/emergency-contacts');
    return response.data;
  },

  updateEmergencyContacts: async (data: EmergencyContactUpdateRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/api/settings/emergency-contacts', data);
    return response.data;
  },
};

