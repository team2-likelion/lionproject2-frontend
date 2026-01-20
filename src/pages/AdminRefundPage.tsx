import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as paymentApi from '@/api/payment';
import type { PaymentStatus, RefundRequestItem } from '@/api/payment';
import { API_BASE_URL } from '@/api/client';

const PAGE_SIZE = 10;

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status: PaymentStatus) {
  switch (status) {
    case 'REFUND_REQUESTED':
      return (
        <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
          대기
        </span>
      );
    case 'REFUNDED':
      return (
        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
          승인
        </span>
      );
    case 'REFUND_REJECTED':
      return (
        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
          거절
        </span>
      );
    case 'PAID':
      return (
        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
          결제완료
        </span>
      );
    default:
      return (
        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
          -
        </span>
      );
  }
}

export default function AdminRefundPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RefundRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await paymentApi.getRefundRequests();
      if (res.success && res.data) {
        setRequests(res.data);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch refund requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchRequests();
    }
  }, [authLoading, isAuthenticated, navigate, fetchRequests]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const streamUrl = `${API_BASE_URL}/api/admin/payments/refund-requests/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    const handleUpdate = () => {
      fetchRequests();
    };

    eventSource.addEventListener('refundUpdate', handleUpdate);
    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener('refundUpdate', handleUpdate);
      eventSource.close();
    };
  }, [isAuthenticated, fetchRequests]);

  const handleApprove = async (paymentId: number) => {
    if (!confirm('해당 환불 요청을 승인할까요?')) return;
    setProcessingId(paymentId);
    try {
      const res = await paymentApi.approveRefund(paymentId);
      if (res.success) {
        await fetchRequests();
      } else {
        alert('환불 승인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to approve refund:', error);
      alert('환불 승인 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paymentId: number) => {
    if (!confirm('해당 환불 요청을 거절할까요?')) return;
    setProcessingId(paymentId);
    try {
      const res = await paymentApi.rejectRefund(paymentId);
      if (res.success) {
        await fetchRequests();
      } else {
        alert('환불 거절에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to reject refund:', error);
      alert('환불 거절 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const sortedRequests = useMemo(
    () =>
      [...requests].sort((a, b) => {
        const aTime = new Date(a.paidAt || a.createdAt).getTime();
        const bTime = new Date(b.paidAt || b.createdAt).getTime();
        return bTime - aTime;
      }),
    [requests]
  );

  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sortedRequests.slice(pageStart, pageStart + PAGE_SIZE);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">환불 관리</h1>
            <p className="text-slate-500 dark:text-slate-400">
              환불 요청을 확인하고 승인 또는 거절을 처리하세요.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            새로고침
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="col-span-4">튜토리얼 / 멘토</div>
            <div className="col-span-2">결제일</div>
            <div className="col-span-2">금액</div>
            <div className="col-span-2">상태</div>
            <div className="col-span-2 text-right">처리</div>
          </div>

          {pageItems.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
                assignment_turned_in
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                대기 중인 환불 요청이 없습니다
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                새로운 환불 요청이 접수되면 이곳에서 처리할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {pageItems.map((request) => (
                <div
                  key={request.paymentId}
                  className="px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <div className="md:col-span-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">receipt_long</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {request.tutorialTitle}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          멘토: {request.mentorName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(request.paidAt || request.createdAt)}
                  </div>
                  <div className="md:col-span-2 text-sm font-bold text-slate-900 dark:text-white">
                    ₩{request.amount.toLocaleString()}
                  </div>
                  <div className="md:col-span-2">
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="md:col-span-2 flex md:justify-end gap-2">
                    {request.status === 'REFUND_REQUESTED' ? (
                      <>
                        <button
                          onClick={() => handleApprove(request.paymentId)}
                          disabled={processingId === request.paymentId}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === request.paymentId ? '처리중...' : '승인'}
                        </button>
                        <button
                          onClick={() => handleReject(request.paymentId)}
                          disabled={processingId === request.paymentId}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === request.paymentId ? '처리중...' : '거절'}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">처리 완료</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {sortedRequests.length > PAGE_SIZE && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
