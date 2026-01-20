import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PaymentState {
  paymentId?: string;
  tutorialTitle?: string;
  amount?: number;
  mentorName?: string;
  scheduledAt?: string;
}

export default function PaymentCompletePage() {
  const location = useLocation();
  const state = location.state as PaymentState | null;

  // 결제 정보 (state가 없으면 기본값 사용) - useState로 초기화하여 불순 함수 문제 해결
  const [paymentInfo] = useState(() => ({
    tutorialTitle: state?.tutorialTitle || 'React & Next.js 엔터프라이즈 아키텍처 1:1 멘토링',
    mentorName: state?.mentorName || 'DevMaster Kim',
    amount: state?.amount || 150000,
    scheduledAt: state?.scheduledAt || '2024년 1월 22일 19:00',
    paymentId: state?.paymentId || `LION-${Date.now()}`,
    paidAt: new Date().toLocaleString('ko-KR'),
  }));

  return (
    <div className="pt-16">
      <main className="flex flex-1 justify-center py-12 px-6 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col max-w-[640px] w-full items-center">
          {/* Success Header */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
              <span className="material-symbols-outlined text-5xl">check_circle</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight pb-3">결제가 완료되었습니다!</h1>
            <p className="text-muted-foreground text-base max-w-[480px]">
              결제가 성공적으로 처리되었습니다. 이제 멘토와 함께 성장을 시작하세요! 확인 메일이 발송되었습니다.
            </p>
          </div>

          {/* Payment Summary Card */}
          <Card className="w-full shadow-2xl mb-8 overflow-hidden">
            {/* Card Hero */}
            <div className="w-full h-32 bg-gradient-to-r from-primary to-indigo-600 flex items-center px-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-[120px] absolute -right-4 -bottom-4 rotate-12 text-white">
                  payments
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-white text-lg font-bold">결제 상세 내역</h3>
                <p className="text-white/70 text-sm">
                  아래에서 수업 및 결제 정보를 확인하실 수 있습니다.
                </p>
              </div>
            </div>

            {/* Description List */}
            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between gap-x-6 py-3 border-b">
                <p className="text-muted-foreground text-sm font-medium">수업 명</p>
                <p className="text-sm font-semibold text-right">
                  {paymentInfo.tutorialTitle}
                </p>
              </div>
              <div className="flex justify-between gap-x-6 py-3 border-b">
                <p className="text-muted-foreground text-sm font-medium">멘토</p>
                <p className="text-sm font-semibold text-right">{paymentInfo.mentorName}</p>
              </div>
              <div className="flex justify-between gap-x-6 py-3 border-b">
                <p className="text-muted-foreground text-sm font-medium">결제 금액</p>
                <p className="text-primary text-lg font-bold text-right">₩{paymentInfo.amount.toLocaleString()}</p>
              </div>
              <div className="flex justify-between gap-x-6 py-3 border-b">
                <p className="text-muted-foreground text-sm font-medium">결제 일시</p>
                <p className="text-sm text-right">{paymentInfo.paidAt}</p>
              </div>
              <div className="flex justify-between gap-x-6 py-3 border-b">
                <p className="text-muted-foreground text-sm font-medium">주문 번호</p>
                <p className="text-sm text-right font-mono text-muted-foreground">{paymentInfo.paymentId}</p>
              </div>
              <div className="flex justify-between gap-x-6 py-3">
                <p className="text-muted-foreground text-sm font-medium">수업 예정일</p>
                <p className="text-sm text-right">{paymentInfo.scheduledAt}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button className="min-w-[200px] h-12 shadow-lg shadow-primary/20" asChild>
              <Link to="/mypage">
                <span className="material-symbols-outlined mr-2">menu_book</span>
                수업 상세 보기
              </Link>
            </Button>
            <Button variant="outline" className="min-w-[200px] h-12" asChild>
              <Link to="/">
                <span className="material-symbols-outlined mr-2">home</span>
                홈으로 이동
              </Link>
            </Button>
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-xs">
              문제가 발생했나요?{' '}
              <Link to="#" className="text-primary hover:underline underline-offset-4">
                DevSolve 고객센터
              </Link>
              로 문의주세요.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
