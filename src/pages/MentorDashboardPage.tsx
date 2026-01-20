import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as lessonApi from '@/api/lesson';
import * as tutorialApi from '@/api/tutorial';
import * as mentorApi from '@/api/mentor';
import type { Lesson } from '@/api/lesson';
import type { Tutorial } from '@/api/tutorial';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(status: string): { label: string; className: string } {
  const statusMap: Record<string, { label: string; className: string }> = {
    REQUESTED: { label: '대기중', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
    CONFIRMED: { label: '확정', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
    IN_PROGRESS: { label: '진행중', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    COMPLETED: { label: '완료', className: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600' },
    REJECTED: { label: '거절됨', className: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
  };
  return statusMap[status] || { label: status, className: 'bg-slate-100 text-slate-600' };
}

export default function MentorDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [lessonRequests, setLessonRequests] = useState<Lesson[]>([]);
  const [myTutorials, setMyTutorials] = useState<Tutorial[]>([]);
  const [mentorId, setMentorId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== 'MENTOR') {
      navigate('/mypage');
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, user, navigate]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [requestsRes, tutorialsRes, mentorRes] = await Promise.all([
                lessonApi.getLessonRequests(),
                tutorialApi.getMyTutorials(),
                mentorApi.getMyMentorProfile(),
            ]);

            if (requestsRes.success && requestsRes.data?.lessons) {
                setLessonRequests(requestsRes.data.lessons);
            }
            if (tutorialsRes.success && Array.isArray(tutorialsRes.data)) {
                setMyTutorials(tutorialsRes.data);
            }
            if (mentorRes.success && mentorRes.data) {
                setMentorId(mentorRes.data.mentorId);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

  const handleConfirmLesson = async (lessonId: number) => {
    try {
      const res = await lessonApi.confirmLesson(lessonId);
      if (res.success) {
        setLessonRequests(prev => prev.map(l =>
          l.lessonId === lessonId ? { ...l, status: 'CONFIRMED' as const } : l
        ));
        alert('수업을 확정했습니다.');
      }
    } catch {
      alert('수업 확정에 실패했습니다.');
    }
  };

  const handleRejectLesson = async (lessonId: number) => {
    // 백엔드 PutLessonRejectRequest: rejectReason 필드 필수 (@NotBlank)
    const rejectReason = prompt('거절 사유를 입력해주세요 (필수):');
    if (!rejectReason || !rejectReason.trim()) {
      alert('거절 사유는 필수입니다.');
      return;
    }

    try {
      const res = await lessonApi.rejectLesson(lessonId, rejectReason.trim());
      if (res.success) {
        setLessonRequests(prev => prev.map(l =>
          l.lessonId === lessonId ? { ...l, status: 'REJECTED' as const } : l
        ));
        alert('수업을 거절했습니다.');
      }
    } catch {
      alert('수업 거절에 실패했습니다.');
    }
  };

  const handleCompleteLesson = async (lessonId: number) => {
    try {
      const res = await lessonApi.completeLesson(lessonId);
      if (res.success) {
        setLessonRequests(prev => prev.map(l =>
          l.lessonId === lessonId ? { ...l, status: 'COMPLETED' as const } : l
        ));
        alert('수업이 완료되었습니다.');
      }
    } catch {
      alert('수업 완료 처리에 실패했습니다.');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  // Stats calculation
  const pendingRequests = lessonRequests.filter(l => l.status === 'REQUESTED');
  const activeLessons = lessonRequests.filter(l => ['CONFIRMED', 'IN_PROGRESS'].includes(l.status));
  const completedLessons = lessonRequests.filter(l => l.status === 'COMPLETED');

  const stats = [
    { label: '등록된 과외', value: String(myTutorials.length), icon: 'school', color: 'blue' },
    { label: '대기중인 요청', value: String(pendingRequests.length), icon: 'pending', color: 'yellow' },
    { label: '진행중인 수업', value: String(activeLessons.length), icon: 'play_circle', color: 'green' },
    { label: '완료된 수업', value: String(completedLessons.length), icon: 'check_circle', color: 'purple' },
  ];

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">멘토 대시보드</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              안녕하세요, {user?.nickname} 멘토님!
            </p>
          </div>
          <Link
            to="/tutorial/create"
            className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            새 과외 등록
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`material-symbols-outlined text-${stat.color}-500`}>{stat.icon}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lesson Requests */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">수업 관리</h2>
              {pendingRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingRequests.length} 대기
                </span>
              )}
            </div>
            {lessonRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                <p>수업 요청이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessonRequests.filter(l => l.status !== 'REJECTED').slice(0, 10).map((lesson) => {
                  const status = getStatusLabel(lesson.status);
                  return (
                    <div
                      key={lesson.lessonId}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-primary">person</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white">{lesson.menteeName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{lesson.tutorialTitle}</p>
                          {lesson.scheduledAt && (
                            <p className="text-xs text-slate-400">{formatDate(lesson.scheduledAt)}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${status.className}`}>
                        {status.label}
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
                        {lesson.status === 'REQUESTED' && (
                          <>
                            <button
                              onClick={() => handleConfirmLesson(lesson.lessonId)}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              수락
                            </button>
                            <button
                              onClick={() => handleRejectLesson(lesson.lessonId)}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              거절
                            </button>
                          </>
                        )}
                        {['CONFIRMED', 'IN_PROGRESS'].includes(lesson.status) && (
                          <button
                            onClick={() => handleCompleteLesson(lesson.lessonId)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            완료
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Tutorials */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">내 과외</h2>
            </div>
            {myTutorials.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2">school</span>
                <p>등록된 과외가 없습니다.</p>
                <Link to="/tutorial/create" className="text-primary font-medium mt-2 inline-block hover:underline">
                  과외 등록하기
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myTutorials.map((tutorial) => (
                  <Link
                    key={tutorial.id}
                    to={`/tutorial/${tutorial.id}`}
                    className="block p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">{tutorial.title}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">₩{tutorial.price.toLocaleString()}/회</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        tutorial.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tutorial.status === 'ACTIVE' ? '활성' : '비활성'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span className="material-symbols-outlined text-sm">star</span>
                      {tutorial.rating?.toFixed(1) || '0.0'} ({tutorial.reviewCount || 0}개 리뷰)
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link
              to="/tutorial/create"
              className="block w-full mt-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors text-center"
            >
              새 과외 등록하기
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            to={mentorId ? `/mentor/${mentorId}` : '/mentor/dashboard'}
            className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors"
          >
            <span className="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-300">person</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">프로필 관리</span>
          </Link>
          <Link
            to="/qna"
            className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors"
          >
            <span className="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-300">reviews</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Q&A 관리</span>
          </Link>
          <Link
            to="/mypage/payments"
            className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors"
          >
            <span className="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-300">account_balance</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">수익 관리</span>
          </Link>
          <Link
            to="/mentor/settlements"
            className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors"
          >
            <span className="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-300">receipt_long</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">정산 내역</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
