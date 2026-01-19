# AEGIS 데이터베이스 ERD

> AI 기반 안전 모니터링 시스템 데이터베이스 설계

**버전**: 2.0.0  
**최종 업데이트**: 2026-01-19

---

## 기술 스택

| 용도 | 기술 | 설명 |
|------|------|------|
| 메인 DB | **PostgreSQL** | 사용자, 카메라, 이벤트, 알림 등 영구 데이터 |
| 캐시/세션 | **Redis** | Access Token, Refresh Token, 세션 관리 |
| 오브젝트 스토리지 | **MinIO** | 이벤트 영상 클립 저장 |

---

## ERD 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              AEGIS DATABASE ERD (PostgreSQL)                             │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│        users         │       │   user_cameras (M:N) │       │       cameras        │
├──────────────────────┤       ├──────────────────────┤       ├──────────────────────┤
│ *id          UUID    │◄──────│ *user_id     UUID    │       │ *id          UUID    │
│  email       VARCHAR │  PK   │ *camera_id   UUID    │──────►│  name        VARCHAR │
│  password    VARCHAR │       └──────────────────────┘   PK  │  connected   BOOLEAN │
│  name        VARCHAR │              (Junction)              │  alias       VARCHAR │
│  role        ENUM    │                                      │  active      BOOLEAN │
│  approved    BOOLEAN │                                      │  created_at  TIMESTAMP│
│  created_at  TIMESTAMP│                                     │  updated_at  TIMESTAMP│
│  updated_at  TIMESTAMP│                                     └──────────────────────┘
└──────────────────────┘                                                 │
         │                                                               │ 1:N
         │ 1:N                                                           ▼
         ▼                                                    ┌──────────────────────┐
┌──────────────────────┐                                      │       events         │
│    notifications     │                                      ├──────────────────────┤
├──────────────────────┤                                      │ *id          UUID    │
│ *id          UUID    │                                      │  camera_id   UUID    │◄─┐
│  user_id     UUID    │──────┐                               │  type        ENUM    │  │
│  event_id    UUID    │──────│───────────────────────────────│  timestamp   TIMESTAMP  │
│  type        ENUM    │      │                               │  status      ENUM    │  │
│  title       VARCHAR │      │                               │  description TEXT    │  │
│  message     TEXT    │      │                               │  ai_action   TEXT    │  │
│  read        BOOLEAN │      │                               │  clip_url    VARCHAR │  │
│  created_at  TIMESTAMP│     │                               │  summary     TEXT    │  │
└──────────────────────┘      │                               │  analysis    TEXT    │  │
                              │                               │  created_at  TIMESTAMP  │
                              │                               │  updated_at  TIMESTAMP  │
┌──────────────────────┐      │                               └──────────────────────┘  │
│  emergency_contacts  │      │                                          │              │
├──────────────────────┤      │                                          └──────────────┘
│ *id          UUID    │      │
│  type        ENUM    │      │     ┌─────────────────────────────────────────────────┐
│  phone       VARCHAR │      │     │                    Redis                         │
│  email       VARCHAR │      │     ├─────────────────────────────────────────────────┤
│  created_at  TIMESTAMP│     │     │  access_token:{userId}  → token string (15min)  │
│  updated_at  TIMESTAMP│     │     │  refresh_token:{token}  → userId (7days)        │
└──────────────────────┘      │     │  session:{userId}       → session data          │
                              │     └─────────────────────────────────────────────────┘
                              │
                              │     ┌─────────────────────────────────────────────────┐
                              │     │                    MinIO                         │
                              └────►├─────────────────────────────────────────────────┤
                                    │  Bucket: aegis-clips                            │
                                    │  Path: /events/{eventId}/clip.mp4               │
                                    └─────────────────────────────────────────────────┘

범례:
  *  = Primary Key (PK)
  ── = Foreign Key 관계
  ◄► = 참조 방향
