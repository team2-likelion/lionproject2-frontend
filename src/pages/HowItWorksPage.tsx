import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// 이용 방법 단계별 데이터
const howItWorksSteps = [
  {
    step: 1,
    title: '과외 검색 및 선택',
    description: '기술 스택, 경력, 리뷰를 확인하고 나에게 맞는 과외를 찾아보세요. 필터링으로 원하는 조건의 과외를 빠르게 찾을 수 있습니다.',
    icon: 'search',
    color: 'bg-blue-500',
    details: [
      '기술 스택별 과외 필터링',
      '경력 및 리뷰 확인',
      '과외, 멘토 상세 조회',
      '수업료 및 가능 시간 확인',
    ],
  },
  {
    step: 2,
    title: '수업 신청 및 일정 조율',
    description: '원하는 수업을 선택하고 희망 일시를 등록하세요. 멘토가 일정을 확인한 후 수업이 확정됩니다.',
    icon: 'calendar_month',
    color: 'bg-emerald-500',
    details: [
      '희망 일시 선택',
      '멘토에게 요청 메시지 전달',
      '멘토 승인 후 일정 확정',
      '일정 변경 및 취소 가능',
    ],
  },
  {
    step: 3,
    title: '안전한 결제',
    description: 'DevSolve의 안심 결제 시스템으로 수업료를 결제하세요. 수업 완료 전까지 금액이 안전하게 보관됩니다.',
    icon: 'verified_user',
    color: 'bg-violet-500',
    details: [
      '신용카드, 계좌이체 지원',
      '수업 완료 전까지 금액 보관',
      '수업 미진행 시 전액 환불',
      '수수료 10% (멘토 정산 시)',
    ],
  },
  {
    step: 4,
    title: '1:1 화상 수업 진행',
    description: 'Zoom, Google Meet 등을 통해 실시간으로 멘토와 1:1 수업을 진행합니다. 화면 공유로 코드 리뷰도 가능합니다.',
    icon: 'video_call',
    color: 'bg-amber-500',
    details: [
      'Zoom, Google Meet 등 활용',
      '화면 공유로 실시간 코드 리뷰',
      '녹화 기능으로 복습 가능',
      '채팅으로 자료 공유',
    ],
  },
  {
    step: 5,
    title: 'Q&A 및 후속 지원',
    description: '수업 중 이해가 안 된 부분은 Q&A 게시판에서 질문하세요. 멘토가 추가 답변을 제공합니다.',
    icon: 'forum',
    color: 'bg-rose-500',
    details: [
      'Q&A 게시판 질문 등록',
      '멘토의 상세한 답변',
      '코드 첨부 기능'
    ],
  },
];

// 자주 묻는 질문 데이터
const faqs = [
  {
    question: '수업은 어떻게 진행되나요?',
    answer: 'Zoom, Google Meet 등 화상회의 도구를 통해 1:1로 진행됩니다. 화면 공유를 통해 실시간 코드 리뷰와 설명이 가능합니다. 수업 시간은 멘토마다 다르며, 보통 1회 60분~90분으로 진행됩니다.',
  },
  {
    question: '환불은 어떻게 하나요?',
    answer: '수업 시작 24시간 전까지 100% 환불이 가능합니다. 수업 시작 이후에는 남은 수업에 대해 비례 환불됩니다. 환불 요청은 마이페이지 > 결제 내역에서 신청할 수 있습니다.',
  },
  {
    question: '멘토는 어떻게 선정되나요?',
    answer: '최소 3년 이상의 실무 경력과 포트폴리오 검증을 거친 현직 개발자만 멘토로 활동할 수 있습니다. 멘토 신청 후 DevSolve 운영팀의 심사를 통해 승인됩니다.',
  },
  {
    question: '수업 예약 후 일정 변경이 가능한가요?',
    answer: '수업 48시간 전까지 무료로 일정 변경이 가능합니다. 이후에는 멘토와 협의가 필요하며, 수업 시작 24시간 이내 변경 시 변경 수수료가 발생할 수 있습니다.',
  },
  {
    question: '멘토에게 직접 연락할 수 있나요?',
    answer: '수업 신청 전에는 플랫폼 내 문의하기 기능을 통해 멘토에게 질문할 수 있습니다. 수업 확정 후에는 멘토와 직접 소통할 수 있는 채팅 기능이 제공됩니다.',
  },
  {
    question: '수업료는 어떻게 책정되나요?',
    answer: '수업료는 멘토가 직접 책정합니다. 멘토의 경력, 전문 분야, 수업 시간 등에 따라 다르며, 플랫폼 수수료 10%가 포함된 금액이 표시됩니다.',
  },
];

