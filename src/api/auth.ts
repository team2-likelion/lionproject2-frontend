import api from './client';
import type { ApiResponse } from './client';

// 회원가입 요청 타입
export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  role: 'MENTEE' | 'MENTOR';
}

// 회원가입 응답 타입
export interface SignupResponse {
  userId: number;
}

// 로그인 요청 타입
export interface LoginRequest {
  email: string;
  password: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string;
}

// 사용자 정보 타입 (내 정보 조회용)
export interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  role: 'MENTEE' | 'MENTOR'| 'ADMIN';
}

// 프로필 수정 요청 타입
export interface UpdateProfileRequest {
    nickname?: string;
    introduction?: string;
}

// 프로필 수정 응답 타입
export interface UpdateProfileResponse {
    id: number;
    nickname: string;
    introduction: string | null;
}

/**
 * 회원가입
 */
export const signup = async (data: SignupRequest): Promise<ApiResponse<SignupResponse>> => {
  const response = await api.post<ApiResponse<SignupResponse>>('/api/auth/signup', data);
  return response.data;
};

/**
 * 로그인
 * - Access Token은 응답으로 반환
 * - Refresh Token은 HttpOnly 쿠키로 자동 설정됨
 */
export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  // 로그인 전 기존 토큰 삭제 (다른 계정 토큰이 남아있을 수 있음)
  localStorage.removeItem('accessToken');

  const response = await api.post<ApiResponse<LoginResponse>>('/api/auth/login', data);

  // Access Token 저장
  if (response.data.success && response.data.data) {
    localStorage.setItem('accessToken', response.data.data.accessToken);
  }

  return response.data;
};

/**
 * 로그아웃
 * - 서버에서 Refresh Token 쿠키 삭제
 * - 클라이언트에서 Access Token 삭제
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
  }
};

/**
 * 토큰 재발급
 * - Refresh Token 쿠키를 사용하여 새 Access Token 발급
 */
export const refresh = async (): Promise<ApiResponse<LoginResponse>> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/api/auth/refresh');

  if (response.data.success && response.data.data) {
    localStorage.setItem('accessToken', response.data.data.accessToken);
  }

  return response.data;
};

/**
 * 내 정보 조회
 */
export const getMe = async (): Promise<ApiResponse<UserInfo>> => {
  const response = await api.get<ApiResponse<UserInfo>>('/api/user/me');
  return response.data;
};

/**
 * Access Token 존재 여부 확인
 */
export const hasToken = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

/**
 * Access Token 가져오기
 */
export const getToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// 중복 확인 응답 타입
export interface DuplicateCheckResponse {
  duplicated: boolean;
}

/**
 * 이메일 중복 확인
 */
export const checkEmailDuplicate = async (email: string): Promise<ApiResponse<DuplicateCheckResponse>> => {
  const response = await api.get<ApiResponse<DuplicateCheckResponse>>(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
  return response.data;
};

/**
 * 닉네임 중복 확인
 */
export const checkNicknameDuplicate = async (nickname: string): Promise<ApiResponse<DuplicateCheckResponse>> => {
  const response = await api.get<ApiResponse<DuplicateCheckResponse>>(`/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
  return response.data;
};

/**
 * 내 프로필 수정
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<ApiResponse<UpdateProfileResponse>> => {
    const response = await api.put<ApiResponse<UpdateProfileResponse>>('/api/user/me', data);
    return response.data;
};