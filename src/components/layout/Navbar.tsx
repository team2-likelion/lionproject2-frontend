import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  onToggleDarkMode: () => void;
}

export default function Navbar({ onToggleDarkMode }: NavbarProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

    const getMyPagePath = () => {
        if (user?.role === 'ADMIN') return '/admin';
        if (user?.role === 'MENTOR') return '/mentor/dashboard';
        return '/mypage';
    };

    const getMyPageLabel = () => {
        if (user?.role === 'ADMIN') return '관리자';
        return '마이페이지';
    };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-border bg-white/80 dark:bg-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl font-bold">
              terminal
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              DevSolve
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/tutorials"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              강의 찾기
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              이용 방법
            </Link>
            {/* MENTEE 에게만  표시 */}
              {user?.role !== 'MENTOR' && user?.role !== 'ADMIN' && (
              <Link
                to="/mentor/apply"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                멘토 지원하기
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="rounded-full"
            >
              <span className="material-symbols-outlined text-xl">dark_mode</span>
            </Button>

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <span className="material-symbols-outlined">menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/tutorials">강의 찾기</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/how-it-works">이용 방법</Link>
                </DropdownMenuItem>
                {/* MENTOR 역할이 아닌 사용자에게만 표시 */}
                {user?.role !== 'MENTOR' && (
                  <DropdownMenuItem asChild>
                    <Link to="/mentor/apply">멘토 지원하기</Link>
                  </DropdownMenuItem>
                )}
                {isAuthenticated && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link to={getMyPagePath()}>
                            {getMyPageLabel()}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      로그아웃
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              // 로그인 상태
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden sm:inline-flex gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <span className="material-symbols-outlined text-xl">person</span>
                    <span className="max-w-[100px] truncate">{user?.nickname}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link
                            to={getMyPagePath()}
                            className="flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">dashboard</span>
                            {getMyPageLabel()}
                        </Link>
                    </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // 비로그인 상태
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                  <Link to="/login">로그인</Link>
                </Button>
                <Button asChild className="shadow-lg shadow-primary/20">
                  <Link to="/signup">시작하기</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
