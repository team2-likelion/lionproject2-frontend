import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 전송 필수 (Refresh Token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Access Token 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - 토큰 만료 시 자동 재발급 & 에러 메시지 개선
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 & 재시도 안 한 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response?.data?.code;

      // 토큰 만료 시 재발급 시도
      if (errorCode === 'TOKEN_001' || errorCode === 'TOKEN_002') {
        originalRequest._retry = true;

        try {
          const { data } = await api.post('/api/auth/refresh');
          const newAccessToken = data.data.accessToken;

          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          // 재발급 실패 - 로그아웃 처리
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    // 백엔드 에러 메시지가 있으면 그것을 사용
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

export default api;

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
}
