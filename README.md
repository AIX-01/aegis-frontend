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
│   ├── globals.css         # 전역 스타일
│   ├── page.tsx            # 메인 (카메라 모니터링)
│   ├── auth/               # 로그인/회원가입
│   ├── events/             # 이벤트 목록
│   ├── statistics/         # 통계 대시보드
│   ├── members/            # 멤버 관리 (Admin)
│   ├── actions/            # 액션 관리 (Admin)
│   ├── manuals/            # 매뉴얼 관리 (Admin)
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
│   ├── actions/            # 액션 관리 (Admin)
│   │   ├── ActionsPageContent.tsx
│   │   ├── ActionCard.tsx
│   │   └── ActionEditModal.tsx
│   ├── manuals/            # 매뉴얼 관리 (Admin)
│   │   ├── ManualsPageContent.tsx
│   │   ├── ManualCard.tsx
│   │   └── ManualEditModal.tsx
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
│       ├── dropdown-menu.tsx
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
│   └── utils.ts            # 유틸리티 함수 (cn, getEventTypeKorean)
└── types/
    └── index.ts            # TypeScript 타입 정의
```

---

## 핵심 워크플로우

### Context 계층

| Context | 역할 | 주요 기능 |
|---------|------|----------|
| `AuthContext` | 인증 상태 | user, login, logout, isAdmin |
| `SseContext` | SSE 실시간 연결 | 알림 수신, React Query 캐시 무효화 |
| `WebRTCContext` | WebRTC 스트림 | 카메라별 연결/해제, 상태 구독 |


### 1. 앱 초기화 및 인증 복원 흐름

```
1. App 로드 → AuthProvider 마운트
2. AuthContext.useEffect:
   - POST /api/auth/refresh (Cookie의 Refresh Token 사용)
   - 성공: Access Token 저장 → GET /api/auth/me → user 상태 설정
   - 실패: user=null, 로그인 필요 상태
3. ProtectedRoute:
   - isLoading: 로딩 스피너
   - !user: /auth로 리다이렉트
   - requireAdmin && !isAdmin: /로 리다이렉트
   - user: children 렌더링
```

### 2. SSE 실시간 업데이트 흐름

```
1. 로그인 성공 → SseProvider 연결 시작
2. GET /api/notifications/stream (fetchEventSource)
   - Authorization: Bearer {accessToken}
3. 이벤트 수신 시:
   - notification: queryClient.invalidateQueries(notifications) + 토스트
   - camera: queryClient.invalidateQueries(cameras)
   - event: queryClient.invalidateQueries(events)
   - event-deleted: queryClient.invalidateQueries(events)
   - member: queryClient.invalidateQueries(users)
4. 연결 오류 시: 5초 후 자동 재연결
5. 로그아웃 시: AbortController로 연결 종료
```

### 3. WebRTC 스트리밍 흐름

```
1. CCTVGrid 렌더링 → setActiveGridCameras([카메라IDs])
2. WebRTCPlayer 마운트:
   - subscribeToStream(cameraId) → 상태 구독
   - connectStream(cameraId, accessToken, streamUrl) 호출
3. WebRTCContext.connectStream:
   - RTCPeerConnection 생성
   - addTransceiver('video', 'audio')
   - createOffer() → POST /stream/{camera}/whep
     - Authorization: Basic base64("_:" + accessToken)
   - SDP Answer 수신 → setRemoteDescription
   - ontrack → MediaStream 저장 → 구독자에게 알림
4. WebRTCPlayer:
   - stream 수신 → video.srcObject = stream
   - state=error → 에러 메시지 표시
5. 페이지 이동 시:
   - setActiveGridCameras([새 카메라IDs])
   - 이전 페이지 카메라 자동 disconnectStream
```

### 4. API 요청/응답 및 에러 처리 흐름

```
1. API 요청 (lib/axios.ts):
   - 요청 인터셉터: Authorization 헤더 주입
   - 응답 인터셉터:
     - 401/403 에러 → refresh 시도 → 재요청
     - refresh 실패 → /auth로 리다이렉트

