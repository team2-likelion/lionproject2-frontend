import api from './client';
import type { ApiResponse } from './client';
import type { AvailableSlotsResponse } from '@/types';

// 수업 상태
export type LessonStatus = 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';

// 수업 정보 타입 (백엔드 MyLessonItem 매핑)
export interface Lesson {
  lessonId: number;
  ticketId: number;
  tutorialId: number;
  tutorialTitle: string;
  mentorName?: string;
  menteeName?: string;
  menteeEmail?: string;
  requestMessage?: string;
  scheduledAt: string | null;
  status: LessonStatus;
  createdAt: string;
}

// 수업 목록 응답 타입
export interface LessonListResponse {
  lessons: Lesson[];
}

// 수업 신청 요청 타입 (백엔드: PostLessonRegisterRequest)
export interface LessonRequestCreate {
  lessonDate: string;      // "2025-01-15" (ISO date, @NotNull)
  lessonTime: string;      // "14:00" (HH:mm, @NotNull)
  requestMessage?: string; // 요청 메시지 (선택)
}

/**
 * 수업 신청 (멘티)
 */
export const requestLesson = async (
  ticketId: number,
  data: LessonRequestCreate
): Promise<ApiResponse<Lesson>> => {
  const response = await api.post<ApiResponse<Lesson>>(`/api/tickets/${ticketId}/lessons`, data);
  return response.data;
};

/**
 * 내 수업 목록 조회 (멘티)
 */
export const getMyLessons = async (status?: LessonStatus): Promise<ApiResponse<LessonListResponse>> => {
  const url = status ? `/api/lessons/my?status=${status}` : '/api/lessons/my';
  const response = await api.get<ApiResponse<LessonListResponse>>(url);
  return response.data;
};

/**
 * 수업 신청 목록 조회 (멘토)
 * 백엔드 GetLessonRequestListResponse: { lessons: [...] } 형태로 반환
 */
export const getLessonRequests = async (status?: LessonStatus): Promise<ApiResponse<LessonListResponse>> => {
  const url = status ? `/api/lessons/requests?status=${status}` : '/api/lessons/requests';
  const response = await api.get<ApiResponse<LessonListResponse>>(url);
  return response.data;
};

/**
 * 수업 확정 (멘토)
 */
export const confirmLesson = async (lessonId: number): Promise<ApiResponse<Lesson>> => {
  const response = await api.put<ApiResponse<Lesson>>(`/api/lessons/${lessonId}/confirm`);
  return response.data;
};

/**
 * 수업 거절 (멘토)
 * 백엔드: PutLessonRejectRequest - rejectReason 필드 (@NotBlank 필수)
 */
export const rejectLesson = async (
  lessonId: number,
  rejectReason: string  // 필수값 (백엔드 @NotBlank)
): Promise<ApiResponse<Lesson>> => {
  const response = await api.put<ApiResponse<Lesson>>(`/api/lessons/${lessonId}/reject`, { rejectReason });
  return response.data;
};

/**
 * 수업 시작 (멘토)
 */
export const startLesson = async (lessonId: number): Promise<ApiResponse<Lesson>> => {
  const response = await api.put<ApiResponse<Lesson>>(`/api/lessons/${lessonId}/start`);
  return response.data;
};

/**
 * 수업 완료 (멘토)
 */
export const completeLesson = async (lessonId: number): Promise<ApiResponse<Lesson>> => {
  const response = await api.put<ApiResponse<Lesson>>(`/api/lessons/${lessonId}/complete`);
  return response.data;
};

/**
 * 예약 가능 슬롯 조회 (공개)
 * 특정 튜토리얼의 특정 날짜에 예약 가능한 시간 슬롯 조회
 */
export const getAvailableSlots = async (
  tutorialId: number,
  date: string  // "2026-01-20" (YYYY-MM-DD)
): Promise<ApiResponse<AvailableSlotsResponse>> => {
  const response = await api.get<ApiResponse<AvailableSlotsResponse>>(
    `/api/tutorials/${tutorialId}/available-slots?date=${date}`
  );
  return response.data;
};
