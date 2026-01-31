# AEGIS Frontend

> Agent 기반 안전 모니터링 시스템 - 프론트엔드

## 개요

AEGIS Frontend는 실시간 CCTV 모니터링, 이상행동 감지 이벤트 관리, 통계 대시보드를 제공하는 웹 애플리케이션입니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 15.5, React 19 |
| Language | TypeScript 5.8 |
| 상태관리 | TanStack Query (React Query) 5.x |
| 스타일링 | Tailwind CSS 3.4, shadcn/ui (Radix UI) |
| HTTP | Axios 1.x |
| 실시간 | SSE (fetch-event-source), WebRTC (WHEP) |
| 차트 | Recharts 2.x |
| 날짜 | date-fns 3.x |
| 아이콘 | Lucide React |

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── layout.tsx          # 루트 레이아웃
│   ├── providers.tsx       # 전역 Provider 구성
│   ├── page.tsx            # 메인 (카메라 모니터링)
│   ├── auth/               # 로그인/회원가입
│   ├── events/             # 이벤트 목록
│   ├── statistics/         # 통계 대시보드
│   ├── members/            # 멤버 관리 (Admin)
│   ├── settings/           # 설정
│   ├── error.tsx           # 에러 페이지
│   ├── loading.tsx         # 로딩 페이지
│   └── not-found.tsx       # 404 페이지
├── components/
│   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/          # 대시보드 컴포넌트
│   │   ├── CCTVGrid.tsx
│   │   ├── WebRTCPlayer.tsx
│   │   ├── EventLog.tsx
│   │   ├── EventDetailModal.tsx
│   │   ├── StatsDashboard.tsx
│   │   └── DashboardContent.tsx
│   ├── auth/
│   │   └── AuthForm.tsx
│   ├── events/
│   │   └── EventsPageContent.tsx
│   ├── members/
│   │   └── MembersPageContent.tsx
│   ├── notifications/
│   │   └── NotificationModal.tsx
│   ├── settings/
│   │   └── SettingsPageContent.tsx
│   ├── statistics/
│   │   └── StatisticsPageContent.tsx
│   ├── common/
│   │   └── EventBadges.tsx
│   └── ui/                 # shadcn/ui 컴포넌트
│       ├── alert-dialog.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── sheet.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── tooltip.tsx
│       └── use-toast.ts
├── contexts/               # React Context
│   ├── AuthContext.tsx     # 인증 상태 관리
│   ├── SseContext.tsx      # SSE 실시간 연결
│   └── WebRTCContext.tsx   # WebRTC 스트림 관리
├── hooks/
│   ├── useMonitoring.ts    # 카메라 모니터링 훅
│   └── use-toast.ts        # 토스트 알림 훅
├── lib/
│   ├── api.ts              # API 클라이언트
│   ├── axios.ts            # Axios 인스턴스 및 인터셉터
│   ├── queryKeys.ts        # React Query 키 관리
│   └── utils.ts            # 유틸리티 함수 (cn)
└── types/
    └── index.ts            # TypeScript 타입 정의
```

## 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 실행
pnpm start

# 린트 검사
pnpm lint
```

## 페이지 구성

| 경로 | 페이지 | 설명 | 권한 |
|------|--------|------|------|
| `/` | 카메라 모니터링 | 실시간 CCTV 그리드 (3x2, 6개) | 로그인 |
| `/auth` | 로그인/회원가입 | 인증 페이지 | 공개 |
| `/events` | 이벤트 목록 | 감지된 이벤트 목록 및 상세 | 로그인 |
| `/statistics` | 통계 대시보드 | 주간 추이, 유형별 분포, 캘린더 | 로그인 |
| `/members` | 멤버 관리 | 사용자 승인, 권한 관리 | Admin |
| `/settings` | 설정 | 프로필, 비밀번호, 계정 삭제 | 로그인 |

## 상태 관리

### Provider 구조 (providers.tsx)

```
QueryClientProvider
└── TooltipProvider
    └── AuthProvider
        └── SseProvider
            └── WebRTCProvider
                └── children
```

### AuthContext

- `user`: 현재 로그인한 사용자 정보
- `isLoading`: 인증 상태 로딩 중
- `isAdmin`: 관리자 여부
- `login()`: 로그인
- `signup()`: 회원가입
- `logout()`: 로그아웃

### SseContext

- SSE 연결 관리 (`/api/notifications/stream`)
- 이벤트 타입별 React Query 캐시 무효화
  - `notification`: 알림 목록 갱신 + 토스트 표시
  - `camera`: 카메라 목록 갱신
  - `event`: 이벤트 목록 갱신
  - `event-deleted`: 이벤트 삭제 반영
  - `member`: 멤버 목록 갱신

### WebRTCContext

- WebRTC 스트림 전역 관리
- `connectStream()`: 스트림 연결
- `disconnectStream()`: 스트림 해제
- `subscribeToStream()`: 스트림 상태 구독
- `setActiveGridCameras()`: 활성 카메라 설정 (페이지 전환 시 자동 해제)

### React Query