2. React Query 패턴:
   - useQuery: 데이터 조회 (캐싱, staleTime: 30초)
   - useMutation: 데이터 변경 → onSuccess에서 invalidateQueries

3. 낙관적 업데이트 (카메라 설정 등):
   - onMutate: 캐시 즉시 업데이트
   - onError: 롤백
   - onSettled: invalidateQueries로 서버 상태 동기화
```

---

## 핵심 컴포넌트 상세

### AuthContext

```typescript
interface AuthContextType {
  user: User | null;          // 현재 로그인 사용자
  isLoading: boolean;         // 인증 상태 로딩 중
  login: (email, password) => Promise<{success, error?}>;
  signup: (email, password, name) => Promise<{success, error?}>;
  logout: () => Promise<void>;
  isAdmin: boolean;           // user?.role === 'admin'
}
```

### SseContext

- **연결 관리**: 로그인 시 자동 연결, 로그아웃 시 자동 해제
- **이벤트 핸들링**: 5가지 이벤트 타입별 React Query 캐시 무효화
- **재연결**: 연결 오류 시 5초 후 자동 재연결
- **토스트**: notification 이벤트 수신 시 자동 표시

### WebRTCContext

```typescript
interface WebRTCContextType {
  getStream: (cameraId) => StreamInfo | null;
  connectStream: (cameraId, accessToken, streamUrl) => Promise<void>;
  disconnectStream: (cameraId) => void;
  subscribeToStream: (cameraId, callback) => () => void;  // cleanup 함수 반환
  setActiveGridCameras: (cameraIds) => void;  // 페이지별 활성 카메라 설정
  cleanupAll: () => void;
}

