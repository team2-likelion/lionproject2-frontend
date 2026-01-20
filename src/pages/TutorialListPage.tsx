import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as tutorialApi from '@/api/tutorial';
import * as mentorApi from '@/api/mentor';
import type { Tutorial } from '@/api/tutorial';
import type { Skill } from '@/api/mentor';

export default function TutorialListPage() {
    const [searchParams] = useSearchParams();
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // URL에서 초기 검색어 읽기
    const getInitialKeyword = () => {
        const q = searchParams.get('q');
        if (q) {
            return q.startsWith('#') ? q.substring(1) : q;
        }
        return '';
    };

    // Filter state - URL 파라미터로 초기화
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [searchKeyword, setSearchKeyword] = useState(getInitialKeyword);
    const [sortBy, setSortBy] = useState('');

    // URL 쿼리 파라미터 변경 시 검색어 업데이트
    useEffect(() => {
        const q = searchParams.get('q');
        const cleanQuery = q ? (q.startsWith('#') ? q.substring(1) : q) : '';
        setSearchKeyword(cleanQuery);
    }, [searchParams]);

    // 스킬 목록 조회
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await mentorApi.getSkills();
                if (response.success && response.data) {
                    setSkills(response.data);
                }
            } catch {
                console.error('Failed to fetch skills');
            }
        };
        fetchSkills();
    }, []);

    // ⭐ 튜토리얼 목록 조회 (백엔드 검색)
    useEffect(() => {
        const fetchTutorials = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await tutorialApi.getTutorials({
                    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
                    keyword: searchKeyword || undefined,
                    sortBy: sortBy || undefined,
                });
                if (response.success && response.data) {
                    setTutorials(response.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : '강의 목록을 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTutorials();
    }, [selectedSkills, sortBy, searchKeyword]);

    // ⭐ 스킬 토글 (이름 기반)
    const handleSkillToggle = (skillName: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skillName)
                ? prev.filter((name) => name !== skillName)
                : [...prev, skillName]
        );
    };

    return (
        <div className="pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-8">
                            {/* Tech Stack Filter */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                                    기술 스택
                                </h3>
                                <div className="space-y-3">
                                    {skills.map((skill) => (
                                        <label key={skill.id} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedSkills.includes(skill.name)}
                                                onChange={() => handleSkillToggle(skill.name)}
                                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary dark:bg-slate-900"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-primary">
                        {skill.name}
                      </span>
                                        </label>
                                    ))}
                                    {skills.length === 0 && (
                                        <p className="text-sm text-slate-400">스킬 목록을 불러오는 중...</p>
                                    )}
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-slate-800" />

                            {/* ⭐ 선택된 스킬 표시 */}
                            {selectedSkills.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                                        선택된 스킬
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSkills.map((skillName) => (
                                            <span
                                                key={skillName}
                                                className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-1"
                                            >
                        {skillName}
                                                <button
                                                    onClick={() => handleSkillToggle(skillName)}
                                                    className="hover:text-red-500"
                                                >
                          ×
                        </button>
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                                <div>
                                    {/* ⭐ 제목 변경 */}
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">강의 찾기</h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        {tutorials.length}개의 강의가 있습니다
                                    </p>
                                </div>
                            </div>

                            {/* Search & Sort */}
                            <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
                                <div className="relative flex-1 w-full">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                  </span>
                                    <input
                                        type="text"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        placeholder="강의 제목 또는 기술 스택 검색"
                                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm shadow-sm"
                                    />
                                </div>
                                <div className="flex-shrink-0 w-full md:w-auto">
                                    {/* ⭐ 정렬 옵션 변경 */}
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full md:w-auto text-sm border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 cursor-pointer shadow-sm"
                                    >
                                        <option value="">최신순</option>
                                        <option value="rating">평점 높은 순</option>
                                        <option value="reviewCount">리뷰 많은 순</option>
                                        <option value="priceAsc">낮은 가격순</option>
                                        <option value="priceDesc">높은 가격순</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-16">
                                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
                                {error}
                            </div>
                        )}

                        {/* ⭐ Tutorial Grid */}
                        {!isLoading && !error && (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {tutorials.map((tutorial) => (
                                        <div
                                            key={tutorial.id}
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col hover:shadow-xl hover:shadow-primary/5 transition-all group"
                                        >
                                            {/* ⭐ 튜토리얼 카드 내용 */}
                                            <div className="flex flex-col gap-3 mb-4">
                                                {/* 제목 & 평점 */}
                                                <div className="flex items-start justify-between">
                                                    <Link to={`/tutorial/${tutorial.id}`}>
                                                        <h2 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                            {tutorial.title}
                                                        </h2>
                                                    </Link>
                                                    <div className="flex items-center text-yellow-500 text-sm font-bold flex-shrink-0 ml-2">
                                                        <span className="material-symbols-outlined text-sm mr-0.5">star</span>
                                                        {tutorial.rating?.toFixed(1) || '0.0'}
                                                    </div>
                                                </div>

                                                {/* 가격 & 시간 */}
                                                <div className="flex items-center gap-4 text-sm">
                          <span className="text-primary font-bold">
                            {tutorial.price?.toLocaleString()}원
                          </span>
                                                    <span className="text-slate-400">
                            {tutorial.duration}분/회
                          </span>
                                                </div>

                                                {/* 스킬 태그 */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {tutorial.skills?.slice(0, 3).map((skill, idx) => {
                                                        const skillName = typeof skill === 'string' ? skill : skill.name;
                                                        return (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] font-bold rounded-md uppercase"
                                                            >
                                {skillName}
                              </span>
                                                        );
                                                    })}
                                                    {tutorial.skills && tutorial.skills.length > 3 && (
                                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-md">
                              +{tutorial.skills.length - 3}
                            </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 설명 */}
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed">
                                                {tutorial.description || '강의 설명이 없습니다.'}
                                            </p>

                                            {/* 하단 */}
                                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          리뷰 {tutorial.reviewCount || 0}개
                        </span>
                                                <Link
                                                    to={`/tutorial/${tutorial.id}`}
                                                    className="bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-primary/20"
                                                >
                                                    자세히 보기
                                                </Link>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty State */}
                                    {tutorials.length === 0 && !isLoading && (
                                        <div className="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center p-8 text-slate-400">
                                            <div className="text-center">
                                                <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                                                <p className="text-sm">검색 결과가 없습니다.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
