import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 런타임에 API URL 결정
const getBaseURL = (): string => {
  // 서버 사이드
  if (typeof window === 'undefined') return '';

  // 개발 환경: same-origin (Next.js API Route 사용)
  if (process.env.NODE_ENV === 'development') return '';

  // 프로덕션: 서브도메인을 api로 교체
  const { protocol, hostname } = window.location;
  const parts = hostname.split('.');
  parts[0] = 'api';
  return `${protocol}//${parts.join('.')}`;
};

// Access Token 저장소 (메모리)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송을 위해 필요
});

// 요청 인터셉터: Access Token 헤더 주입
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 토큰 갱신 후 재요청
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러이고, 재시도하지 않은 요청이며, refresh 요청이 아닌 경우
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새 Access Token 요청
        const response = await api.post('/api/auth/refresh');
        const { accessToken: newAccessToken } = response.data;

        setAccessToken(newAccessToken);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh 실패 시 로그아웃 처리
        setAccessToken(null);
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