interface StreamInfo {
  pc: RTCPeerConnection | null;
  stream: MediaStream | null;
  cameraId: string;
  state: 'connecting' | 'playing' | 'error';
  errorMessage?: string;
}
```

### WebRTCPlayer

- **Props**: `camera: ManagedCamera`
- **기능**: 
  - 카메라 연결 상태(connected)에 따른 UI 분기
  - 스트림 상태(connecting/playing/error)별 UI
  - 재연결 버튼
- **최적화**: subscribeToStream으로 필요한 카메라만 구독

### CCTVGrid

- **Props**: `cameras: ManagedCamera[]`
- **기능**:
  - 3x2 그리드 레이아웃
  - 페이지네이션 (6개씩)
  - 페이지 변경 시 setActiveGridCameras 호출
- **최적화**: 현재 페이지 카메라만 WebRTC 연결

### EventDetailModal

- **Props**: `event: Event, open: boolean, onOpenChange: (open: boolean) => void`
- **기능**:
  - 이벤트 상세 정보 표시 (위험도 아이콘, 타입 배지, 상태 배지, 카메라 배지)
  - AI 요약 및 권장 조치 표시
  - 클립 재생 (presigned URL) 및 다운로드
  - 보고서 보기 (새 탭) 및 다운로드 (PDF/DOCX)
  - 미준비 시 버튼 disabled 처리

### NotificationModal

- **Props**: `notifications: Notification[], open: boolean, onOpenChange: (open: boolean) => void`
- **기능**:
  - 알림 목록 실시간 표시 (SSE로 새 알림 추가됨)
  - 모달 닫힐 때 전체 알림 삭제 (x, esc, 바깥 클릭 모두)
  - 새로고침 시에도 읽은 알림 삭제 (fetch keepalive)
  - x 버튼 자동 포커스 비활성화
### EventBadges

- **EventTypeBadge**: risk 기반 색상 (abnormal: 빨강, suspicious: 노랑)
- **EventStatusBadge**: 분석중/분석완료 표시
- **CameraBadge**: location(name) 형식으로 표시
- **EventIcon**: risk 기반 아이콘 (abnormal: 원+느낌표, suspicious: 삼각형+느낌표)

### EventLog

- 이벤트 목록 카드 (risk별 왼쪽 라인 색상)
- 배지 순서: 타입 → 분석상태 → 카메라
- 우측에 발생 시각 및 경과 시간 표시
- `getEventTypeKorean` 유틸리티 사용

### EventsPageContent

- 서버사이드 필터링 (위험도, 유형, 상태, 카메라, 기간)
- 필터 적용 없이 닫으면 UI 상태 자동 복원
- 페이지네이션과 필터 상태 연동

### ActionsPageContent

- Card 컨테이너 내 스크롤 레이아웃
- 액션 목록 + 페이지네이션
- ActionCard: 액션 카드, on/off 토글
- ActionEditModal: 생성/수정/삭제 모달, 파라미터 동적 폼

### ManualsPageContent

- Card 컨테이너 내 스크롤 레이아웃
- 매뉴얼 목록 + 페이지네이션
- ManualCard: 매뉴얼 카드, on/off 토글
- ManualEditModal: 생성/수정/삭제 모달, 내용 미리보기

---

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
| `/events` | 이벤트 목록 | 감지된 이벤트 목록, 서버사이드 필터링(위험도, 유형, 상태, 카메라, 기간) | 로그인 |
| `/statistics` | 통계 대시보드 | 주간 추이, 유형별 분포, 캘린더 | 로그인 |
| `/actions` | 액션 관리 | AI Agent 실행 액션 목록, 활성화/비활성화, 파라미터 설정 | Admin |
| `/manuals` | 매뉴얼 관리 | AI Agent 참조 매뉴얼 목록, 활성화/비활성화, RAG 임베딩 동기화 | Admin |
| `/members` | 멤버 관리 | 멤버 목록(최신 가입순), 승인 대기(최신 가입순) 탭, 카메라 권한 관리, 삭제 확인 다이얼로그 | Admin |
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
| `getAll(page, size, filters?)` | 이벤트 목록 (페이지네이션, 서버사이드 필터링) |
| `getById(id)` | 이벤트 상세 조회 |
| `getClipBlobUrl(id)` | 클립 Blob URL 조회 |
| `downloadClip(id, filename)` | 클립 다운로드 |
| `getReportHtml(id)` | 보고서 HTML 조회 (새 창 렌더링용) |

**EventFilters 인터페이스**:
```typescript
interface EventFilters {
  risks?: string[];      // 위험도 필터 (suspicious, abnormal)
  types?: string[];      // 이상행동 유형 (assault, burglary, dump, swoon, vandalism)
  statuses?: string[];   // 분석 상태 (processing, analyzed)
  cameraIds?: string[];  // 카메라 ID 목록
  startDate?: string;    // 시작 날짜 (ISO 8601)
  endDate?: string;      // 종료 날짜 (ISO 8601)
}
```

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
| `getApproved(page, size)` | 승인된 사용자 목록 (최신 가입순) |
| `getPending(page, size)` | 미승인 사용자 목록 (최신 가입순) |
| `getPendingCount()` | 미승인 사용자 수 |
| `update(id, data)` | 사용자 정보 수정 |
| `delete(id)` | 사용자 삭제 |
| `approve(id)` | 사용자 승인 |

### actionsApi (Admin)

| 메서드 | 설명 |
|--------|------|
| `getAll(page, size)` | 액션 목록 (페이지네이션) |
| `getById(id)` | 액션 상세 조회 |
| `create(data)` | 액션 생성 |
| `update(id, data)` | 액션 수정 |
| `delete(id)` | 액션 삭제 |

### manualsApi (Admin)

| 메서드 | 설명 |
|--------|------|
| `getAll(page, size)` | 매뉴얼 목록 (페이지네이션) |
| `getById(id)` | 매뉴얼 상세 조회 |
| `create(data)` | 매뉴얼 생성 (Agent 임베딩 동기화) |
| `update(id, data)` | 매뉴얼 수정 (Agent 임베딩 동기화) |
| `delete(id)` | 매뉴얼 삭제 (Agent 임베딩 동기화) |

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
interface Camera {
  id: string;
  name: string;           // 미디어서버 원본 이름
  connected: boolean;     // 온라인/오프라인
}

interface ManagedCamera extends Camera {
  location: string;       // 장소 (수정 가능)
  enabled: boolean;       // 카메라 ON/OFF
  analysisEnabled: boolean; // AI 분석 ON/OFF
  streamUrl: string;      // WebRTC WHEP URL
}

interface CameraUpdateRequest {
  location?: string;
  enabled?: boolean;
  analysisEnabled?: boolean;
}
```

