import api from './client';
import type { ApiResponse } from './client';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'REFUND_REJECTED';

export interface PaymentCreateResponse {
  paymentId: number;
  merchantUid: string;
  amount: number;
  tutorialTitle: string;
}

export interface PaymentVerifyResponse {
  ticketId: number;
  remainingCount: number;
  message: string;
}

export interface Ticket {
  id: number;
  tutorialId: number;
  tutorialTitle: string;
  mentorNickname: string;
  totalCount: number;
  remainingCount: number;
  expiredAt: string | null;
  expired: boolean;
  createdAt: string;
}

export interface PaymentHistory {
  paymentId: number;
  tutorialId: number;
  tutorialTitle: string;
  mentorName: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface RefundRequestItem {
  paymentId: number;
  tutorialId: number;
  tutorialTitle: string;
  mentorName: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export const createPayment = async (
  tutorialId: number,
  count: number
): Promise<ApiResponse<PaymentCreateResponse>> => {
  const response = await api.post<ApiResponse<PaymentCreateResponse>>(
    `/api/tutorials/${tutorialId}/payments`,
    { count }
  );
  return response.data;
};

export const verifyPayment = async (
  paymentId: number,
  impUid: string
): Promise<ApiResponse<PaymentVerifyResponse>> => {
  const response = await api.post<ApiResponse<PaymentVerifyResponse>>(
    `/api/payments/${paymentId}/verify`,
    { impUid }
  );
  return response.data;
};

export const getMyTickets = async (): Promise<ApiResponse<Ticket[]>> => {
  const response = await api.get<ApiResponse<Ticket[]>>('/api/tickets/my');
  return response.data;
};

export const getMyPayments = async (): Promise<ApiResponse<PaymentHistory[]>> => {
  const response = await api.get<ApiResponse<PaymentHistory[]>>('/api/payments/my');
  return response.data;
};

export const requestRefund = async (paymentId: number): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>(`/api/payments/${paymentId}/refund/request`);
  return response.data;
};

export const cancelRefundRequest = async (paymentId: number): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>(`/api/payments/${paymentId}/refund/cancel`);
  return response.data;
};

export const getRefundRequests = async (): Promise<ApiResponse<RefundRequestItem[]>> => {
  const response = await api.get<ApiResponse<RefundRequestItem[]>>('/api/admin/payments/refund-requests');
  return response.data;
};

export const approveRefund = async (paymentId: number): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>(`/api/payments/${paymentId}/refund/approve`);
  return response.data;
};

export const rejectRefund = async (paymentId: number): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>(`/api/payments/${paymentId}/refund/reject`);
  return response.data;
};
