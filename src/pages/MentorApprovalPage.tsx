import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import * as adminApi from '@/api/admin';
import type { PendingMentor } from '@/api/admin';

/** 멘토 거절 사유 옵션 */
const REJECT_REASONS = [
    '경력 증빙 서류 미흡',
    '멘토 조건 미충족',
    '부적절한 정보 기재',
    '기타 (직접 입력)'
];

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export default function MentorApprovalPage() {
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [mentors, setMentors] = useState<PendingMentor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 거절 모달 상태
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<PendingMentor | null>(null);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // ADMIN 아니면 홈으로 리다이렉트
    useEffect(() => {
        if (!authLoading && user?.role !== 'ADMIN') {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    // 데이터 로드
    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchMentors();
        }
    }, [user]);

    const fetchMentors = async () => {
        try {
            const response = await adminApi.getPendingMentors();
            if (response.success) {
                setMentors(response.data);
            }
        } catch (error) {
            console.error('멘토 목록 로딩 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 멘토 승인
    const handleApprove = async (mentorId: number) => {
        if (!confirm('이 멘토를 승인하시겠습니까?')) return;

        setIsProcessing(true);
        try {
            const response = await adminApi.approveMentor(mentorId);
            if (response.success) {
                alert('멘토가 승인되었습니다.');
                setMentors(prev => prev.filter(m => m.mentorId !== mentorId));
            }
        } catch (error) {
            console.error('멘토 승인 실패:', error);
            alert('승인 처리에 실패했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    // 거절 모달 열기
    const openRejectModal = (mentor: PendingMentor) => {
        setSelectedMentor(mentor);
        setSelectedReason('');
        setCustomReason('');
        setIsRejectModalOpen(true);
    };

    // 멘토 거절
    const handleReject = async () => {
        if (!selectedMentor) return;

        const reason = selectedReason === '기타 (직접 입력)' ? customReason : selectedReason;

        if (!reason.trim()) {
            alert('거절 사유를 입력해주세요.');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await adminApi.rejectMentor(selectedMentor.mentorId, reason);
            if (response.success) {
                alert('멘토 신청이 거절되었습니다.');
                setMentors(prev => prev.filter(m => m.mentorId !== selectedMentor.mentorId));
                setIsRejectModalOpen(false);
            }
        } catch (error) {
            console.error('멘토 거절 실패:', error);
            alert('거절 처리에 실패했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    // 로딩 중이거나 ADMIN 아니면 표시 안 함
    if (authLoading || user?.role !== 'ADMIN') {
        return (
            <div className="pt-16 min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="pt-16 min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    return (
        <div>
            {/* 헤더 */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold">멘토 승인 관리</h1>
                <p className="text-muted-foreground mt-2">
                    멘토 신청을 검토하고 승인 또는 거절합니다.
                </p>
            </div>

            {/* 대기 중인 멘토 수 */}
            <div className="mb-6">
                <Badge variant="secondary" className="text-sm">
                    승인 대기 {mentors.length}건
                </Badge>
            </div>

            {/* 멘토 목록 */}
            {mentors.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-muted-foreground mb-4">check_circle</span>
                        <p className="text-lg font-medium">승인 대기 중인 멘토가 없습니다</p>
                        <p className="text-muted-foreground mt-1">모든 신청이 처리되었습니다.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {mentors.map((mentor) => (
                        <Card key={mentor.mentorId}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    {/* 멘토 정보 */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {mentor.nickname[0]}
                        </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{mentor.nickname}</h3>
                                                <p className="text-sm text-muted-foreground">{mentor.email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">경력 사항</p>
                                                <p className="text-sm mt-1 whitespace-pre-wrap">
                                                    {mentor.career || '(작성된 경력 없음)'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          신청일: {formatDate(mentor.createdAt)}
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 액션 버튼 */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => openRejectModal(mentor)}
                                            disabled={isProcessing}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <span className="material-symbols-outlined text-sm mr-1">close</span>
                                            거절
                                        </Button>
                                        <Button
                                            onClick={() => handleApprove(mentor.mentorId)}
                                            disabled={isProcessing}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <span className="material-symbols-outlined text-sm mr-1">check</span>
                                            승인
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* 거절 모달 */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>멘토 신청 거절</DialogTitle>
                        <DialogDescription>
                            {selectedMentor?.nickname}님의 멘토 신청을 거절합니다.
                            거절 사유를 선택해주세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* 거절 사유 선택 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">거절 사유</label>
                            <Select value={selectedReason} onValueChange={setSelectedReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="거절 사유를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REJECT_REASONS.map((reason) => (
                                        <SelectItem key={reason} value={reason}>
                                            {reason}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 기타 사유 직접 입력 */}
                        {selectedReason === '기타 (직접 입력)' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">거절 사유 입력</label>
                                <Textarea
                                    placeholder="거절 사유를 직접 입력해주세요..."
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectModalOpen(false)}
                            disabled={isProcessing}
                        >
                            취소
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isProcessing || !selectedReason}
                        >
                            {isProcessing ? '처리 중...' : '거절하기'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}