import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as adminApi from '@/api/admin';

/**
 * 관리자 대시보드
 */
export default function AdminDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [pendingMentorCount, setPendingMentorCount] = useState(0);

    // ADMIN 아니면 홈으로 리다이렉트
    useEffect(() => {
        if (!authLoading && user?.role !== 'ADMIN') {
            alert('관리자만 접근 가능합니다.');
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const mentorRes = await adminApi.getPendingMentors();
                if (mentorRes.success) {
                    setPendingMentorCount(mentorRes.data.length);
                }
            } catch (error) {
                console.error('데이터 로딩 실패:', error);
            }
        };

        if (user?.role === 'ADMIN') {
            fetchCounts();
        }
    }, [user]);

    const isActive = (path: string) => location.pathname === path;

    // 로딩 중이거나 ADMIN 아니면 표시 안 함
    if (authLoading || user?.role !== 'ADMIN') {
        return (
            <div className="pt-16 min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="pt-16 min-h-screen flex">
            {/* 사이드바 */}
            <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed left-0 top-16 bottom-0 overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">관리자</h2>

                    <nav className="space-y-1">
                        {/* 대시보드 */}
                        <Link to="/admin">
                            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                isActive('/admin')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}>
                                <span className="material-symbols-outlined text-xl">dashboard</span>
                                <span className="font-medium">대시보드</span>
                            </div>
                        </Link>

                        {/* 멘토 승인 관리 */}
                        <Link to="/admin/mentors">
                            <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                                isActive('/admin/mentors')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-xl">person_check</span>
                                    <span className="font-medium">멘토 승인</span>
                                </div>
                                {pendingMentorCount > 0 && (
                                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {pendingMentorCount}
                  </span>
                                )}
                            </div>
                        </Link>

                        {/* 환불 관리 */}
                        <Link to="/admin/refunds">
                            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                isActive('/admin/refunds')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}>
                                <span className="material-symbols-outlined text-xl">undo</span>
                                <span className="font-medium">환불 관리</span>
                            </div>
                        </Link>

                        {/* 정산 관리 */}
                        <Link to="/admin/settlements">
                            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                isActive('/admin/settlements')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}>
                                <span className="material-symbols-outlined text-xl">receipt_long</span>
                                <span className="font-medium">정산 관리</span>
                            </div>
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* 메인 콘텐츠 */}
            <main className="flex-1 ml-64 p-8">
                {location.pathname === '/admin' ? (
                    <div>
                        <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* 멘토 승인 대기 요약 */}
                            <Link to="/admin/mentors">
                                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-2xl">person_check</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">멘토 승인 대기</p>
                                            <p className="text-2xl font-bold">{pendingMentorCount}건</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <Outlet />
                )}
            </main>
        </div>
    );
}