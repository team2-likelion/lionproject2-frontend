import api from './client';
import type { ApiResponse } from './client';

export type SettlementStatus = 'PENDING' | 'COMPLETED';

export interface Settlement {
  settlementId: number;
  mentorId: number;
  mentorName: string;
  settlementPeriod: string; // "yyyy-MM" 형식
  totalAmount: number;
  platformFee: number;
  settlementAmount: number;
  refundAmount?: number; // 환불 금액 (백엔드에서 추가될 예정)
  finalSettlementAmount: number;
  status: SettlementStatus;
  settledAt: string | null;
  createdAt: string;
}

export interface SettlementDetail {
  paymentId: number;
  tutorialId: number;
  tutorialTitle: string;
  paymentAmount: number;
  platformFee: number;
  settlementAmount: number;
  paidAt: string | null;
}

export interface SettlementDetailResponse {
  settlement: Settlement;
  details: SettlementDetail[];
}

export interface GetSettlementListParams {
  status?: SettlementStatus;
  startPeriod?: string; // "yyyy-MM" 형식
  endPeriod?: string; // "yyyy-MM" 형식
}

/**
 * 정산 목록 조회
 * GET /api/settlements?status=PENDING&startPeriod=2024-01&endPeriod=2024-12
 */
export const getSettlementList = async (
  params?: GetSettlementListParams
): Promise<ApiResponse<Settlement[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startPeriod) queryParams.append('startPeriod', params.startPeriod);
  if (params?.endPeriod) queryParams.append('endPeriod', params.endPeriod);

  const queryString = queryParams.toString();
  const url = queryString ? `/api/settlements?${queryString}` : '/api/settlements';
  
  const response = await api.get<ApiResponse<Settlement[]>>(url);
  return response.data;
};

/**
 * 정산 상세 조회
 * GET /api/settlements/{settlementId}
 */
export const getSettlementDetail = async (
  settlementId: number
): Promise<ApiResponse<SettlementDetailResponse>> => {
  const response = await api.get<ApiResponse<SettlementDetailResponse>>(
    `/api/settlements/${settlementId}`
  );
  return response.data;
};

/**
 * 정산 지급 완료 처리
 * POST /api/settlements/{settlementId}/complete
 */
export const completeSettlement = async (
  settlementId: number
): Promise<ApiResponse<Settlement>> => {
  const response = await api.post<ApiResponse<Settlement>>(
    `/api/settlements/${settlementId}/complete`
  );
  return response.data;
};

/**
 * 정산 생성 (Spring Batch Job 실행)
 * POST /api/settlements
 */
export const createSettlement = async (
  settlementPeriod: string // "YYYY-MM" 형식
): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>('/api/settlements', {
    settlementPeriod,
  });
  return response.data;
};
