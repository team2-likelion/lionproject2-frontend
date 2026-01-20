# DevSolve 페이지별 접근 주소

개발 서버: `http://localhost:5174`

## 페이지 목록 (17개)

| 페이지 | 경로 | 전체 URL |
|--------|------|----------|
| 홈 (랜딩) | `/` | http://localhost:5174/ |
| 이용 방법 | `/how-it-works` | http://localhost:5174/how-it-works |
| 멘토 목록 | `/mentors` | http://localhost:5174/mentors |
| 멘토 상세 | `/mentor/:id` | http://localhost:5174/mentor/1 |
| 멘토 지원 | `/mentor/apply` | http://localhost:5174/mentor/apply |
| 멘토 대시보드 | `/mentor/dashboard` | http://localhost:5174/mentor/dashboard |
| 로그인 | `/login` | http://localhost:5174/login |
| 회원가입 | `/signup` | http://localhost:5174/signup |
| Q&A 목록 | `/qna` | http://localhost:5174/qna |
| 질문 작성 | `/qna/create` | http://localhost:5174/qna/create |
| 질문 상세 | `/qna/:questionId` | http://localhost:5174/qna/1 |
| 과외 상세 | `/tutorial/:tutorialId` | http://localhost:5174/tutorial/1 |
| 과외 등록 | `/tutorial/create` | http://localhost:5174/tutorial/create |
| 과외 수정 | `/tutorial/edit/:tutorialId` | http://localhost:5174/tutorial/edit/1 |
| 결제 페이지 | `/payment/:tutorialId` | http://localhost:5174/payment/1 |
| 결제 완료 | `/payment/complete` | http://localhost:5174/payment/complete |
| 결제 내역 | `/mypage/payments` | http://localhost:5174/mypage/payments |
| 멘티 마이페이지 | `/mypage` | http://localhost:5174/mypage |

## 주요 사용자 플로우

### 멘티 플로우
1. 홈 → 멘토 목록 → 멘토 상세 → 과외 상세 → 수업 신청 (Dialog) → 결제 → 결제 완료
2. 홈 → Q&A 목록 → 질문 작성 / 질문 상세

### 멘토 플로우
1. 홈 → 멘토 지원 → (승인 후) 멘토 대시보드
2. 멘토 대시보드 → 과외 등록/수정

### 인증 플로우
- 로그인: `/login`
- 회원가입: `/signup`
