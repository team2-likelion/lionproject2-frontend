import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as qnaApi from '@/api/qna';
import type { Question } from '@/api/qna';

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function QnAListPage() {
    const { user, isAuthenticated } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('전체');

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const response = await qnaApi.getMyQuestions(user?.role);
                if (response.success && response.data) {
                    setQuestions(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch questions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, [user?.role]);

    // 필터링된 질문 목록
    const filteredQuestions = questions.filter(q => {
        if (filter === '전체') return true;
        if (filter === '답변 대기중') return q.answerCount === 0;
        if (filter === '답변 완료') return q.answerCount > 0;
        return true;
    });

    if (isLoading) {
        return (
            <div className="pt-16 min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="pt-16">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">수업 Q&A</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            진행중인 수업에서 멘토에게 질문하고 답변을 받아보세요
                        </p>
                    </div>
                    {isAuthenticated && user?.role !== 'MENTOR' && (
                        <Link
                            to="/qna/create"
                            className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-xl">edit</span>
                            질문 작성하기
                        </Link>
                    )}
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                        <div>
                            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                수업 Q&A는 진행중인 수업(Lesson)에서만 작성할 수 있습니다.
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                수업을 신청하고 멘토의 승인을 받으면 질문을 작성할 수 있어요.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter by Status */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['전체', '답변 대기중', '답변 완료'].map((filterOption) => (
                        <button
                            key={filterOption}
                            onClick={() => setFilter(filterOption)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filter === filterOption
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                            {filterOption}
                        </button>
                    ))}
                </div>

                {/* Question List */}
                {filteredQuestions.length === 0 ? (
                    <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
              quiz
            </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {filter === '전체' ? '아직 질문이 없습니다' : `${filter} 질문이 없습니다`}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            진행중인 수업에서 멘토에게 질문해보세요!
                        </p>
                        <Link
                            to="/tutorials"
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold"
                        >
                            <span className="material-symbols-outlined">search</span>
                            강의 찾아보기
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredQuestions.map((question) => (
                            <Link
                                key={question.questionId || question.id}
                                to={`/qna/${question.questionId || question.id}`}
                                className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary/50 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Answer Count */}
                                    <div
                                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl ${
                                            question.answerCount > 0
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                                                : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                        }`}
                                    >
                                        <span className="text-xl font-bold">{question.answerCount}</span>
                                        <span className="text-xs">답변</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Status Badge */}
                                        <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          question.answerCount > 0
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {question.answerCount > 0 ? '답변 완료' : '답변 대기중'}
                      </span>
                                        </div>

                                        <h3 className="text-slate-900 dark:text-white font-bold truncate group-hover:text-primary transition-colors">
                                            {question.title}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1 mb-3 mt-1">
                                            {question.content}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {question.menteeNickname} · {formatDate(question.createdAt)}
                      </span>
                                        </div>
                                    </div>

                                    {/* Code indicator */}
                                    {question.codeContent && (
                                        <div className="flex-shrink-0">
                      <span className="material-symbols-outlined text-slate-400" title="코드 포함">
                        code
                      </span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