```

---

## PostgreSQL 테이블 정의

### 1. users (사용자)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 사용자 고유 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 ID, 변경 불가) |
| password | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 |
| name | VARCHAR(100) | NOT NULL | 사용자 이름 |
| role | user_role | NOT NULL, DEFAULT 'user' | 권한 (user, admin) |
| approved | BOOLEAN | NOT NULL, DEFAULT FALSE | 관리자 승인 여부 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**
- `idx_users_email` (email) - 로그인 조회
- `idx_users_approved` (approved) - 미승인 사용자 필터

---

### 2. cameras (카메라)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 카메라 고유 ID |
| name | VARCHAR(50) | NOT NULL | 미디어서버 원본 이름 (수정 불가) |
| connected | BOOLEAN | NOT NULL, DEFAULT FALSE | 미디어서버 연결 상태 (Online/Offline) |
| alias | VARCHAR(100) | NOT NULL | 사용자 지정 별칭 (기본값: name과 동일) |
| active | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용자 제어 ON/OFF |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**
- `idx_cameras_connected` (connected) - 연결 상태 필터
- `idx_cameras_active` (active) - 활성 카메라 필터

---

### 3. user_cameras (사용자-카메라 매핑)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| user_id | UUID | PK, FK → users.id ON DELETE CASCADE | 사용자 ID |
| camera_id | UUID | PK, FK → cameras.id ON DELETE CASCADE | 카메라 ID |

**비즈니스 로직**
- `role = 'admin'`인 사용자는 모든 카메라 접근 가능 (매핑 불필요)
- `role = 'user'`인 사용자는 할당된 카메라만 접근 가능
- 프론트엔드 `assignedCameras: ['all']`은 admin을 의미

---

### 4. events (이벤트)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 이벤트 고유 ID |
| camera_id | UUID | FK → cameras.id ON DELETE CASCADE, NOT NULL | 발생 카메라 |
| type | event_type | NOT NULL | 이벤트 유형 |
| timestamp | TIMESTAMPTZ | NOT NULL | 발생 일시 |
| status | event_status | NOT NULL, DEFAULT 'processing' | 처리 상태 |
| description | TEXT | NOT NULL | 이벤트 설명 |
| ai_action | TEXT | NULL | AI 자동 대응 조치 |
| clip_url | VARCHAR(500) | NULL | MinIO 영상 클립 URL |
| summary | TEXT | NULL | AI 분석 요약 |
| analysis_report | TEXT | NULL | 상세 분석 보고서 (Markdown) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**
- `idx_events_camera_id` (camera_id) - 카메라별 이벤트 조회
- `idx_events_type` (type) - 유형별 필터
- `idx_events_status` (status) - 상태별 필터
- `idx_events_timestamp` (timestamp DESC) - 최신순 정렬

**ENUM 값**
- `event_type`: 'assault', 'theft', 'suspicious', 'normal'
- `event_status`: 'processing', 'resolved'

---

### 5. notifications (알림)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 알림 고유 ID |
| user_id | UUID | FK → users.id ON DELETE CASCADE, NOT NULL | 수신자 ID |
| event_id | UUID | FK → events.id ON DELETE SET NULL, NULL | 연관 이벤트 ID |
| type | notification_type | NOT NULL | 알림 유형 |
| title | VARCHAR(200) | NOT NULL | 제목 |
| message | TEXT | NOT NULL | 내용 |
| read | BOOLEAN | NOT NULL, DEFAULT FALSE | 읽음 여부 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |

**인덱스**
- `idx_notifications_user_id` (user_id) - 사용자별 알림 조회
- `idx_notifications_user_read` (user_id, read) - 미읽음 알림 필터
- `idx_notifications_created_at` (created_at DESC) - 최신순 정렬

**ENUM 값**
- `notification_type`: 'alert', 'warning', 'info', 'success'

---

### 6. emergency_contacts (비상 연락처)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 연락처 고유 ID |
| type | contact_type | NOT NULL, UNIQUE | 담당자 유형 (primary, secondary) |
| phone | VARCHAR(20) | NOT NULL | 전화번호 |
| email | VARCHAR(255) | NOT NULL | 이메일 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정일시 |

**ENUM 값**
- `contact_type`: 'primary', 'secondary'

---

## Redis 데이터 구조

### Access Token
```
Key: access_token:{userId}
Value: {accessToken}
TTL: 900 (15분)
```

### Refresh Token
```
Key: refresh_token:{token}
Value: {userId}
TTL: 604800 (7일)
```

### 사용 예시
```
# Access Token 저장
SET access_token:user-123 "eyJhbG..." EX 900

# Refresh Token 저장
SET refresh_token:abc123xyz "user-123" EX 604800

