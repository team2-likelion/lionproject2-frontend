# Vercel 배포 가이드

## 환경변수 설정

### 필수 환경변수

Vercel 프로젝트 설정에서 다음 환경변수를 **반드시** 설정해야 합니다:

| 변수명 | 설명 | 예시 값 | 환경 |
|--------|------|---------|------|
| `VITE_API_BASE_URL` | 백엔드 API 서버 주소 | `https://api.yourproject.com` | Production |
| `VITE_API_BASE_URL` | 백엔드 API 서버 주소 (Preview) | `https://api-staging.yourproject.com` | Preview |
| `VITE_API_BASE_URL` | 백엔드 API 서버 주소 (Local) | `http://localhost:8080` | Development |

### 선택 환경변수 (권장)

프로덕션 품질 향상을 위해 권장되는 환경변수:

| 변수명 | 설명 | 용도 | 예시 값 |
|--------|------|------|---------|
| `VITE_SENTRY_DSN` | Sentry 에러 트래킹 | 프로덕션 에러 모니터링 | `https://...@sentry.io/123` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics | 사용자 분석 | `G-XXXXXXXXXX` |
| `VITE_DEBUG_MODE` | 디버그 모드 | 개발 환경에서만 true | `false` (Production) |
| `VITE_PORTONE_STORE_ID` | PortOne 스토어 ID | 결제 설정 | `store-xxx-xxx` |

---

## Vercel 환경변수 설정 방법

### 1. Vercel Dashboard 접속
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택

### 2. Environment Variables 설정
1. **Settings** 탭 클릭
2. **Environment Variables** 메뉴 선택
3. 각 환경변수 추가:
   - **Key**: 변수명 (예: `VITE_API_BASE_URL`)
   - **Value**: 값 (예: `https://api.yourproject.com`)
   - **Environment**: 적용할 환경 선택
     - ✅ Production (배포 환경)
     - ✅ Preview (PR 미리보기)
     - ⬜ Development (로컬 개발 - 선택사항)

### 3. 환경별 설정 예시

#### Production 환경
```bash
VITE_API_BASE_URL=https://api.yourproject.com
VITE_DEBUG_MODE=false
VITE_SENTRY_DSN=https://your-production-dsn@sentry.io/project-id
```

#### Preview 환경 (Staging)
```bash
VITE_API_BASE_URL=https://api-staging.yourproject.com
VITE_DEBUG_MODE=true
VITE_SENTRY_DSN=https://your-staging-dsn@sentry.io/project-id
```

#### Development 환경 (로컬)
```bash
# .env.local 파일에 작성
VITE_API_BASE_URL=http://localhost:8080
VITE_DEBUG_MODE=true
```

---

## 배포 체크리스트

### 배포 전 확인사항

- [ ] `VITE_API_BASE_URL` 환경변수 설정 완료
- [ ] 백엔드 API 서버 CORS 설정 확인
  - `Access-Control-Allow-Origin`: Vercel 도메인 허용
  - `Access-Control-Allow-Credentials: true`
- [ ] 백엔드 쿠키 설정 확인 (Refresh Token)
  - `HttpOnly: true`
  - `Secure: true`
  - `SameSite: None`
- [ ] 로컬 빌드 테스트
  ```bash
  npm run build
  npm run preview
  ```
- [ ] TypeScript 에러 확인
  ```bash
  npm run lint
  ```

### 배포 후 확인사항

- [ ] 홈페이지 정상 로드
- [ ] 로그인/회원가입 정상 작동
- [ ] API 호출 정상 작동 (Network 탭 확인)
- [ ] 브라우저 콘솔 에러 없음
- [ ] 결제 기능 테스트
- [ ] Admin/Mentor 페이지 접근 테스트
- [ ] 모바일 반응형 확인

---

## 백엔드 CORS 설정 예시

백엔드 팀에 다음 CORS 설정 요청:

### Spring Boot 예시
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:5173",           // 로컬 개발
                "https://yourproject.vercel.app",  // Production
                "https://*.vercel.app"             // Preview 환경
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

### 쿠키 설정 (Refresh Token)
```java
Cookie refreshTokenCookie = new Cookie("refreshToken", token);
refreshTokenCookie.setHttpOnly(true);
refreshTokenCookie.setSecure(true);  // HTTPS only
refreshTokenCookie.setPath("/");
refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
refreshTokenCookie.setSameSite("None"); // Cross-origin 허용
```

---

## 문제 해결 (Troubleshooting)

### 1. API 호출이 실패하는 경우

**증상**: 모든 API 호출이 실패, CORS 에러

**해결**:
1. Vercel에서 `VITE_API_BASE_URL` 설정 확인
2. 백엔드 CORS 설정에 Vercel 도메인 추가
3. 브라우저 개발자 도구 > Network 탭에서 요청 URL 확인

### 2. 환경변수가 적용되지 않는 경우

**증상**: `import.meta.env.VITE_API_BASE_URL`이 undefined

**해결**:
1. 환경변수는 반드시 `VITE_` 접두사 필요
2. 환경변수 추가 후 재배포 필요
3. Vercel 빌드 로그에서 환경변수 확인

### 3. 로그인 후 토큰이 저장되지 않는 경우

**증상**: 로그인 성공 후 새로고침하면 로그아웃 상태

**해결**:
1. 백엔드 쿠키 설정 확인 (`SameSite=None`, `Secure=true`)
2. HTTPS 환경에서만 작동 (Vercel은 자동 HTTPS)
3. 브라우저 쿠키 설정 확인

### 4. 빌드가 실패하는 경우

**증상**: Vercel 빌드 중 TypeScript 에러

**해결**:
1. 로컬에서 `npm run build` 실행하여 에러 확인
2. `tsconfig.json` 설정 확인
3. 의존성 버전 충돌 확인 (`npm install`)

---

## 성능 최적화 (선택사항)

### 1. 번들 크기 분석
```bash
npm install --save-dev rollup-plugin-visualizer
```

`vite.config.ts`에 추가:
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});
```

### 2. 코드 스플리팅
```typescript
// 큰 페이지는 lazy loading
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
```

### 3. 이미지 최적화
- Vercel Image Optimization 사용
- WebP 포맷 사용
- Lazy loading 적용

---

## 참고 링크

- [Vercel Environment Variables 문서](https://vercel.com/docs/projects/environment-variables)
- [Vite Environment Variables 문서](https://vitejs.dev/guide/env-and-mode.html)
- [React Router v7 문서](https://reactrouter.com/)
- [Vercel 배포 문서](https://vercel.com/docs/deployments/overview)
