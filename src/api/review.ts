import api from './client';
import type { ApiResponse } from './client';

// 리뷰 타입
export interface Review {
  id: number;
  tutorialId: number;
  menteeId: number;
  menteeNickname: string;
  rating: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

// 리뷰 목록 응답 타입
export interface ReviewListResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// 리뷰 작성 요청 타입 (백엔드: PostReviewCreateRequest)
export interface ReviewCreateRequest {
  rating: number;   // @Min(1) @Max(5)
  content: string;  // 필수 (백엔드: @NotBlank @Size(max=500))
}

// 리뷰 수정 요청 타입
export interface ReviewUpdateRequest {
  rating?: number;
  content?: string;
}

/**
 * 리뷰 작성 (멘티)
 */
export const createReview = async (
  tutorialId: number,
  data: ReviewCreateRequest
): Promise<ApiResponse<Review>> => {
  const response = await api.post<ApiResponse<Review>>(
    `/api/tutorials/${tutorialId}/reviews`,
    data
  );
  return response.data;
};

/**
 * 리뷰 목록 조회 (공개, 페이지네이션)
 */
export const getReviews = async (
  tutorialId: number,
  params?: {
    page?: number;
    size?: number;
    sort?: string;
  }
): Promise<ApiResponse<ReviewListResponse>> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', String(params.page));
  if (params?.size !== undefined) queryParams.append('size', String(params.size));
  if (params?.sort) queryParams.append('sort', params.sort);

  const url = `/api/tutorials/${tutorialId}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get<ApiResponse<ReviewListResponse>>(url);
  return response.data;
};

/**
 * 내 리뷰 조회
 */
export const getMyReview = async (tutorialId: number): Promise<ApiResponse<Review>> => {
  const response = await api.get<ApiResponse<Review>>(
    `/api/tutorials/${tutorialId}/reviews/me`
  );
  return response.data;
};

/**
 * 리뷰 수정 (멘티)
 */
export const updateReview = async (
  tutorialId: number,
  reviewId: number,
  data: ReviewUpdateRequest
): Promise<ApiResponse<Review>> => {
  const response = await api.patch<ApiResponse<Review>>(
    `/api/tutorials/${tutorialId}/reviews/${reviewId}`,
    data
  );
  return response.data;
};

/**
 * 리뷰 삭제 (멘티)
 */
export const deleteReview = async (
  tutorialId: number,
  reviewId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(
    `/api/tutorials/${tutorialId}/reviews/${reviewId}`
  );
  return response.data;
};