# Access Token 검증
GET access_token:user-123

# Refresh Token으로 사용자 조회
GET refresh_token:abc123xyz

# 로그아웃 시 토큰 삭제
DEL access_token:user-123
DEL refresh_token:abc123xyz
```

---

## MinIO 구조

### 버킷 설정
```
Bucket: aegis-clips
Region: ap-northeast-2
Access: Private (Presigned URL로 접근)
```

### 파일 경로 규칙
```
/events/{eventId}/clip.mp4
/events/{eventId}/thumbnail.jpg
```

### Presigned URL 생성
```
# 영상 업로드 URL (PUT) - 1시간 유효
PUT /events/evt-123/clip.mp4?X-Amz-Signature=...

# 영상 조회 URL (GET) - 24시간 유효
GET /events/evt-123/clip.mp4?X-Amz-Signature=...
```

---

## PostgreSQL DDL

```sql
-- ENUM 타입 생성
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE event_type AS ENUM ('assault', 'theft', 'suspicious', 'normal');
CREATE TYPE event_status AS ENUM ('processing', 'resolved');
CREATE TYPE notification_type AS ENUM ('alert', 'warning', 'info', 'success');
CREATE TYPE contact_type AS ENUM ('primary', 'secondary');

-- 1. users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_approved ON users(approved);

-- 2. cameras
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    connected BOOLEAN NOT NULL DEFAULT FALSE,
    alias VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cameras_connected ON cameras(connected);
CREATE INDEX idx_cameras_active ON cameras(active);

-- 3. user_cameras (Junction Table)
CREATE TABLE user_cameras (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, camera_id)
);

-- 4. events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    type event_type NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    status event_status NOT NULL DEFAULT 'processing',
    description TEXT NOT NULL,
    ai_action TEXT,
    clip_url VARCHAR(500),
    summary TEXT,
    analysis_report TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_camera_id ON events(camera_id);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);

-- 5. notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- 6. emergency_contacts
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type contact_type NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터
INSERT INTO emergency_contacts (type, phone, email) VALUES
    ('primary', '010-1234-5678', 'primary@company.com'),
    ('secondary', '010-9876-5432', 'secondary@company.com');
```

---

## 통계 쿼리 (프론트엔드 Stats API용)

### 일별 이벤트 통계 (daily)
```sql
SELECT 
    TO_CHAR(timestamp, 'Dy') as day,
    COUNT(*) as events,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved
FROM events
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY TO_CHAR(timestamp, 'Dy'), EXTRACT(DOW FROM timestamp)
ORDER BY EXTRACT(DOW FROM timestamp);
```

### 이벤트 유형별 통계 (event-types)
```sql
SELECT 
    type,
    COUNT(*) as count
FROM events
GROUP BY type;
```

### 월간 이벤트 데이터 (monthly)
```sql
SELECT 
    TO_CHAR(timestamp, 'YYYY-MM-DD') as date,
    COUNT(*) as events,
    COUNT(*) FILTER (WHERE type IN ('assault', 'theft')) as alerts
FROM events
WHERE timestamp >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY TO_CHAR(timestamp, 'YYYY-MM-DD')
ORDER BY date;
```

### 대시보드 요약 통계 (summary)
```sql
SELECT 
    (SELECT COUNT(*) FROM events WHERE DATE(timestamp) = CURRENT_DATE) as today_events,
    (SELECT COUNT(*) FROM events WHERE DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day') as yesterday_events,
    (SELECT COUNT(*) FROM events WHERE status = 'processing' AND type IN ('assault', 'theft')) as active_alerts;
```

---

## 프론트엔드 타입 매핑

| 프론트엔드 타입 | DB 테이블 | 비고 |
|----------------|-----------|------|
| `ManagedCamera` | cameras | 전체 필드 매핑 |
| `Event` | events + cameras.name | cameraName은 JOIN으로 조회 |
| `Notification` | notifications | timestamp = created_at |
| `User` | users + user_cameras | assignedCameras는 별도 조회 |
| `DailyStat` | events (집계) | 쿼리로 생성 |
| `EventTypeStat` | events (집계) | 쿼리로 생성, color는 프론트에서 |
| `MonthlyEventData` | events (집계) | 쿼리로 생성 |
| `SummaryStats` | events (집계) | 쿼리로 생성 |