### Event

```typescript
interface EventAction {
  id: string;
  log: string;
  triggeredAt: string;
}

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
  actions?: EventAction[];
  ragReferences?: Record<string, unknown>[];
  report?: string;
}
```

### Notification

```typescript
interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;      // ISO8601 string
  eventId?: string;
}
```

### User

```typescript
type UserRole = 'user' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedCameras: string[];  // 어드민은 자동으로 전체 카메라 접근 권한
  createdAt: string;
  approved: boolean;
}

interface UserUpdateRequest {
  name?: string;
  role?: UserRole;
  assignedCameras?: string[];  // 어드민은 수정 불가 (전체 접근)
}
```

### Stats

```typescript
interface DailyStat {
  day: string;
  events: number;
  resolved: number;
}

interface EventTypeStat {
  type: string;
  count: number;
  color: string;
}

interface MonthlyEventData {
  [date: string]: {
    events: number;
    alerts: number;
  };
}

// 카메라별 통계
interface CameraStat {
  cameraId: string;
  cameraName: string;
  totalEvents: number;
  resolvedEvents: number;
  pendingEvents: number;
  lastEventTime?: string;
}

// 일일 상세 통계
interface DailyDetailStat {
  date: string;
  totalEvents: number;
  byType: {
    assault: number;
    burglary: number;
    dump: number;
    swoon: number;
    vandalism: number;
  };
  resolvedCount: number;
  avgResponseTime: number;
}

// 일일 보고서 요약
interface DailyReportSummary {
  date: string;
  totalEvents: number;
  resolvedEvents: number;
  pendingEvents: number;
  criticalCount: number;
  highCount: number;
  avgResponseTime: number;
  topCamera: string;
  topEventType: string;
  highlights: string[];
  overallStatus: 'safe' | 'caution' | 'warning' | 'critical';
}
```

### Auth

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: User;
}

interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

interface RefreshResponse {
  accessToken: string;
}

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
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

---

## 🐛 Known Issues

> 최종 감사일: 2026-02-05

### 중복 코드

| 파일 | 문제 | 권장 조치 |
|------|------|----------|
| 모든 페이지 컴포넌트 | `ProtectedRoute` 래핑 패턴 반복 | Next.js middleware 또는 layout에서 처리 |

### 미사용 코드

| 파일 | 문제 | 상세 |
|------|------|------|
| `types/index.ts` | `CameraStat`, `DailyDetailStat`, `DailyReportSummary` 타입 미사용 | 정의만 있고 실제 사용처 없음 |


### 보안 이슈

| 파일 | 문제 | 심각도 | 권장 조치 |
|------|------|--------|----------|
| `lib/axios.ts` | Access Token 메모리 저장 | 🟢 낮음 | XSS 취약점 시 노출 가능, CSP 헤더 강화 권장 |

### 구조 개선 필요

| 항목 | 설명 |
|------|------|
| 타입 동기화 | Backend API 변경 시 Frontend 타입을 수동 동기화해야 함. OpenAPI Generator 도입 권장 |
| 에러 핸들링 | API 에러 응답 형식이 통일되지 않음. 공통 에러 핸들러 필요 |


