import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import * as authApi from '@/api/auth';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const hasCleared = useRef(false);

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  // 중복 확인 상태
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(false);
  const [nicknameCheckLoading, setNicknameCheckLoading] = useState(false);

  // 인증 페이지 진입 시 기존 세션 정리 (다른 계정 토큰 남아있는 경우 대비)
  // 의존성 배열을 비워서 마운트 시 한 번만 실행
  useEffect(() => {
    if (!hasCleared.current) {
      hasCleared.current = true;
      // 기존 토큰 삭제 - 새로 로그인/회원가입하려는 것이므로
      localStorage.removeItem('accessToken');
    }
  }, []);

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!email || !email.includes('@')) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    setEmailCheckLoading(true);
    setError(null);
    try {
      const res = await authApi.checkEmailDuplicate(email);
      if (res.success) {
        setEmailChecked(true);
        setEmailAvailable(!res.data.duplicated);
        if (res.data.duplicated) {
          setError('이미 사용 중인 이메일입니다.');
        }
      }
    } catch {
      setError('이메일 확인 중 오류가 발생했습니다.');
    } finally {
      setEmailCheckLoading(false);
    }
  };

  // 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!nickname || nickname.length < 2) {
      setError('닉네임을 2자 이상 입력해주세요.');
      return;
    }
    setNicknameCheckLoading(true);
    setError(null);
    try {
      const res = await authApi.checkNicknameDuplicate(nickname);
      if (res.success) {
        setNicknameChecked(true);
        setNicknameAvailable(!res.data.duplicated);
        if (res.data.duplicated) {
          setError('이미 사용 중인 닉네임입니다.');
        }
      }
    } catch {
      setError('닉네임 확인 중 오류가 발생했습니다.');
    } finally {
      setNicknameCheckLoading(false);
    }
  };

  // 이메일 변경 시 중복확인 리셋
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailChecked(false);
    setEmailAvailable(false);
  };

  // 닉네임 변경 시 중복확인 리셋
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameChecked(false);
    setNicknameAvailable(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // 회원가입 시 중복확인 검증
    if (mode === 'signup') {
      if (!emailChecked || !emailAvailable) {
        setError('이메일 중복확인을 해주세요.');
        return;
      }
      if (!nicknameChecked || !nicknameAvailable) {
        setError('닉네임 중복확인을 해주세요.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/');
      } else {
        await signup(email, password, nickname, 'MENTEE');
        // 회원가입 성공 후 로그인 탭으로 전환
        setMode('login');
        setError(null);
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden pt-16">
        {/* Left Side - Info */}
        <div className="hidden lg:flex flex-col flex-1 bg-slate-900 dark:bg-[#0a1118] relative justify-center items-center px-20">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,hsl(217_91%_60%)_0%,transparent_50%)]" />
          <div className="relative z-10 w-full max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              개발자의 성장을 돕는
              <br />
              <span className="text-primary">1:1 맞춤형 튜터링</span>
            </h1>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              실무진 멘토와 함께하는 코드 리뷰와 커리어 로드맵.
              <br />
              더 나은 개발자로 도약하는 가장 빠른 방법입니다.
            </p>
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10">
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[120px] opacity-80">
                  code_blocks
                </span>
              </div>
            </div>
            <div className="mt-12 flex gap-8">
              <div className="flex flex-col">
                <span className="text-primary text-2xl font-bold">1,200+</span>
                <span className="text-slate-500 text-sm">전문 멘토진</span>
              </div>
              <div className="flex flex-col">
                <span className="text-primary text-2xl font-bold">8,500+</span>
                <span className="text-slate-500 text-sm">진행된 수업</span>
              </div>
              <div className="flex flex-col">
                <span className="text-primary text-2xl font-bold">98%</span>
                <span className="text-slate-500 text-sm">수강생 만족도</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-20 bg-background py-12">
          <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
            <CardContent className="p-0 space-y-8">
              {/* Tab Navigation */}
              <Tabs value={mode} onValueChange={(v) => { setMode(v as AuthMode); setError(null); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
                  <TabsTrigger value="login" className="text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    로그인
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    회원가입
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Form Content */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {mode === 'login' ? '다시 만나서 반가워요!' : '반가워요!'}
                  </h2>
                  <p className="text-muted-foreground">
                    {mode === 'login'
                      ? 'DevSolve에 로그인하세요.'
                      : 'DevSolve에서 성장을 시작해 보세요.'}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">
                        이메일 주소
                      </Label>
                      <div className="relative flex gap-2">
                        <div className="relative flex-1 group">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors text-xl">
                            alternate_email
                          </span>
                          <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            placeholder="example@devsolve.com"
                            className={`h-12 pl-12 pr-4 ${emailChecked ? (emailAvailable ? 'border-green-500' : 'border-red-500') : ''}`}
                            required
                            disabled={isLoading}
                          />
                        </div>
                        {mode === 'signup' && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCheckEmail}
                            disabled={isLoading || emailCheckLoading || !email}
                            className="h-12 px-4 whitespace-nowrap"
                          >
                            {emailCheckLoading ? '확인중...' : '중복확인'}
                          </Button>
                        )}
                      </div>
                      {mode === 'signup' && emailChecked && (
                        <p className={`text-xs ${emailAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {emailAvailable ? '✓ 사용 가능한 이메일입니다.' : '✗ 이미 사용 중인 이메일입니다.'}
                        </p>
                      )}
                    </div>

                    {/* Nickname - Only for signup */}
                    {mode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="nickname" className="text-sm font-semibold">
                          닉네임
                        </Label>
                        <div className="relative flex gap-2">
                          <div className="relative flex-1 group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors text-xl">
                              person
                            </span>
                            <Input
                              type="text"
                              id="nickname"
                              value={nickname}
                              onChange={(e) => handleNicknameChange(e.target.value)}
                              placeholder="사용하실 닉네임을 입력하세요 (2~20자)"
                              className={`h-12 pl-12 pr-4 ${nicknameChecked ? (nicknameAvailable ? 'border-green-500' : 'border-red-500') : ''}`}
                              required
                              minLength={2}
                              maxLength={20}
                              disabled={isLoading}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCheckNickname}
                            disabled={isLoading || nicknameCheckLoading || !nickname}
                            className="h-12 px-4 whitespace-nowrap"
                          >
                            {nicknameCheckLoading ? '확인중...' : '중복확인'}
                          </Button>
                        </div>
                        {nicknameChecked && (
                          <p className={`text-xs ${nicknameAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            {nicknameAvailable ? '✓ 사용 가능한 닉네임입니다.' : '✗ 이미 사용 중인 닉네임입니다.'}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">
                        비밀번호
                      </Label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors text-xl">
                          lock
                        </span>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={mode === 'login' ? '비밀번호를 입력하세요' : '8자리 이상 입력하세요'}
                          className="h-12 pl-12 pr-12"
                          required
                          minLength={mode === 'signup' ? 8 : undefined}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <span className="material-symbols-outlined text-muted-foreground cursor-pointer hover:text-foreground text-xl">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 font-bold shadow-lg shadow-primary/30 mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                        처리 중...
                      </span>
                    ) : (
                      mode === 'login' ? '로그인' : '가입하고 시작하기'
                    )}
                  </Button>
                </form>

                {mode === 'login' && (
                  <div className="text-center">
                    <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      비밀번호를 잊으셨나요?
                    </Link>
                  </div>
                )}

                <p className="text-center text-xs text-muted-foreground mt-8">
                  {mode === 'signup' ? (
                    <>
                      가입함으로써 DevSolve의{' '}
                      <Link to="#" className="underline hover:text-primary">
                        이용약관
                      </Link>{' '}
                      및{' '}
                      <Link to="#" className="underline hover:text-primary">
                        개인정보처리방침
                      </Link>
                      에 동의하게 됩니다.
                    </>
                  ) : (
                    <>
                      아직 계정이 없으신가요?{' '}
                      <button
                        onClick={() => setMode('signup')}
                        className="text-primary font-semibold hover:underline"
                      >
                        회원가입
                      </button>
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
