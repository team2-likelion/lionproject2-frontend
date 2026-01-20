import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const techStacks = [
  { name: 'Spring Boot', mentors: 240, icon: 'terminal', color: 'blue' },
  { name: 'JPA / MySQL', mentors: 180, icon: 'database', color: 'green' },
  { name: 'Docker', mentors: 120, icon: 'layers', color: 'cyan' },
  { name: 'Spring Security', mentors: 95, icon: 'security', color: 'purple' },
  { name: 'Java Core', mentors: 310, icon: 'code', color: 'orange' },
];

const popularKeywords = ['#SpringBoot', '#JPA', '#Docker', '#코드리뷰'];

// 간단한 이용 방법 요약 (3단계)
const quickSteps = [
  { step: 1, title: '멘토 검색', icon: 'search', color: 'bg-blue-500' },
  { step: 2, title: '수업 신청', icon: 'calendar_month', color: 'bg-emerald-500' },
  { step: 3, title: '1:1 멘토링', icon: 'video_call', color: 'bg-violet-500' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/tutorials?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/tutorials');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      {/* Hero Section */}
      <header className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            현직 개발자와 함께하는 <br />
            <span className="text-primary">1:1 맞춤형</span> 성장의 지름길
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            코드 리뷰부터 커리어 설계까지, DevSolve의 검증된 시니어 멘토단이
            당신의 실질적인 실력 향상을 책임집니다.
          </p>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto mb-12 relative">
            <div className="flex p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center flex-1 px-4">
                <span className="material-symbols-outlined text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full border-none focus:ring-0 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 px-3"
                  placeholder="기술 스택(Spring, Docker, JPA...) 또는 관심 주제를 입력하세요"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all"
              >
                검색
              </button>
            </div>

            {/* Popular Keywords */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                인기 키워드:
              </span>
              {popularKeywords.map((keyword) => (
                <Link
                  key={keyword}
                  to={`/tutorials?q=${encodeURIComponent(keyword)}`}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
                >
                  {keyword}
                </Link>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative flex justify-center">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -z-10"></div>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp0AK6qhoUa92W5Ly0LIxZDGBnToSZMRThV33k90xKlZJw2XRQBmkod72SkdJ9VMtCBYsj2I8qtDInUupRMxrkMGMMseqJ2pF7nICwciwoL7a07vN5wTBwMpYYUIrmNEu94z4IJ-60s9v9LGbDL1w5sNZtCJXj4UrUmyll7faA9_9fjb7j-qOgncMQQvmZhiv6OaYkzWUFSd96JYlUrAZukZuz1fs8K6AT1-n0i1Zg0QK9pawna-7OLOVpqVZC0h0nd5ZN-GKHBxo"
              alt="Coding dashboard"
              className="rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800 max-w-4xl w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </header>

      {/* Tech Stack Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            전문적인 커리큘럼
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {techStacks.map((tech) => (
              <div
                key={tech.name}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition-shadow group"
              >
                <div
                  className={`w-12 h-12 bg-${tech.color}-100 dark:bg-${tech.color}-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <span
                    className={`material-symbols-outlined text-${tech.color}-600`}
                  >
                    {tech.icon}
                  </span>
                </div>
                <h3 className="font-bold mb-1">{tech.name}</h3>
                <p className="text-xs text-slate-500">{tech.mentors}+ 멘토 보유</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              간편한 시작
            </span>
            <h2 className="text-3xl font-bold mb-4">3단계로 시작하는 멘토링</h2>
            <p className="text-slate-600 dark:text-slate-400">
              복잡한 절차 없이 바로 시작하세요
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
            {quickSteps.map((item, index) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="material-symbols-outlined text-white text-2xl">
                    {item.icon}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Step {item.step}</span>
                  <p className="font-bold">{item.title}</p>
                </div>
                {index < quickSteps.length - 1 && (
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 hidden md:block ml-4">
                    arrow_forward
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              자세한 이용 방법 보기
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto bg-slate-900 dark:bg-blue-900/20 rounded-[32px] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <span className="material-symbols-outlined text-[160px]">
              shield_person
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-6">신뢰할 수 있는 플랫폼 환경</h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-10 text-lg">
            DevSolve는 철저한 멘토 승인 시스템과 신고 처리 프로세스를 통해
            안전하고 전문적인 학습 경험을 보장합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['관리자 상시 모니터링', '검증된 멘토 인증', '신속한 신고 처리'].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span className="text-sm">{item}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center">
        <h2 className="text-4xl font-bold mb-8">
          성장의 한계를 넘을 준비가 되셨나요?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-bold rounded-xl text-lg hover:bg-blue-600 transition-all shadow-xl shadow-primary/20"
          >
            지금 바로 시작하기
          </Link>
          <button className="w-full sm:w-auto px-10 py-4 border border-slate-300 dark:border-slate-700 font-bold rounded-xl text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            멘토링 후기 보기
          </button>
        </div>
      </section>
    </>
  );
}
