# Vercel 안전 배포 가이드

## 현재 상태 (2026-01-20)

### ✅ 배포 가능 상태
- TypeScript 빌드 성공
- 모든 lint 통과
- vercel.json 올바르게 구성됨
- .env.example 업데이트 완료

### ⚠️ 배포 전 필수 작업
1. Vercel에서 `VITE_API_BASE_URL` 환경변수 설정
2. 백엔드 CORS 설정 확인

---

## 보안 수정사항별 배포 영향

### 즉시 적용 가능 (위험도: 없음)

#### 1. console.log 제거 (프로덕션 빌드)

**수정 파일**: `vite.config.ts`

**변경 내용**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,    // console.* 제거
        drop_debugger: true    // debugger 제거
      }
    }
  }
})
```

**배포 영향**:
- ✅ Vercel 빌드 성공 보장
- ✅ 번들 크기 약간 감소
- ✅ 보안 강화 (콘솔 로그 노출 방지)
- ✅ 개발 환경은 영향 없음 (로컬 개발 시 console.log 계속 보임)

**테스트 방법**:
```bash
npm run build
npm run preview
# 브라우저 콘솔에서 에러 메시지 확인 (표시 안 되면 성공)
```

---

### 백엔드 협의 필요 (위험도: 중간)

#### 2. AdminRefundPage - URL 토큰 제거

**현재 문제**:
- `src/pages/AdminRefundPage.tsx:97`
- 토큰이 URL 쿼리 파라미터로 노출

**해결 방안**:

**Option A: fetch-event-source 라이브러리 사용 (권장)**

1. 패키지 설치:
```bash
npm install @microsoft/fetch-event-source
```

2. 코드 수정:
```typescript
import { fetchEventSource } from '@microsoft/fetch-event-source';

// 기존 EventSource 대신
await fetchEventSource(`${API_BASE_URL}/api/admin/payments/refund-requests/stream`, {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  onmessage(event) {
    // 메시지 처리
  }
});
```

3. 백엔드 수정 필요:
   - GET에서 POST로 변경 (또는 GET이지만 헤더에서 토큰 읽기)

**Option B: 백엔드를 쿠키 기반 인증으로 변경**

1. 백엔드 수정:
   - SSE 엔드포인트에서 쿠키에서 토큰 읽기
   - `withCredentials` 지원

2. 프론트 코드 간단해짐:
```typescript
const eventSource = new EventSource(
  `${API_BASE_URL}/api/admin/payments/refund-requests/stream`,
  { withCredentials: true }  // 쿠키 자동 전송
);
```

**배포 영향**:
- ⚠️ 백엔드 API 변경 필요
- ⚠️ 백엔드 먼저 배포 후 프론트 배포
- ⚠️ 순서 틀리면 Admin 환불 기능 중단

**권장 배포 순서**:
1. 백엔드 API 변경 배포 (하위 호환성 유지)
2. 프론트엔드 수정 배포
3. 기존 방식 제거

---

### 장기 개선 항목 (위험도: 높음)

#### 3. Access Token 저장 방식 변경

**현재**: localStorage에 저장
**목표**: 메모리 또는 httpOnly 쿠키

**변경 시 영향**:
- 🔴 새로고침 시 로그아웃 가능성
- 🔴 사용자 경험 변경
- 🔴 복잡한 리팩토링 필요

**권장**:
- **현재는 변경하지 않음**
- 대신 CSP 헤더로 XSS 방어
- 또는 백엔드와 함께 httpOnly 쿠키로 전환 (대규모 작업)

---

## 즉시 배포 가능한 수정 체크리스트

### Phase 1: 안전한 수정 (지금 가능)

- [ ] vite.config.ts에 console 제거 설정 추가
- [ ] 로컬 빌드 테스트
  ```bash
  npm run build
  npm run preview
  ```
- [ ] 브라우저에서 기능 테스트
- [ ] 콘솔에 에러 로그 안 나오는지 확인
- [ ] Git 커밋 & 푸시
- [ ] Vercel 자동 배포 확인
- [ ] Production URL에서 테스트

### Phase 2: 백엔드 협의 후 (나중에)

- [ ] 백엔드 팀과 SSE 인증 방식 논의
- [ ] 백엔드 API 변경 일정 확인
- [ ] Staging 환경에서 테스트
- [ ] Production 배포

---

## Vercel 환경변수 설정 (필수)

### Production 환경
```
VITE_API_BASE_URL=https://api.yourproject.com
```

### Preview 환경 (선택)
```
VITE_API_BASE_URL=https://api-staging.yourproject.com
```

### 설정 방법
1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. Key: `VITE_API_BASE_URL`
4. Value: 백엔드 API URL
5. Environment: Production 체크
6. Save

---

## 배포 후 확인사항

### 1. 기본 기능 테스트
- [ ] 홈페이지 로드
- [ ] 로그인/회원가입
- [ ] 멘토 목록 조회
- [ ] 과외 상세 페이지

### 2. 인증 테스트
- [ ] 로그인 후 마이페이지 접근
- [ ] 새로고침 후에도 로그인 유지
- [ ] 로그아웃 정상 작동

### 3. 결제 테스트 (중요!)
- [ ] 결제 페이지 로드
- [ ] PortOne SDK 로드 확인 (콘솔 에러 없음)
- [ ] 테스트 결제 진행

### 4. Admin 테스트
- [ ] Admin 대시보드 접근
- [ ] 멘토 승인 기능
- [ ] 환불 관리 (SSE 연결 확인)

### 5. 콘솔 확인
- [ ] 브라우저 개발자 도구 → Console 탭
- [ ] 에러 메시지 없는지 확인
- [ ] Network 탭에서 API 호출 성공 확인

---

## 문제 발생 시 롤백 방법

### Vercel에서 이전 버전으로 롤백
1. Vercel Dashboard → Deployments
2. 이전 성공한 배포 찾기
3. 오른쪽 ... 메뉴 → "Promote to Production"
4. 즉시 이전 버전으로 복구됨

### Git으로 롤백
```bash
git revert HEAD
git push
# Vercel이 자동으로 이전 버전 재배포
```

---

## 보안 개선 로드맵

### Milestone 1: 즉시 배포 (현재)
- [x] .env.example 업데이트
- [ ] vite.config.ts console 제거
- [ ] Vercel 환경변수 설정

### Milestone 2: 1주일 내
- [ ] ErrorBoundary 추가
- [ ] ProtectedRoute 구현
- [ ] 404 페이지 추가

### Milestone 3: 2주일 내
- [ ] AdminRefundPage URL 토큰 제거 (백엔드 협의)
- [ ] Toast 알림 시스템 도입
- [ ] Sentry 에러 트래킹 설정

### Milestone 4: 1개월 내
- [ ] CSP 헤더 추가 (백엔드)
- [ ] SRI 해시 추가 (PortOne 공식 지원 시)
- [ ] 번들 크기 최적화

---

## 참고 링크

- [Vite Build Options](https://vitejs.dev/config/build-options.html)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [fetch-event-source](https://github.com/Azure/fetch-event-source)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
