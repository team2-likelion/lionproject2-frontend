import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as settlementApi from '@/api/settlement';
import type { Settlement, SettlementStatus, SettlementDetailResponse } from '@/api/settlement';

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

function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${year}년 ${parseInt(month)}월`;
}

function getStatusLabel(status: SettlementStatus): { label: string; className: string } {
  const statusMap: Record<SettlementStatus, { label: string; className: string }> = {
    PENDING: { label: '대기중', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
    COMPLETED: { label: '지급완료', className: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  };
  return statusMap[status];
}

export default function AdminSettlementPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<SettlementStatus | ''>('');
  const [startPeriod, setStartPeriod] = useState('');
  const [endPeriod, setEndPeriod] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPeriod, setCreatePeriod] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchSettlements();
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const fetchSettlements = async () => {
    setIsLoading(true);
    try {
      const params: settlementApi.GetSettlementListParams = {};
      if (filterStatus) params.status = filterStatus as SettlementStatus;
      if (startPeriod) params.startPeriod = startPeriod;
      if (endPeriod) params.endPeriod = endPeriod;

      const res = await settlementApi.getSettlementList(params);
      if (res.success && res.data) {
        setSettlements(res.data);
      } else {
        setSettlements([]);
      }
    } catch (error) {
      console.error('정산 목록 조회 실패:', error);
      alert('정산 목록을 불러오는데 실패했습니다.');
      setSettlements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (settlementId: number) => {
    setIsDetailLoading(true);
    try {
      const res = await settlementApi.getSettlementDetail(settlementId);
      if (res.success && res.data) {
        setSelectedSettlement(res.data);
      } else {
        alert('정산 상세 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('정산 상세 조회 실패:', error);
      alert('정산 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCompleteSettlement = async (settlementId: number) => {
    if (!confirm('해당 정산을 지급 완료 처리할까요?')) return;
    setProcessingId(settlementId);
    try {
      const res = await settlementApi.completeSettlement(settlementId);
      if (res.success) {
        await fetchSettlements();
        if (selectedSettlement?.settlement.settlementId === settlementId) {
          await handleViewDetail(settlementId);
        }
        alert('정산 지급 완료 처리되었습니다.');
      } else {
        alert(res.message || '정산 지급 완료 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('정산 지급 완료 처리 실패:', error);
      alert('정산 지급 완료 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleFilter = () => {
    fetchSettlements();
  };

  const handleResetFilter = () => {
    setFilterStatus('');
    setStartPeriod('');
    setEndPeriod('');
    setTimeout(() => {
      fetchSettlements();
    }, 0);
  };

  const handleCreateSettlement = async () => {
    if (!createPeriod || !/^\d{4}-\d{2}$/.test(createPeriod)) {
      alert('정산 기간은 YYYY-MM 형식으로 입력해주세요. (예: 2024-11)');
      return;
    }

    if (!confirm(`${createPeriod} 기간의 정산을 생성하시겠습니까?`)) return;

    setIsCreating(true);
    try {
      const res = await settlementApi.createSettlement(createPeriod);
      if (res.success) {
        alert(res.message || '정산 생성 Job이 시작되었습니다.');
        setShowCreateModal(false);
        setCreatePeriod('');
        // 정산 생성 후 즉시 목록 조회
        await fetchSettlements();
      } else {
        alert(res.message || '정산 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('정산 생성 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '정산 생성 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // 통계 계산
  const totalSettlementAmount = settlements.reduce((sum, s) => sum + s.finalSettlementAmount, 0);
  const totalRefundAmount = settlements.reduce((sum, s) => sum + (s.refundAmount || 0), 0);
  const pendingCount = settlements.filter(s => s.status === 'PENDING').length;
  const completedCount = settlements.filter(s => s.status === 'COMPLETED').length;
  const mentorCount = new Set(settlements.map(s => s.mentorId)).size;

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
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">정산 관리</h1>
            <p className="text-slate-500 dark:text-slate-400">
              모든 멘토의 정산 내역을 확인하고 지급 완료 처리를 할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            정산 생성
          </button>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-blue-500">account_balance_wallet</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">총 정산 금액</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              ₩{totalSettlementAmount.toLocaleString()}
            </p>
          </div>
          {totalRefundAmount > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-orange-500">undo</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">총 환불 금액</span>
              </div>
              <p className="text-2xl font-bold text-orange-500">
                - ₩{totalRefundAmount.toLocaleString()}
              </p>
            </div>
          )}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-yellow-500">pending</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">대기중</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}건</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">지급완료</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedCount}건</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-purple-500">people</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">멘토 수</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{mentorCount}명</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 정산 목록 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 필터 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">필터</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    상태
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as SettlementStatus | '')}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">전체</option>
                    <option value="PENDING">대기중</option>
                    <option value="COMPLETED">지급완료</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      시작 기간 (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={startPeriod}
                      onChange={(e) => setStartPeriod(e.target.value)}
                      placeholder="2024-01"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      종료 기간 (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={endPeriod}
                      onChange={(e) => setEndPeriod(e.target.value)}
                      placeholder="2024-12"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleFilter}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    검색
                  </button>
                  <button
                    onClick={handleResetFilter}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>

            {/* 정산 목록 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">정산 내역</h2>
                <button
                  onClick={fetchSettlements}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  새로고침
                </button>
              </div>
              {settlements.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <span className="material-symbols-outlined text-5xl mb-3">receipt_long</span>
                  <p>정산 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settlements.map((settlement) => {
                    const status = getStatusLabel(settlement.status);
                    return (
                      <div
                        key={settlement.settlementId}
                        onClick={() => handleViewDetail(settlement.settlementId)}
                        className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {settlement.mentorName} - {formatYearMonth(settlement.settlementPeriod)}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center justify-between">
                                <span>총 매출:</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                  ₩{settlement.totalAmount.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>플랫폼 수수료:</span>
                                <span className="font-medium text-red-500">
                                  - ₩{settlement.platformFee.toLocaleString()}
                                </span>
                              </div>
                              {(settlement.refundAmount ?? 0) > 0 && (
                                <div className="flex items-center justify-between">
                                  <span>환불 차감:</span>
                                  <span className="font-medium text-orange-500">
                                    - ₩{(settlement.refundAmount ?? 0).toLocaleString()}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                <span className="font-bold text-slate-900 dark:text-white">정산 금액:</span>
                                <span className="font-bold text-lg text-primary">
                                  ₩{settlement.finalSettlementAmount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            {settlement.settledAt && (
                              <p className="text-xs text-slate-400 mt-3">
                                지급일: {formatDate(settlement.settledAt)}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            {settlement.status === 'PENDING' && (
                              <button
                                onClick={() => handleCompleteSettlement(settlement.settlementId)}
                                disabled={processingId === settlement.settlementId}
                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === settlement.settlementId ? '처리중...' : '지급 처리'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 정산 상세 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">정산 상세</h2>
              {isDetailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
                </div>
              ) : selectedSettlement ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">멘토</h3>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedSettlement.settlement.mentorName}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">정산 기간</h3>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatYearMonth(selectedSettlement.settlement.settlementPeriod)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">상태</h3>
                    {(() => {
                      const status = getStatusLabel(selectedSettlement.settlement.status);
                      return (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${status.className}`}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">총 매출</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        ₩{selectedSettlement.settlement.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">플랫폼 수수료</span>
                      <span className="font-medium text-red-500">
                        - ₩{selectedSettlement.settlement.platformFee.toLocaleString()}
                      </span>
                    </div>
                    {(selectedSettlement.settlement.refundAmount ?? 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">환불 차감</span>
                        <span className="font-medium text-orange-500">
                          - ₩{(selectedSettlement.settlement.refundAmount ?? 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white">정산 금액</span>
                      <span className="font-bold text-primary text-lg">
                        ₩{selectedSettlement.settlement.finalSettlementAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {selectedSettlement.settlement.settledAt && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">지급일</h3>
                      <p className="text-sm text-slate-900 dark:text-white">
                        {formatDate(selectedSettlement.settlement.settledAt)}
                      </p>
                    </div>
                  )}
                  {selectedSettlement.settlement.status === 'PENDING' && (
                    <button
                      onClick={() => handleCompleteSettlement(selectedSettlement.settlement.settlementId)}
                      disabled={processingId === selectedSettlement.settlement.settlementId}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === selectedSettlement.settlement.settlementId ? '처리중...' : '지급 처리'}
                    </button>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                      결제 내역 ({selectedSettlement.details.length}건)
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {selectedSettlement.details.map((detail) => (
                        <div
                          key={detail.paymentId}
                          className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <p className="font-medium text-sm text-slate-900 dark:text-white mb-1 truncate">
                            {detail.tutorialTitle}
                          </p>
                          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between">
                              <span>결제 금액:</span>
                              <span>₩{detail.paymentAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>수수료:</span>
                              <span className="text-red-500">- ₩{detail.platformFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                              <span className="font-medium">정산 금액:</span>
                              <span className="font-medium text-primary">
                                ₩{detail.settlementAmount.toLocaleString()}
                              </span>
                            </div>
                            {detail.paidAt && (
                              <p className="text-xs text-slate-400 mt-1">
                                결제일: {formatDate(detail.paidAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2">info</span>
                  <p className="text-sm">정산 항목을 선택하면 상세 정보가 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 정산 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">정산 생성</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreatePeriod('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              생성할 정산 기간을 입력하세요. (YYYY-MM 형식)
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  정산 기간 (YYYY-MM)
                </label>
                <input
                  type="text"
                  value={createPeriod}
                  onChange={(e) => setCreatePeriod(e.target.value)}
                  placeholder="2024-11"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  maxLength={7}
                />
                <p className="text-xs text-slate-400 mt-1">예: 2024-11 (2024년 11월)</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateSettlement}
                  disabled={isCreating || !createPeriod}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? '생성 중...' : '생성하기'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreatePeriod('');
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
