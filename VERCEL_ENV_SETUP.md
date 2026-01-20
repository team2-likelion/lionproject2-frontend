# Vercel 환경변수 설정 가이드 (DevSolve)

## 🎯 실제 배포 환경변수

### Production 환경 (필수)

Vercel Project Settings > Environment Variables에서 다음과 같이 설정:

```
Key: VITE_API_BASE_URL
Value: https://api.devsolve.kro.kr
Environment: ✅ Production
```

### Preview 환경 (선택사항 - PR 테스트용)

```
Key: VITE_API_BASE_URL
Value: https://api.devsolve.kro.kr
Environment: ✅ Preview
```

### Development 환경 (로컬 개발)

로컬에서는 `.env.local` 파일 생성:

```bash
# .env.local (Git에 커밋하지 않음)
VITE_API_BASE_URL=http://localhost:8080
```

---

## 📋 Vercel 설정 단계별 가이드

### 1. Vercel Dashboard 접속
1. https://vercel.com/dashboard 접속
2. DevSolve Frontend 프로젝트 선택

### 2. Environment Variables 설정
1. **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 선택
3. "Add New" 버튼 클릭

### 3. 변수 입력

**First Variable:**
```
Name: VITE_API_BASE_URL
Value: https://api.devsolve.kro.kr

Select Environments:
✅ Production
✅ Preview
⬜ Development
```

**Save** 클릭

### 4. 재배포 (중요!)

환경변수 추가 후 반드시 재배포 필요:
1. **Deployments** 탭으로 이동
2. 최신 배포의 **...** 메뉴 클릭
3. **Redeploy** 선택
4. 빌드 로그에서 환경변수 확인

---

## ✅ 배포 전 체크리스트

### 백엔드 API 확인
- [ ] `https://api.devsolve.kro.kr` 접근 가능한지 확인
- [ ] HTTPS 인증서 유효한지 확인
- [ ] Health check 엔드포인트 테스트 (예: `/api/health`)

### 백엔드 CORS 설정 확인

백엔드에서 다음 도메인들을 허용해야 함:

**로컬 개발:**
```
http://localhost:5173
```

**Vercel Production:**
```
https://devsolve-frontend.vercel.app
또는
https://your-custom-domain.com
```

**Vercel Preview (PR 테스트):**
```
https://*.vercel.app
```

**Spring Boot CORS 설정 예시:**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:5173",
                "https://devsolve-frontend.vercel.app",
                "https://*.vercel.app"  // Preview 환경
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

### Refresh Token 쿠키 설정 확인

백엔드에서 Refresh Token 쿠키 설정:

```java
Cookie refreshTokenCookie = new Cookie("refreshToken", token);
refreshTokenCookie.setHttpOnly(true);
refreshTokenCookie.setSecure(true);     // HTTPS only
refreshTokenCookie.setPath("/");
refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
refreshTokenCookie.setSameSite("None");  // Cross-origin 허용
refreshTokenCookie.setDomain(".devsolve.kro.kr"); // 도메인 설정
```

**중요**: `SameSite=None`과 `Secure=true`는 크로스 도메인 쿠키 전송에 필수!

---

## 🧪 배포 후 테스트 시나리오

### 1. 기본 연결 테스트

```bash
# 브라우저 개발자 도구 > Console
console.log(import.meta.env.VITE_API_BASE_URL)
// 출력: https://api.devsolve.kro.kr
```

### 2. API 호출 테스트

**홈페이지 접속 시:**
- Network 탭에서 API 요청 확인
- Request URL이 `https://api.devsolve.kro.kr/api/...`인지 확인
- Status 200 또는 정상 응답 확인

### 3. CORS 에러 확인

**CORS 에러 발생 시:**
```
Access to fetch at 'https://api.devsolve.kro.kr/api/...' from origin 'https://devsolve-frontend.vercel.app' has been blocked by CORS policy
```

**해결**: 백엔드 팀에 Vercel 도메인 CORS 허용 요청

### 4. 인증 테스트

1. **로그인 테스트:**
   - 로그인 페이지 접속
   - 테스트 계정으로 로그인
   - Access Token이 localStorage에 저장되는지 확인
   - Refresh Token 쿠키가 설정되는지 확인 (Application 탭 > Cookies)

2. **토큰 갱신 테스트:**
   - 1시간 대기 (또는 토큰 만료 시간)
   - 페이지 새로고침
   - 자동으로 토큰 갱신되는지 확인
   - 로그인 유지되는지 확인

3. **쿠키 확인:**
   ```
   Application 탭 > Cookies > https://api.devsolve.kro.kr

   Name: refreshToken
   Value: eyJhbGciOiJIUzI1NiIs...
   Domain: .devsolve.kro.kr
   Path: /
   Expires: (7일 후)
   HttpOnly: ✅
   Secure: ✅
   SameSite: None
   ```

### 5. 결제 기능 테스트

1. 과외 상세 페이지 접속
2. "결제하기" 버튼 클릭
3. PortOne SDK 로드 확인
4. 테스트 결제 진행
5. 결제 완료 후 백엔드 검증 확인

---

## 🚨 문제 해결 (Troubleshooting)

### 문제 1: "localhost:8080에 연결할 수 없음"

