import api from './client';
import type { ApiResponse } from './client';

// 질문 타입
export interface Question {
  id: number;
  questionId?: number;
  lessonId: number;
  menteeId: number;
  menteeNickname: string;
  title: string;
  content: string;
  codeContent: string | null;
  answerCount: number;
  createdAt: string;
  updatedAt: string;
}

// 질문 상세 타입 (답변 포함)
export interface QuestionDetail extends Question {
  answers: Answer[];
}

// 답변 타입
export interface Answer {
  id: number;
  questionId: number;
  mentorId: number;
  mentorNickname: string;
  content: string;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

// 질문 등록 요청 타입
export interface QuestionCreateRequest {
  title: string;
  content: string;
  codeContent?: string;
}

// 답변 등록 요청 타입
export interface AnswerCreateRequest {
  content: string;
}

/**
 * 질문 등록 (멘티)
 */
export const createQuestion = async (
  lessonId: number,
  data: QuestionCreateRequest
): Promise<ApiResponse<Question>> => {
  const response = await api.post<ApiResponse<Question>>(
    `/api/lessons/${lessonId}/questions`,
    data
  );
  return response.data;
};

/**
 * 수업별 질문 목록 조회
 */
export const getQuestionsByLesson = async (lessonId: number): Promise<ApiResponse<Question[]>> => {
  const response = await api.get<ApiResponse<Question[]>>(`/api/lessons/${lessonId}/questions`);
  return response.data;
};

/**
 * 질문 상세 조회 (답변 포함)
 */
export const getQuestion = async (questionId: number): Promise<ApiResponse<QuestionDetail>> => {
  const response = await api.get<ApiResponse<QuestionDetail>>(`/api/questions/${questionId}`);
  return response.data;
};

/**
 * 답변 등록 (멘토)
 */
export const createAnswer = async (
  questionId: number,
  data: AnswerCreateRequest
): Promise<ApiResponse<Answer>> => {
  const response = await api.post<ApiResponse<Answer>>(
    `/api/questions/${questionId}/answers`,
    data
  );
  return response.data;
};

/**
 * 답변 채택 (멘티)
 */
export const acceptAnswer = async (answerId: number): Promise<ApiResponse<Answer>> => {
  const response = await api.put<ApiResponse<Answer>>(`/api/answers/${answerId}/accept`);
  return response.data;
};

/**
 * 질문 목록 조회
 */
export const getMyQuestions = async (role?: string): Promise<ApiResponse<Question[]>> => {
    const response = await api.get<ApiResponse<Question[]>>('/api/questions/my', {
        params: { role: role || 'MENTEE' }
    });
    return response.data;
};
