import api from './client';
import type { ApiResponse } from './client';

// 멘토 정보 타입 (목록 조회용)
export interface Mentor {
  id: number;
  mentorId?: number;  // 백엔드에서 mentorId로 반환할 수도 있음
  userId?: number;
  nickname: string;
  email?: string;
  introduction?: string | null;
  career?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  skills: Skill[] | string[];
  reviewCount: number;
  averageRating?: number;
  createdAt?: string;
}

// 멘토 상세 정보 타입 (백엔드: GetMentorDetailResponse)
export interface MentorDetail {
  mentorId: number;
  nickname: string;
  career: string;
  reviewCount: number;
  averageRating: number;
  skills: string[];
  tutorials: TutorialInfo[];
  reviews: ReviewInfo[];
  createdAt: string;
}

// 멘토 상세의 튜토리얼 정보
export interface TutorialInfo {
  id: number;
  title: string;
  description: string | null;
  price: number;
  duration: number;
  rating: number;
  status: string;
  skills: SkillInfo[];
}

// 스킬 정보 (튜토리얼용)
export interface SkillInfo {
  id: number;
  skillName: string;
}

// 멘토 상세의 리뷰 정보
export interface ReviewInfo {
  id: number;
  rating: number;
  content: string;
  mentee: MenteeInfo;
  createdAt: string;
}

// 멘티 정보
export interface MenteeInfo {
  id: number;
  nickname: string;
}

// 스킬 타입
export interface Skill {
  id: number;
  name: string;
}

// 멘토 신청 요청 타입 (백엔드: PostMentorApplyRequest)
export interface MentorApplyRequest {
  skills: string[];  // 스킬 이름 배열 (백엔드: List<String>)
  career: string;    // 경력 (백엔드: @NotBlank)
}

// 멘토 목록 응답 타입
export interface MentorListResponse {
  content: Mentor[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * 멘토 목록 조회 (공개)
 * 백엔드가 배열을 반환하면 페이지 객체로 변환
 */
export const getMentors = async (params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<ApiResponse<MentorListResponse>> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', String(params.page));
  if (params?.size !== undefined) queryParams.append('size', String(params.size));
  if (params?.sort) queryParams.append('sort', params.sort);

  const url = `/api/mentors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get<ApiResponse<MentorListResponse | Mentor[]>>(url);

  // 백엔드가 배열을 직접 반환하는 경우 페이지 객체로 변환
  if (response.data.data && Array.isArray(response.data.data)) {
    const mentors = response.data.data as Mentor[];
    return {
      ...response.data,
      data: {
        content: mentors,
        totalElements: mentors.length,
        totalPages: 1,
        number: 0,
        size: mentors.length,
      },
    };
  }

  return response.data as ApiResponse<MentorListResponse>;
};

/**
 * 멘토 상세 조회 (공개)
 */
export const getMentor = async (mentorId: number): Promise<ApiResponse<MentorDetail>> => {
  const response = await api.get<ApiResponse<MentorDetail>>(`/api/mentors/${mentorId}`);
  return response.data;
};

/**
 * 멘토 신청 (인증 필요)
 */
export const applyMentor = async (data: MentorApplyRequest): Promise<ApiResponse<Mentor>> => {
  const response = await api.post<ApiResponse<Mentor>>('/api/mentors/apply', data);
  return response.data;
};

/**
 * 스킬 목록 조회 (공개)
 */
export const getSkills = async (): Promise<ApiResponse<Skill[]>> => {
  const response = await api.get<ApiResponse<Skill[]>>('/api/skills');
  return response.data;
};

// 멘토 가용 시간 타입
export interface MentorAvailabilityItem {
  id: number;
  dayOfWeek: string;      // "MONDAY", "TUESDAY", ...
  dayOfWeekKr: string;    // "월요일", ...
  startTime: string;      // "14:00:00"
  endTime: string;        // "20:00:00"
  active: boolean;        // 백엔드 응답 필드명
}

export interface MentorAvailabilityResponse {
  mentorId: number;
  mentorNickname: string;
  availability: MentorAvailabilityItem[];
}

/**
 * 멘토 가용 시간 조회 (공개)
 */
export const getMentorAvailability = async (
  mentorId: number
): Promise<ApiResponse<MentorAvailabilityResponse>> => {
  const response = await api.get<ApiResponse<MentorAvailabilityResponse>>(
    `/api/mentors/${mentorId}/availability`
  );
  return response.data;
};

/**
 * 내 가용 시간 조회 (멘토 본인)
 */
export const getMyAvailability = async (): Promise<ApiResponse<MentorAvailabilityResponse>> => {
  const response = await api.get<ApiResponse<MentorAvailabilityResponse>>(
    '/api/mentors/me/availability'
  );
  return response.data;
};

// 가용 시간 등록 요청 타입
export interface AddAvailabilityRequest {
  dayOfWeek: string;  // "MONDAY", "TUESDAY", ...
  startTime: string;  // "HH:mm" 형식
  endTime: string;    // "HH:mm" 형식
}

/**
 * 가용 시간 등록 (멘토 본인)
 */
export const addMyAvailability = async (
  request: AddAvailabilityRequest
): Promise<ApiResponse<MentorAvailabilityItem>> => {
  const response = await api.post<ApiResponse<MentorAvailabilityItem>>(
    '/api/mentors/me/availability',
    request
  );
  return response.data;
};

/**
 * 가용 시간 삭제 (멘토 본인)
 */
export const deleteMyAvailability = async (
  availabilityId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(
    `/api/mentors/me/availability/${availabilityId}`
  );
  return response.data;
};

/**
 * 내 멘토 프로필 조회 (인증 필요)
 */
export const getMyMentorProfile = async (): Promise<ApiResponse<MentorDetail>> => {
    const response = await api.get<ApiResponse<MentorDetail>>('/api/mentors/me');
    return response.data;
};