**증상**:
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
http://localhost:8080/api/...
```

**원인**: 환경변수가 설정되지 않아 localhost로 폴백

**해결**:
1. Vercel에서 `VITE_API_BASE_URL` 설정 확인
2. 재배포 (Redeploy)
3. 빌드 로그에서 환경변수 확인

### 문제 2: CORS 에러

**증상**:
```
Access to fetch at 'https://api.devsolve.kro.kr' has been blocked by CORS policy
```

**원인**: 백엔드에서 Vercel 도메인을 허용하지 않음

**해결**: 백엔드 팀에 요청
```
Vercel 도메인을 CORS allowedOrigins에 추가 부탁드립니다:
- https://devsolve-frontend.vercel.app
- https://*.vercel.app (Preview 환경)
```

### 문제 3: 쿠키가 전송되지 않음

**증상**:
- Refresh Token이 서버로 전송되지 않음
- 401 Unauthorized 에러 지속

**원인**:
- `SameSite=None` 또는 `Secure=true` 미설정
- 도메인 설정 문제

**해결**: 백엔드 쿠키 설정 확인
```java
refreshTokenCookie.setSameSite("None");
refreshTokenCookie.setSecure(true);
refreshTokenCookie.setDomain(".devsolve.kro.kr");
```

### 문제 4: 로그인 후 새로고침하면 로그아웃됨

**증상**:
- 로그인 성공
- 새로고침하면 다시 로그인 페이지로

**원인**:
- Access Token이 localStorage에 저장 안 됨
- 또는 자동 토큰 갱신 실패

**해결**:
1. localStorage 확인:
   ```javascript
   console.log(localStorage.getItem('accessToken'))
   ```
2. Refresh Token 쿠키 확인
3. 백엔드 `/api/auth/refresh` 엔드포인트 테스트

### 문제 5: 환경변수가 undefined

**증상**:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
// 출력: undefined
```

**원인**:
- 환경변수명 오타 (`VITE_` 접두사 누락)
- 또는 재배포 안 함

**해결**:
1. 환경변수명 확인: `VITE_API_BASE_URL` (정확히)
2. Vercel에서 재배포
3. 로컬 개발: 서버 재시작 (`npm run dev` 중지 후 재실행)

---

## 🔐 보안 체크리스트

### 백엔드 API (https://api.devsolve.kro.kr)

- [ ] HTTPS 인증서 유효 (Let's Encrypt 또는 상용)
- [ ] CORS 헤더 올바르게 설정
- [ ] Refresh Token은 HttpOnly 쿠키로 전송
- [ ] Access Token은 응답 body로만 전송 (쿠키 ❌)
- [ ] SameSite=None, Secure=true 설정 (크로스 도메인)
- [ ] Rate Limiting 설정 (DDoS 방어)

### 프론트엔드 (Vercel)

- [ ] 환경변수로 API URL 관리 (하드코딩 ❌)
- [ ] Access Token은 localStorage (임시, 향후 개선)
- [ ] HTTPS 강제 (Vercel 자동)
- [ ] console.log 프로덕션에서 제거 (vite.config.ts)

---

## 📊 배포 완료 후 모니터링

### 1. Vercel Analytics
- Real-time Visitors
- Page Views
- Response Time

### 2. 브라우저 Console
- 에러 메시지 확인
- API 호출 성공률

### 3. Network 요청
- API 응답 시간
- 실패한 요청 확인

### 4. Sentry (선택사항)
- 런타임 에러 추적
- 사용자별 에러 리포트

---

## 🎯 최종 배포 단계

### Step 1: 환경변수 설정 (Vercel)
```
VITE_API_BASE_URL=https://api.devsolve.kro.kr
```

### Step 2: vite.config.ts 수정 (console 제거)
```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true
    }
  }
}
```

### Step 3: 로컬 테스트
```bash
# 프로덕션 빌드 테스트
VITE_API_BASE_URL=https://api.devsolve.kro.kr npm run build
npm run preview

# 브라우저에서 http://localhost:4173 테스트
```

### Step 4: Git 커밋 & 푸시
```bash
git add vite.config.ts
git commit -m "chore: configure production build for Vercel deployment"
git push origin main
```

### Step 5: Vercel 자동 배포 확인
1. Vercel Dashboard > Deployments
2. 빌드 로그 확인
3. "Visit" 버튼으로 배포된 사이트 확인

### Step 6: 배포 검증
- [ ] 홈페이지 로드
- [ ] API 호출 성공 (https://api.devsolve.kro.kr)
- [ ] 로그인/회원가입
- [ ] 멘토 목록 조회
- [ ] 결제 기능 (PortOne SDK 로드)
- [ ] Admin 대시보드

---

## 📞 배포 관련 문의

### 백엔드 팀 체크리스트

배포 전 백엔드 팀에 다음을 확인 요청:

```
안녕하세요, 프론트엔드 배포 예정입니다.

다음 사항 확인 부탁드립니다:

1. CORS 설정에 다음 도메인 추가:
   - https://devsolve-frontend.vercel.app
   - https://*.vercel.app

2. Refresh Token 쿠키 설정:
   - SameSite=None
   - Secure=true
   - Domain=.devsolve.kro.kr

3. API 엔드포인트 확인:
   - https://api.devsolve.kro.kr 접근 가능
   - HTTPS 인증서 유효

감사합니다!
```

---

## 요약

### 필수 설정
1. **Vercel 환경변수**: `VITE_API_BASE_URL=https://api.devsolve.kro.kr`
2. **백엔드 CORS**: Vercel 도메인 허용
3. **백엔드 쿠키**: SameSite=None, Secure=true

### 선택 설정
1. vite.config.ts console 제거 (보안 강화)
2. Sentry 에러 트래킹
3. Google Analytics

### 배포 후 테스트
1. API 연결 확인
2. 로그인/인증 테스트
3. 결제 기능 확인
4. Admin 기능 확인
