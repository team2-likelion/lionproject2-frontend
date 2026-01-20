import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import * as tutorialApi from '@/api/tutorial';
import * as reviewApi from '@/api/review';
import * as paymentApi from '@/api/payment';
import { useAuth } from '@/contexts/AuthContext';
import { LessonBookingDialog } from '@/components/booking/LessonBookingDialog';
import { AvailabilityCalendar } from '@/components/booking/AvailabilityCalendar';
import type { Tutorial } from '@/api/tutorial';
import type { Review } from '@/api/review';
import type { Ticket } from '@/api/payment';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function TutorialDetailPage() {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalElements, setReviewTotalElements] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 예약 관련 상태
  const [userTicket, setUserTicket] = useState<Ticket | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCheckingTicket, setIsCheckingTicket] = useState(false);
  const [initialSelectedDate, setInitialSelectedDate] = useState<Date | undefined>();

  // Fetch tutorial and reviews
  useEffect(() => {
    const fetchData = async () => {
      if (!tutorialId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [tutorialRes, reviewsRes] = await Promise.all([
          tutorialApi.getTutorial(Number(tutorialId)),
          reviewApi.getReviews(Number(tutorialId), { size: 5 }),
        ]);

        if (tutorialRes.success && tutorialRes.data) {
          setTutorial(tutorialRes.data);
        } else {
          setError('과외 정보를 찾을 수 없습니다.');
        }

        if (reviewsRes.success && reviewsRes.data) {
          const reviewData = reviewsRes.data;
          setReviews(reviewData.content || []);
          setReviewTotalElements(reviewData.page?.totalElements || 0);
          setReviewPage(reviewData.page?.number || 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tutorialId]);

  // 수업 신청 버튼 클릭 핸들러
  const handleApplyClick = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!tutorial) return;

    setIsCheckingTicket(true);

    try {
      // 해당 튜토리얼의 티켓 확인
      const ticketsRes = await paymentApi.getMyTickets();

      if (ticketsRes.success && ticketsRes.data) {
        const myTicket = ticketsRes.data.find(
          (t) => t.tutorialId === tutorial.id && t.remainingCount > 0 && !t.expired
        );

        if (myTicket) {
          // 티켓 있음 → 예약 다이얼로그 열기
          setUserTicket(myTicket);
          setIsBookingDialogOpen(true);
        } else {
          // 티켓 없음 → 결제 안내 다이얼로그
          setIsPaymentDialogOpen(true);
        }
      } else {
        // API 실패 시에도 결제 안내
        setIsPaymentDialogOpen(true);
      }
    } catch {
      // 에러 시 결제 안내
      setIsPaymentDialogOpen(true);
    } finally {
      setIsCheckingTicket(false);
    }
  };

  // 예약 성공 핸들러
  const handleBookingSuccess = () => {
    // 예약 성공 후 처리 (예: 마이페이지로 이동 또는 알림)
    alert('수업 신청이 완료되었습니다!');
    navigate('/mypage');
  };

  // 달력에서 날짜 선택 시 예약 다이얼로그 열기
  const handleCalendarDateSelect = (date: Date) => {
    setInitialSelectedDate(date);
    handleApplyClick();
  };

  // 리뷰 더보기 핸들러
  const handleLoadMoreReviews = async () => {
    if (!tutorialId || isLoadingReviews) return;

    setIsLoadingReviews(true);
    try {
      const nextPage = reviewPage + 1;
      const reviewsRes = await reviewApi.getReviews(Number(tutorialId), { 
        page: nextPage, 
        size: 5 
      });

      if (reviewsRes.success && reviewsRes.data) {
        const reviewData = reviewsRes.data;
        setReviews(prev => [...prev, ...(reviewData.content || [])]);
        // totalElements 업데이트 (서버에서 최신 값 받아오기)
        if (reviewData.page?.totalElements !== undefined) {
          setReviewTotalElements(reviewData.page.totalElements);
        }
        setReviewPage(nextPage);
      }
    } catch (err) {
      console.error('리뷰 로딩 실패:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">error</span>
          <p className="text-lg text-muted-foreground">{error || '과외를 찾을 수 없습니다.'}</p>
            <Button className="mt-4" onClick={() => navigate('/tutorials')}>
            과외 목록으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">홈</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link to="/tutorials" className="hover:text-primary">과외 찾기</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-foreground font-medium">과외 상세 정보</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{tutorial.title}</h1>

          <div className="flex flex-wrap items-center gap-6">
            <Link to={`/mentor/${tutorial.mentorId}`} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{tutorial.mentorNickname?.[0] || 'M'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-primary font-semibold hover:underline flex items-center gap-1">
                  {tutorial.mentorNickname}
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 border-l pl-6 h-10">
              <div className="flex text-amber-400">
                {[...Array(Math.floor(tutorial.rating || 0))].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
                {(tutorial.rating || 0) % 1 >= 0.5 && (
                  <span className="material-symbols-outlined text-sm">star_half</span>
                )}
              </div>
              <span className="font-bold">{tutorial.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-muted-foreground text-sm">({tutorial.reviewCount || 0}개의 리뷰)</span>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {tutorial.skills.map((skill, index) => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              const skillKey = typeof skill === 'string' ? `skill-${index}` : skill.id;
              return (
                <Badge key={skillKey} variant="secondary">{skillName}</Badge>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/50 p-6 rounded-xl border">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">회당 가격</span>
                <span className="font-bold">₩{tutorial.price.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">수업 시간</span>
                <span className="font-bold">{tutorial.duration}분</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">난이도</span>
                <span className="font-bold">중급</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">방식</span>
                <span className="font-bold">온라인 (줌/구글밋)</span>
              </div>
            </div>

            {/* Description */}
            <section>
              <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-4">
                과외 상세 설명
              </h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {tutorial.description || '상세 설명이 없습니다.'}
              </div>
            </section>

            {/* Reviews */}
            <section className="pt-6 border-t">
              <h2 className="text-xl font-bold mb-6">수업 후기</h2>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">아직 작성된 리뷰가 없습니다.</p>
              ) : (
                <div className="space-y-10">
                  {reviews.map((review) => (
                    <div key={review.id} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{review.menteeNickname?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{review.menteeNickname}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                            {[...Array(review.rating)].map((_, i) => (
                              <span
                                key={i}
                                className="material-symbols-outlined text-sm"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                            ))}
                            <span className="text-foreground text-xs font-bold ml-1">{review.rating}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                    </div>
                  ))}
                  {reviewTotalElements > reviews.length && reviews.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleLoadMoreReviews}
                      disabled={isLoadingReviews}
                    >
                      {isLoadingReviews ? (
                        <>
                          <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                          로딩 중...
                        </>
                      ) : (
                        '더보기'
                      )}
                    </Button>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-[380px]">
            <div className="sticky top-24 space-y-4">
              {/* CTA Card */}
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-bold">₩{tutorial.price.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">/ 1회</span>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-muted-foreground">schedule</span>
                      <span>1회 {tutorial.duration}분 수업</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-muted-foreground">chat_bubble</span>
                      <span>평균 응답 시간 1시간 이내</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-emerald-500">
                      <span className="material-symbols-outlined">check_circle</span>
                      <span className="font-medium">수업 전 무료 상담 15분 제공</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 shadow-lg shadow-primary/20 mb-3"
                    onClick={handleApplyClick}
                    disabled={isCheckingTicket}
                  >
                    {isCheckingTicket ? (
                      <>
                        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                        확인 중...
                      </>
                    ) : (
                      <>
                        수업 신청하기
                        <span className="material-symbols-outlined ml-2">arrow_forward</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Availability Calendar */}
              <AvailabilityCalendar
                tutorialId={tutorial.id}
                mentorId={tutorial.mentorId}
                onDateSelect={handleCalendarDateSelect}
              />
            </div>
          </aside>
        </div>

        {/* 티켓 보유 시: 달력 기반 예약 다이얼로그 */}
        {userTicket && (
          <LessonBookingDialog
            open={isBookingDialogOpen}
            onOpenChange={(open) => {
              setIsBookingDialogOpen(open);
              if (!open) setInitialSelectedDate(undefined);  // 다이얼로그 닫힐 때 초기 날짜 초기화
            }}
            tutorial={tutorial}
            ticket={userTicket}
            onSuccess={handleBookingSuccess}
            initialDate={initialSelectedDate}
          />
        )}

        {/* 티켓 미보유 시: 결제 안내 다이얼로그 */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>수강권 구매 필요</DialogTitle>
              <DialogDescription>
                이 과외를 예약하려면 먼저 수강권을 구매해야 합니다.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4 border">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-3xl text-primary">school</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold">{tutorial.title}</p>
                  <p className="text-sm text-muted-foreground">{tutorial.duration}분 수업</p>
                  <p className="text-lg font-bold text-primary mt-1">
                    ₩{tutorial.price.toLocaleString()} / 회
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                취소
              </Button>
              <Button asChild>
                <Link to={`/payment/${tutorial.id}`}>
                  수강권 구매하기
                  <span className="material-symbols-outlined ml-2">payments</span>
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
