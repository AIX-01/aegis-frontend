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
  Action,
  ActionCreateRequest,
  ActionUpdateRequest,
  Manual,
  ManualCreateRequest,
  ManualUpdateRequest,
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
export interface EventFilters {
  risks?: string[];
  types?: string[];
  statuses?: string[];
  cameraIds?: string[];
  startDate?: string;
  endDate?: string;
}

// 필터 배열을 URLSearchParams에 추가하는 헬퍼
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

  /** 클립 재생용 presigned URL 가져오기 */
  getClipUrl: async (id: string): Promise<string> => {
    const response = await api.get<{ url: string }>(`/api/events/${id}/clip-url`);
    return response.data.url;
  },

  /** 클립 다운로드용 presigned URL 가져오기 */
  downloadClip: async (id: string, filename?: string): Promise<void> => {
    const response = await api.get<{ url: string; filename: string }>(`/api/events/${id}/clip/download-url`);
    const link = document.createElement('a');
    link.href = response.data.url;
    link.download = filename || response.data.filename;
    link.click();
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
  // 승인된 사용자 목록 (관리자→일반 순, 이메일순)
  getApproved: async (page = 0, size = 20): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>(`/api/users?page=${page}&size=${size}`);
    return response.data;
  },

  // 미승인 사용자 목록 (최신 가입순)
  getPending: async (page = 0, size = 20): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>(`/api/users/pending?page=${page}&size=${size}`);
    return response.data;
  },

  // 미승인 사용자 수
  getPendingCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/api/users/pending/count');
    return response.data.count;
  },

  // 기존 getAll은 getApproved로 대체 (하위 호환)
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

// Actions API (Admin)
export const actionsApi = {
  getAll: async (page = 0, size = 20): Promise<PageResponse<Action>> => {
    const response = await api.get<PageResponse<Action>>(`/api/actions?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id: string): Promise<Action> => {
    const response = await api.get<Action>(`/api/actions/${id}`);
    return response.data;
  },

  create: async (data: ActionCreateRequest): Promise<Action> => {
    const response = await api.post<Action>('/api/actions', data);
    return response.data;
  },

  update: async (id: string, data: ActionUpdateRequest): Promise<Action> => {
    const response = await api.patch<Action>(`/api/actions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/actions/${id}`);
  },
};

// Manuals API (Admin)
export const manualsApi = {
  getAll: async (page = 0, size = 20): Promise<PageResponse<Manual>> => {
    const response = await api.get<PageResponse<Manual>>(`/api/manuals?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id: string): Promise<Manual> => {
    const response = await api.get<Manual>(`/api/manuals/${id}`);
    return response.data;
  },

  create: async (data: ManualCreateRequest): Promise<Manual> => {
    const response = await api.post<Manual>('/api/manuals', data);
    return response.data;
  },

  update: async (id: string, data: ManualUpdateRequest): Promise<Manual> => {
    const response = await api.patch<Manual>(`/api/manuals/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/manuals/${id}`);
  },
};