// 멘티/멘토 혜택 데이터
const benefits = {
  mentee: [
    { icon: 'school', title: '맞춤형 커리큘럼', description: '내 수준과 목표에 맞는 1:1 맞춤 수업' },
    { icon: 'code', title: '실무 코드 리뷰', description: '현업 시니어의 상세한 코드 피드백' },
    { icon: 'work', title: '취업/이직 상담', description: '포트폴리오 첨삭 및 면접 준비' },
    { icon: 'schedule', title: '유연한 일정', description: '원하는 시간에 편리하게 수업' },
  ],
  mentor: [
    { icon: 'payments', title: '추가 수입 창출', description: '본업 외 부수입 확보' },
    { icon: 'trending_up', title: '경험 확장', description: '가르치며 배우는 성장' },
    { icon: 'groups', title: '네트워킹', description: '다양한 개발자와의 교류' },
    { icon: 'star', title: '명성 구축', description: '리뷰와 평점으로 브랜딩' },
  ],
};

export default function HowItWorksPage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <header className="py-20 px-4 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            이용 방법
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            DevSolve와 함께하는 <br />
            <span className="text-primary">개발 성장 여정</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            복잡한 절차 없이 5단계로 시작하세요.
            과외 검색부터 수업 완료까지 DevSolve가 함께합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/tutorials">
                과외 찾아보기
                <span className="material-symbols-outlined ml-2">arrow_forward</span>
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/mentor/apply">멘토로 시작하기</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Step by Step Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">5단계로 시작하는 1:1 멘토링</h2>
            <p className="text-slate-600 dark:text-slate-400">
              간단한 과정으로 현직 개발자에게 배워보세요
            </p>
          </div>

          <div className="space-y-12">
            {howItWorksSteps.map((item, index) => (
              <div
                key={item.step}
                className={`flex flex-col lg:flex-row gap-8 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1 w-full">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <span className="material-symbols-outlined text-white text-3xl">
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Step {item.step}
                        </span>
                        <h3 className="text-xl font-bold">{item.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      {item.description}
                    </p>
                    <ul className="grid grid-cols-2 gap-3">
                      {item.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Step Number */}
                <div className="hidden lg:flex items-center justify-center w-24 shrink-0">
                  <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                    {item.step}
                  </div>
                </div>

                {/* Spacer for alignment */}
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">멘티와 멘토 모두를 위한 플랫폼</h2>
            <p className="text-slate-600 dark:text-slate-400">
              DevSolve에서 누릴 수 있는 혜택을 확인하세요
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Mentee Benefits */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-8">
                <span className="p-3 bg-primary text-white rounded-xl">
                  <span className="material-symbols-outlined">person</span>
                </span>
                <h3 className="text-2xl font-bold">멘티 혜택</h3>
              </div>
              <div className="grid gap-6">
                {benefits.mentee.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">{benefit.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{benefit.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-8" asChild>
                <Link to="/signup">멘티로 시작하기</Link>
              </Button>
            </div>

            {/* Mentor Benefits */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-8">
                <span className="p-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </span>
                <h3 className="text-2xl font-bold">멘토 혜택</h3>
              </div>
              <div className="grid gap-6">
                {benefits.mentor.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">{benefit.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{benefit.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-8" variant="secondary" asChild>
                <Link to="/mentor/apply">멘토 지원하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-semibold rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-3xl font-bold mb-4">자주 묻는 질문</h2>
            <p className="text-slate-600 dark:text-slate-400">
              DevSolve 이용에 대해 궁금한 점을 확인하세요
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-0.5">
                    help
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold mb-2">{faq.question}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              더 궁금한 점이 있으신가요?
            </p>
            <Link
              to="/qna"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              Q&A 게시판 바로가기
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-slate-900 dark:bg-blue-900/20 rounded-[32px] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <span className="material-symbols-outlined text-[160px]">rocket_launch</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-blue-100 max-w-xl mx-auto mb-8">
            DevSolve의 검증된 시니어 개발자들이 당신의 성장을 기다리고 있습니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-200 dark:hover:bg-slate-300" asChild>
              <Link to="/signup">무료로 시작하기</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/tutorials">과외 둘러보기</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
