import api from './client';

/** 승인 대기 중인 멘토 */
export interface PendingMentor {
    mentorId: number;
    userId: number;
    nickname: string;
    email: string;
    career: string;
    createdAt: string;
}

/** API 응답 공통 타입 */
interface ApiResponse<T> {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

/** 승인 대기 중인 멘토 목록 조회 */
export const getPendingMentors = async (): Promise<ApiResponse<PendingMentor[]>> => {
    const response = await api.get<ApiResponse<PendingMentor[]>>('/api/admin/mentors/pending');
    return response.data;
};

/** 멘토 승인 */
export const approveMentor = async (mentorId: number): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/api/admin/mentors/${mentorId}/approve`);
    return response.data;
};

/** 멘토 거절 */
export const rejectMentor = async (mentorId: number, reason: string): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/api/admin/mentors/${mentorId}/reject`, { reason });
    return response.data;
};