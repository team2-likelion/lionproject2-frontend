import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import * as mentorApi from '@/api/mentor';
import type { MentorDetail } from '@/api/mentor';

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  }
  return `${minutes}분`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function MentorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<MentorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || id === 'undefined') {
        navigate('/mentors');
        return;
      }

      setIsLoading(true);
      try {
        const mentorId = parseInt(id);
        const mentorRes = await mentorApi.getMentor(mentorId);

        if (mentorRes.success && mentorRes.data) {
          setMentor(mentorRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch mentor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="pt-16 min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">person_off</span>
        <p className="text-slate-500">멘토를 찾을 수 없습니다.</p>
        <Link to="/mentors" className="mt-4 text-primary hover:underline">멘토 목록으로 돌아가기</Link>
      </div>
    );
  }

    const averageRating = mentor.averageRating || 0;

  return (
    <div className="pt-16">
      <main className="px-4 md:px-20 lg:px-40 py-8 flex justify-center">
        <div className="flex flex-col max-w-[1200px] flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-32 h-32 rounded-full ring-4 ring-primary/10 bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-5xl">person</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                        {mentor.nickname} 멘토님
                      </h1>
                      <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
                        인증됨
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">
                      {mentor.skills.slice(0, 3).join(', ')} 전문가
                    </p>
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">school</span>
                        {mentor.reviewCount}명의 수강생
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <span className="material-symbols-outlined text-yellow-500">star</span>
                    <p className="text-sm font-medium">평균 평점</p>
                  </div>
                  <p className="text-slate-900 dark:text-white text-2xl font-bold">
                    {averageRating.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
                  </p>
                </div>
                <div className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <span className="material-symbols-outlined text-blue-500">chat</span>
                    <p className="text-sm font-medium">리뷰</p>
                  </div>
                  <p className="text-slate-900 dark:text-white text-2xl font-bold">
                    {mentor.reviewCount} <span className="text-sm font-normal text-slate-400">건</span>
                  </p>
                </div>
                <div className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <span className="material-symbols-outlined text-green-500">school</span>
                    <p className="text-sm font-medium">튜토리얼</p>
                  </div>
                  <p className="text-slate-900 dark:text-white text-2xl font-bold">
                    {mentor.tutorials.length} <span className="text-sm font-normal text-slate-400">개</span>
                  </p>
                </div>
              </div>

              {/* Career (Introduction) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-4">소개</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {mentor.career}
                </p>
              </div>

              {/* Skills (mentor_skills 테이블 기반) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-4">기술 스택</h2>
                <div className="flex gap-2 flex-wrap">
                  {mentor.skills.map((skill, index) => (
                    <div
                      key={index}
                      className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 ${
                        index === 0
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    >
                      <p className={`text-sm font-medium ${index === 0 ? 'text-primary font-bold' : 'text-slate-700 dark:text-white'}`}>
                        {skill}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tutorials */}
              {mentor.tutorials.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-slate-900 dark:text-white text-2xl font-bold px-1">진행중인 튜토리얼</h2>
                  <div className="grid grid-cols-1 gap-5">
                    {mentor.tutorials.map((tutorial) => (
                      <Link
                        key={tutorial.id}
                        to={`/tutorial/${tutorial.id}`}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                            tutorial.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {tutorial.status === 'ACTIVE' ? '모집중' : '마감'}
                          </span>
                          <div className="flex items-center text-yellow-500">
                            <span className="material-symbols-outlined text-base">star</span>
                            <span className="font-bold ml-1">{tutorial.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                        </div>
                        <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {tutorial.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-base mb-4 line-clamp-2 leading-relaxed">
                          {tutorial.description}
                        </p>
                        {/* Tutorial Skills */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {tutorial.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-lg"
                            >
                              {skill.skillName}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-5 border-t-2 border-slate-100 dark:border-slate-700">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">회당 수업료</p>
                            <span className="text-primary text-2xl font-bold">
                              ₩{tutorial.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 mb-1">수업 시간</p>
                            <span className="text-slate-900 dark:text-white font-bold">{formatDuration(tutorial.duration)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-6">
              {/* Mentoring Info Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold mb-4">멘토 정보</h2>
                  <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-primary">calendar_month</span>
                          <div>
                              <p className="text-sm font-bold dark:text-white">멘토 등록일</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(mentor.createdAt)}</p>
                          </div>
                      </li>
                  </ul>
              </div>

              {/* Reviews */}
              {mentor.reviews.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold">수강 후기</h2>
                    <button className="text-xs text-primary font-bold hover:underline">전체 보기</button>
                  </div>
                  <div className="space-y-6">
                    {mentor.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-slate-500 text-sm">person</span>
                            </div>
                            <span className="text-xs font-bold dark:text-white">{review.mentee.nickname}님</span>
                          </div>
                          <div className="flex items-center text-yellow-500">
                            <span className="material-symbols-outlined text-sm">star</span>
                            <span className="text-xs font-bold ml-1">{review.rating}.0</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          "{review.content}"
                        </p>
                        <p className="text-[10px] text-slate-400">{formatDate(review.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