- `queryKeys.ts`: 쿼리 키 중앙 관리
- SSE 이벤트 수신 시 `invalidateQueries()`로 캐시 무효화
- 기본 설정: `staleTime: 30초`, `retry: 1`, `refetchOnWindowFocus: false`

## API 클라이언트 (lib/api.ts)

### authApi

| 메서드 | 설명 |
|--------|------|
| `login(data)` | 로그인 |
| `signup(data)` | 회원가입 |
| `logout()` | 로그아웃 |
| `refresh()` | 토큰 갱신 |
| `me()` | 내 정보 조회 |
| `updateProfile(data)` | 프로필 수정 |
| `changePassword(data)` | 비밀번호 변경 |
| `deleteAccount()` | 회원 탈퇴 |

### camerasApi

| 메서드 | 설명 |
|--------|------|
| `getAll(page, size)` | 카메라 목록 (페이지네이션, 기본 size=6) |
| `getAllList()` | 카메라 전체 목록 (멤버 관리용) |
| `update(id, data)` | 카메라 정보 수정 |

### eventsApi

| 메서드 | 설명 |
|--------|------|
| `getAll(page, size)` | 이벤트 목록 (페이지네이션, 기본 size=20) |
| `getClipBlobUrl(id)` | 클립 Blob URL (인증 포함) |
| `downloadClip(id, filename)` | 클립 다운로드 |

### notificationsApi

| 메서드 | 설명 |
|--------|------|
| `getAll()` | 알림 목록 |
| `deleteAll()` | 전체 삭제 |

### statsApi

| 메서드 | 설명 |
|--------|------|
| `getDaily()` | 일별 통계 (주간) |
| `getEventTypes()` | 유형별 통계 |
| `getMonthly()` | 월별 통계 (캘린더용) |

### usersApi (Admin)

| 메서드 | 설명 |
|--------|------|
| `getAll(page, size)` | 사용자 목록 (페이지네이션) |
| `update(id, data)` | 사용자 정보 수정 |
| `delete(id)` | 사용자 삭제 |
| `approve(id)` | 사용자 승인 |

## 인증 흐름

### 토큰 관리

- **Access Token**: 메모리 저장 (`lib/axios.ts`의 `accessToken` 변수)
- **Refresh Token**: HttpOnly Cookie (서버에서 설정)

### Axios 인터셉터 (lib/axios.ts)

1. **요청 인터셉터**: `Authorization: Bearer {accessToken}` 헤더 자동 주입
2. **응답 인터셉터**: 401/403 에러 시 자동 토큰 갱신 후 재요청
   - 갱신 실패 시 `/auth` 페이지로 리다이렉트

### 앱 로드 시 인증 복원

1. `AuthContext`에서 `/api/auth/refresh` 호출
2. 성공 시 Access Token 저장 + 사용자 정보 조회
3. 실패 시 로그인 필요 상태

## WebRTC 스트리밍

### WHEP 프로토콜

- 엔드포인트: `/stream/{cameraName}/whep`
- 인증: Basic Auth (`_:{accessToken}` base64 인코딩)

### 연결 흐름

1. `WebRTCPlayer`에서 `connectStream()` 호출
2. RTCPeerConnection 생성 + Offer 생성
3. WHEP 엔드포인트로 SDP Offer 전송
4. SDP Answer 수신 후 연결 완료
5. `ontrack` 이벤트로 MediaStream 수신

### 페이지 전환 시 스트림 관리

- `CCTVGrid`에서 `setActiveGridCameras()` 호출
- 이전 페이지 카메라는 자동 연결 해제
- 현재 페이지 카메라만 연결 유지

## 타입 정의 (types/index.ts)

### Camera

```typescript
interface ManagedCamera {
  id: string;
  name: string;           // 미디어서버 원본 이름
  location: string;       // 장소 (수정 가능)
  connected: boolean;     // 온라인/오프라인
  enabled: boolean;       // 카메라 ON/OFF
  analysisEnabled: boolean; // AI 분석 ON/OFF
  streamUrl: string;      // WebRTC WHEP URL
}
```

### Event

```typescript
interface Event {
  id: string;
  cameraId: string;
  cameraName: string;
  risk: 'normal' | 'suspicious' | 'abnormal';
  type: 'assault' | 'burglary' | 'dump' | 'swoon' | 'vandalism';
  occurredAt: string;
  status: 'processing' | 'analyzed';
  clipUrl?: string;
  summary?: string;
  riskScore?: string;
  actions?: Record<string, unknown>[];
  ragReferences?: Record<string, unknown>[];
  report?: string;
}
```

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  assignedCameras: string[];
  createdAt: string;
  approved: boolean;
}
```

### PageResponse

```typescript
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
```

## 빌드 및 배포

### 환경 변수

프로덕션 환경에서는 별도 환경 변수 설정 불필요 (Caddy 리버스 프록시 사용)

### 빌드

```bash
pnpm build
```

### Docker 배포

Caddy 리버스 프록시를 통해 `/` 경로로 서비스됩니다.
- 개발: `host.docker.internal:3000`
- API: `/api/*` → Backend
- 스트림: `/stream/*` → MediaMTX
