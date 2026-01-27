import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';


// Access Token 저장소 (메모리)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Axios 인스턴스 생성 (상대경로 사용 - 게이트웨이가 /api를 백엔드로 라우팅)
const api = axios.create({
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

// 응답 인터셉터: 401/403 에러 시 토큰 갱신 후 재요청
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const url = originalRequest.url || '';

    // 인증이 필요 없는 요청은 인터셉터 스킵
    const isAuthEndpoint = url.includes('/api/auth/login') ||
                          url.includes('/api/auth/signup') ||
                          url.includes('/api/auth/refresh');

    // 401 또는 403 에러이고, 재시도하지 않은 요청이며, 인증 관련 요청이 아닌 경우
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !isAuthEndpoint
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
