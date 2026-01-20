# 백엔드 요청사항 - ERD 및 API 수정 필요

프론트엔드 UI 구현 과정에서 확인된 ERD/API 수정 요청사항입니다.

---

## 1. ERD 수정 요청

### 1.1 `answers` 테이블 컬럼 추가

현재 ERD:
```sql
CREATE TABLE `answers` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
```

**추가 요청 컬럼:**

| 컬럼명 | 타입 | 설명 | 필요 이유 |
|--------|------|------|-----------|
| `mentor_id` | bigint NOT NULL | 답변 작성자(멘토) FK | 답변 작성자 정보 표시 필요 |
| `is_accepted` | boolean DEFAULT false | 채택 여부 | 멘티가 답변 채택 기능 |

**수정된 DDL:**
```sql
CREATE TABLE `answers` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `mentor_id` bigint NOT NULL,           -- 추가
  `content` text NOT NULL,
  `is_accepted` boolean DEFAULT false,   -- 추가
  `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

ALTER TABLE `answers` ADD FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`);
```

**UI 사용처:**
- QuestionDetailPage: 답변 작성자 표시, 채택된 답변 하이라이트

---

### 1.2 `users` 테이블 - 프로필 이미지 컬럼

| 컬럼명 | 타입 | 설명 | 필요 이유 |
|--------|------|------|-----------|
| `profile_image` | varchar(500) | 프로필 이미지 URL | 멘토/멘티 프로필 표시 |

**수정된 DDL:**
```sql
ALTER TABLE `users` ADD COLUMN `profile_image` varchar(500) NULL;
```

**UI 사용처:**
- MentorListPage: 멘토 목록 카드
- MentorDetailPage: 멘토 프로필
- 대시보드 페이지들

---

## 2. API 응답 형식 요청

### 2.1 멘토 목록 API (`GET /api/mentors`)

**현재 프론트 Mock 데이터 구조:**
```typescript
{
  id: number;
  name: string;           // user.nickname
  title: string;          // career 또는 별도 필드
  rating: number;         // 평균 평점 (tutorials의 rating 평균)
  skills: string[];       // mentor_skills join
  description: string;    // user.introduction
  price: number;          // 최저가 tutorial price
  isOnline: boolean;      // 온라인 여부 (새 필드 필요?)
  image: string;          // user.profile_image
}
```

**요청 응답 형식:**
```json
{
  "content": [
    {
      "id": 1,
      "userId": 1,
      "user": {
        "nickname": "김데브",
        "introduction": "7년차 풀스택 개발자",
        "profileImage": "https://..."
      },
      "career": "카카오, 토스 경력",
      "status": "APPROVED",
      "reviewCount": 128,
      "skills": [
        { "id": 1, "skillName": "Spring Boot" },
        { "id": 2, "skillName": "JPA" }
      ],
      "averageRating": 4.9,
      "minPrice": 45000,
      "isOnline": true
    }
  ],
  "totalElements": 128,
  "totalPages": 13
}
```

---

### 2.2 과외 상세 API (`GET /api/tutorials/{id}`)

**요청 응답 형식:**
```json
{
  "id": 1,
  "mentorId": 1,
  "mentor": {
    "id": 1,
    "user": {
      "nickname": "김데브",
      "email": "kim@example.com",
      "profileImage": "https://..."
    },
    "career": "7년차 풀스택 개발자",
    "reviewCount": 128,
    "skills": [...]
  },
  "title": "주니어 풀스택 핵심 역량 강화",
  "description": "...",
  "price": 450000,
  "duration": 120,
  "rating": 4.9,
  "status": "ACTIVE",
  "skills": [...],
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "content": "좋은 수업이었습니다",
      "mentee": { "nickname": "이**" },
      "createdAt": "2024-01-10T00:00:00"
    }
  ],
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-10T00:00:00"
}
```

---

### 2.3 질문 상세 API (`GET /api/questions/{id}`)

**요청 응답 형식:**
```json
{
  "id": 1,
  "lessonId": 1,
  "lesson": {
    "tutorial": {
      "title": "주니어 풀스택 코스",
      "skills": [...]
    },
    "mentee": {
      "nickname": "개발초보"
    }
  },
  "title": "JWT 토큰 만료 처리 방법",
  "content": "...",
  "codeContent": "...",
  "answers": [
    {
      "id": 1,
      "questionId": 1,
      "mentorId": 1,
      "mentor": {
        "user": { "nickname": "김데브" }
      },
      "content": "...",
      "isAccepted": true,
      "createdAt": "2024-01-10T12:00:00"
    }
  ],
  "createdAt": "2024-01-10T10:00:00"
}
```

---

## 3. 누락된 API 엔드포인트

### 3.1 수업 관리 API

| Method | Endpoint | 설명 | 현재 상태 |
|--------|----------|------|-----------|
| PUT | `/api/lessons/{id}/accept` | 수업 수락 | 명세에 있음, UI 구현 필요 |
| PUT | `/api/lessons/{id}/reject` | 수업 거절 | 명세에 있음, UI 구현 필요 |
| PUT | `/api/lessons/{id}/complete` | 수업 완료 | 명세에 있음, UI 구현 필요 |

**요청:** 멘토 대시보드에서 사용할 예정이므로 구현 확인 부탁드립니다.

### 3.2 답변 채택 API (새로 필요)

| Method | Endpoint | 설명 |
|--------|----------|------|
| PUT | `/api/answers/{id}/accept` | 답변 채택 |

**Request Body:** 없음 (또는 `{ "isAccepted": true }`)

---

## 4. 프론트엔드 타입 정의 (참고용)

현재 프론트엔드에서 사용 중인 타입입니다.

```typescript
// types/index.ts

export type UserRole = 'MENTOR' | 'MENTEE';
export type MentorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TutorialStatus = 'ACTIVE' | 'INACTIVE';
export type LessonStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED';

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
  introduction?: string;
  profileImage?: string;  // 추가 요청
  createdAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  mentorId: number;       // ERD 추가 요청
  mentor?: User;          // join 응답
  content: string;
  isAccepted?: boolean;   // ERD 추가 요청
  createdAt: string;
}
```

---

## 5. 요약 체크리스트

### ERD 수정
- [ ] `answers` 테이블에 `mentor_id` 컬럼 추가
- [ ] `answers` 테이블에 `is_accepted` 컬럼 추가
- [ ] `users` 테이블에 `profile_image` 컬럼 추가 (선택)

### API 구현 확인
- [ ] `PUT /api/lessons/{id}/accept` - 수업 수락
- [ ] `PUT /api/lessons/{id}/reject` - 수업 거절
- [ ] `PUT /api/lessons/{id}/complete` - 수업 완료
- [ ] `PUT /api/answers/{id}/accept` - 답변 채택 (새로 필요)

### API 응답 형식
- [ ] 멘토 목록 - user, skills join 포함
- [ ] 과외 상세 - mentor, reviews join 포함
- [ ] 질문 상세 - lesson, answers with mentor join 포함

---

*문서 작성일: 2025-01-12*
*프론트엔드 담당자 작성*
