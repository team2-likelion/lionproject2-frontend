import api from './client';
import type { ApiResponse } from './client';
import type { Skill } from './mentor';

// 과외 정보 타입 (백엔드 응답)
export interface Tutorial {
    id: number;
    mentorId: number;
    mentorNickname?: string;
    title: string;
    description: string | null;
    price: number;
    duration: number;
    rating: number;
    reviewCount?: number;
    status?: 'ACTIVE' | 'INACTIVE';
    tutorialStatus?: 'ACTIVE' | 'INACTIVE';
    skills: (string | Skill)[];
    createdAt?: string;
    updatedAt?: string;
}

// 과외 등록 요청 타입
export interface TutorialCreateRequest {
    title: string;
    description: string;
    price: number;
    duration: number;
    skills: string[];
}

// 과외 수정 요청 타입
export interface TutorialUpdateRequest {
    title: string;
    description: string;
    price: number;
    duration: number;
    skillIds: number[];
}

/**
 * ⭐ 과외 목록 조회 + 검색 (공개)
 * QueryDSL 검색 조건 지원
 */
export const getTutorials = async (params?: {
    skills?: string[];      // 기술 스택 필터 (AND 조건)
    keyword?: string;       // 키워드 검색 (제목, 설명, 스킬 이름)
    minPrice?: number;      // 최소 가격
    maxPrice?: number;      // 최대 가격
    sortBy?: string;        // 정렬 (priceAsc, priceDesc, rating, reviewCount)
}): Promise<ApiResponse<Tutorial[]>> => {
    const queryParams = new URLSearchParams();

    if (params?.skills && params.skills.length > 0) {
        params.skills.forEach(skill => queryParams.append('skills', skill));
    }
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.minPrice !== undefined) queryParams.append('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) queryParams.append('maxPrice', String(params.maxPrice));
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    const url = `/api/tutorials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<ApiResponse<Tutorial[]>>(url);
    return response.data;
};

/**
 * 과외 상세 조회 (공개)
 */
export const getTutorial = async (tutorialId: number): Promise<ApiResponse<Tutorial>> => {
    const response = await api.get<ApiResponse<Tutorial>>(`/api/tutorials/${tutorialId}`);
    return response.data;
};

/**
 * 과외 검색 (공개)
 */
export const searchTutorials = async (keyword: string): Promise<ApiResponse<Tutorial[]>> => {
    const response = await api.get<ApiResponse<Tutorial[]>>(`/api/tutorials/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
};

/**
 * 과외 등록 (인증 필요 - 멘토만)
 */
export const createTutorial = async (data: TutorialCreateRequest): Promise<ApiResponse<Tutorial>> => {
    const response = await api.post<ApiResponse<Tutorial>>('/api/tutorials', data);
    return response.data;
};

/**
 * 과외 수정 (인증 필요 - 멘토만)
 */
export const updateTutorial = async (
    tutorialId: number,
    data: TutorialUpdateRequest
): Promise<ApiResponse<Tutorial>> => {
    const response = await api.put<ApiResponse<Tutorial>>(`/api/tutorials/${tutorialId}`, data);
    return response.data;
};

/**
 * 과외 삭제 (인증 필요 - 멘토만)
 */
export const deleteTutorial = async (tutorialId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/tutorials/${tutorialId}`);
    return response.data;
};

/**
 * 멘토의 과외 목록 조회
 */
export const getMentorTutorials = async (mentorId: number): Promise<ApiResponse<Tutorial[]>> => {
    const response = await api.get<ApiResponse<Tutorial[]>>(`/api/mentors/${mentorId}/tutorials`);
    return response.data;
};

/**
 * 내 과외 목록 조회 (멘토용)
 */
export const getMyTutorials = async (): Promise<ApiResponse<Tutorial[]>> => {
    const response = await api.get<ApiResponse<Tutorial[]>>('/api/tutorials/my');
    return response.data;
};
