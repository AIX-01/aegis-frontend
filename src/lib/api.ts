import api, { setAccessToken } from './axios';
import type {
  Camera,
  Event,
  Notification,
  AIResponse,
  User,
  DailyStat,
  EventTypeStat,
  MonthlyEventData,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  RefreshResponse,
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

  getById: async (id: string): Promise<Camera> => {
    const response = await api.get<Camera>(`/api/cameras/${id}`);
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
};

// Notifications API
export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/api/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/api/notifications/read-all');
  },
};

// AI Responses API
export const aiResponsesApi = {
  getAll: async (): Promise<AIResponse[]> => {
    const response = await api.get<AIResponse[]>('/api/ai-responses');
    return response.data;
  },

  getByEventId: async (eventId: string): Promise<AIResponse[]> => {
    const response = await api.get<AIResponse[]>(`/api/ai-responses?eventId=${eventId}`);
    return response.data;
  },
};

// Stats API
export const statsApi = {
  getDaily: async (): Promise<DailyStat[]> => {
    const response = await api.get<DailyStat[]>('/api/stats/daily');
    return response.data;
  },

  getEventTypes: async (): Promise<EventTypeStat[]> => {
    const response = await api.get<EventTypeStat[]>('/api/stats/event-types');
    return response.data;
  },

  getMonthly: async (): Promise<MonthlyEventData> => {
    const response = await api.get<MonthlyEventData>('/api/stats/monthly');
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
