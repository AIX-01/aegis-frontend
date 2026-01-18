# AEGIS 데이터베이스 ERD

> AI 기반 안전 모니터링 시스템 데이터베이스 설계

**버전**: 1.0.0  
**최종 업데이트**: 2026-01-19

---

## ERD 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    AEGIS DATABASE ERD                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│        users         │       │   user_cameras (M:N) │       │       cameras        │
├──────────────────────┤       ├──────────────────────┤       ├──────────────────────┤
│ *id          VARCHAR │◄──────│ *user_id     VARCHAR │       │ *id          VARCHAR │
│  email       VARCHAR │  PK   │ *camera_id   VARCHAR │──────►│  name        VARCHAR │
│  password    VARCHAR │       └──────────────────────┘   PK  │  location    VARCHAR │
│  name        VARCHAR │              (Junction)              │  ip_address  VARCHAR │
│  role        ENUM    │                                      │  resolution  VARCHAR │
│  created_at  DATETIME│                                      │  status      ENUM    │
│  approved    BOOLEAN │                                      │  alert_type  ENUM    │
│  updated_at  DATETIME│                                      │  active      BOOLEAN │
└──────────────────────┘                                      │  created_at  DATETIME│
         │                                                    │  updated_at  DATETIME│
         │                                                    └──────────────────────┘
         │ 1:N                                                           │
         ▼                                                               │ 1:N
┌──────────────────────┐                                                 ▼
│   refresh_tokens     │                                      ┌──────────────────────┐
├──────────────────────┤                                      │       events         │
│ *id          VARCHAR │                                      ├──────────────────────┤
│  user_id     VARCHAR │──────┐                               │ *id          VARCHAR │
│  token       VARCHAR │      │                               │  camera_id   VARCHAR │◄─┐
│  expires_at  DATETIME│      │                               │  type        ENUM    │  │
│  created_at  DATETIME│      │                               │  timestamp   DATETIME│  │
└──────────────────────┘      │                               │  status      ENUM    │  │
                              │                               │  description TEXT    │  │
                              │                               │  ai_action   TEXT    │  │
                              │                               │  clip_url    VARCHAR │  │
┌──────────────────────┐      │                               │  summary     TEXT    │  │
│    notifications     │      │                               │  analysis    TEXT    │  │
├──────────────────────┤      │                               │  created_at  DATETIME│  │
│ *id          VARCHAR │      │                               │  updated_at  DATETIME│  │
│  user_id     VARCHAR │◄─────┘                               └──────────────────────┘  │
│  event_id    VARCHAR │──────────────────────────────────────────────────┬─────────────┘
│  type        ENUM    │                                                  │
│  title       VARCHAR │                                                  │ 1:N
│  message     TEXT    │                                                  ▼
│  read        BOOLEAN │                                      ┌──────────────────────┐
│  created_at  DATETIME│                                      │    ai_responses      │
└──────────────────────┘                                      ├──────────────────────┤
                                                              │ *id          VARCHAR │
                                                              │  event_id    VARCHAR │
┌──────────────────────┐                                      │  action      VARCHAR │
│   system_settings    │                                      │  status      ENUM    │
├──────────────────────┤                                      │  created_at  DATETIME│
│ *key         VARCHAR │                                      │  updated_at  DATETIME│
│  value       JSON    │                                      └──────────────────────┘
│  updated_at  DATETIME│
└──────────────────────┘


범례:
  *  = Primary Key (PK)
  ── = Foreign Key 관계
  ◄► = 참조 방향
```

---

## 테이블 상세 정의

### 1. users (사용자)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | VARCHAR(36) | PK | UUID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| password | VARCHAR(255) | NOT NULL | 해시된 비밀번호 |
| name | VARCHAR(100) | NOT NULL | 사용자 이름 |
| role | ENUM('user', 'admin') | NOT NULL, DEFAULT 'user' | 권한 |
| approved | BOOLEAN | NOT NULL, DEFAULT FALSE | 승인 여부 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**
- `idx_users_email` (email) - 로그인 조회
- `idx_users_approved` (approved) - 미승인 사용자 필터

---

### 2. cameras (카메라)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | VARCHAR(36) | PK | UUID |
| name | VARCHAR(50) | NOT NULL | 카메라 이름 (CAM-01) |
| location | VARCHAR(100) | NOT NULL | 설치 위치 |
| ip_address | VARCHAR(45) | NULL | IP 주소 (IPv4/IPv6) |
| resolution | VARCHAR(20) | NULL | 해상도 (1920x1080) |
| status | ENUM('normal', 'alert', 'warning', 'offline') | NOT NULL, DEFAULT 'normal' | 상태 |
| alert_type | ENUM('assault', 'theft', 'suspicious') | NULL | 경보 유형 |
| active | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성화 여부 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**
- `idx_cameras_status` (status) - 상태별 필터
- `idx_cameras_active` (active) - 활성 카메라 필터

---

### 3. user_cameras (사용자-카메라 매핑)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| user_id | VARCHAR(36) | PK, FK → users.id | 사용자 ID |
| camera_id | VARCHAR(36) | PK, FK → cameras.id | 카메라 ID |

**특이사항**
- admin은 모든 카메라 접근 가능 (매핑 불필요)
- user는 할당된 카메라만 접근 가능

---

### 4. events (이벤트)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | VARCHAR(36) | PK | UUID |
| camera_id | VARCHAR(36) | FK → cameras.id, NOT NULL | 카메라 ID |
| type | ENUM('assault', 'theft', 'suspicious', 'normal') | NOT NULL | 이벤트 유형 |
| timestamp | DATETIME | NOT NULL | 발생 일시 |
| status | ENUM('processing', 'resolved') | NOT NULL, DEFAULT 'processing' | 처리 상태 |
| description | TEXT | NOT NULL | 이벤트 설명 |
| ai_action | TEXT | NULL | AI 자동 대응 조치 |
| clip_url | VARCHAR(500) | NULL | 영상 클립 URL |
| summary | TEXT | NULL | AI 분석 요약 |
| analysis_report | TEXT | NULL | 상세 분석 보고서 (Markdown) |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**
- `idx_events_camera_id` (camera_id) - 카메라별 이벤트 조회
- `idx_events_type` (type) - 유형별 필터
- `idx_events_status` (status) - 상태별 필터
- `idx_events_timestamp` (timestamp DESC) - 최신순 정렬

---

### 5. ai_responses (AI 대응)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | VARCHAR(36) | PK | UUID |
| event_id | VARCHAR(36) | FK → events.id, NOT NULL | 이벤트 ID |
| action | VARCHAR(200) | NOT NULL | 대응 조치 |
| status | ENUM('pending', 'in_progress', 'completed') | NOT NULL, DEFAULT 'pending' | 상태 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**
- `idx_ai_responses_event_id` (event_id) - 이벤트별 대응 조회
- `idx_ai_responses_status` (status) - 상태별 필터

---

### 6. notifications (알림)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | VARCHAR(36) | PK | UUID |
| user_id | VARCHAR(36) | FK → users.id, NOT NULL | 수신자 ID |
| event_id | VARCHAR(36) | FK → events.id, NULL | 연관 이벤트 ID |
| type | ENUM('alert', 'warning', 'info', 'success') | NOT NULL | 알림 유형 |
| title | VARCHAR(200) | NOT NULL | 제목 |
| message | TEXT | NOT NULL | 내용 |
| read | BOOLEAN | NOT NULL, DEFAULT FALSE | 읽음 여부 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | 생성일시 |

**인덱스**
- `idx_notifications_user_id` (user_id) - 사용자별 알림 조회
- `idx_notifications_read` (user_id, read) - 미읽음 알림 필터
- `idx_notifications_created_at` (created_at DESC) - 최신순 정렬

---

### 7. refresh_tokens (리프레시 토큰)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | VARCHAR(36) | PK | UUID |
| user_id | VARCHAR(36) | FK → users.id, NOT NULL | 사용자 ID |
| token | VARCHAR(500) | UNIQUE, NOT NULL | 토큰 값 |
| expires_at | DATETIME | NOT NULL | 만료 일시 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | 생성일시 |

**인덱스**
- `idx_refresh_tokens_token` (token) - 토큰 검증
- `idx_refresh_tokens_user_id` (user_id) - 사용자별 토큰 조회
- `idx_refresh_tokens_expires_at` (expires_at) - 만료 토큰 정리

---

### 8. system_settings (시스템 설정)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| key | VARCHAR(100) | PK | 설정 키 |
| value | JSON | NOT NULL | 설정 값 |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() | 수정일시 |

**예시 데이터**
```json
// key: 'system_status'
{ "status": "normal", "message": "시스템 정상" }

// key: 'storage_info'
{ "usedStorage": 245, "totalStorage": 500 }

// key: 'ai_settings'
{ "sensitivity": 75, "autoResponse": true, "nightMode": true }
```

---

## 관계 정의

| 관계 | 설명 | 타입 |
|------|------|------|
| users ↔ cameras | 사용자별 카메라 접근 권한 | M:N (user_cameras) |
| users → refresh_tokens | 사용자의 리프레시 토큰 | 1:N |
| users → notifications | 사용자의 알림 | 1:N |
| cameras → events | 카메라에서 발생한 이벤트 | 1:N |
| events → ai_responses | 이벤트에 대한 AI 대응 | 1:N |
| events → notifications | 이벤트 관련 알림 | 1:N |

---

## SQL DDL (MySQL/MariaDB)

```sql
-- 1. users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_approved (approved)
);

-- 2. cameras
CREATE TABLE cameras (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    resolution VARCHAR(20),
    status ENUM('normal', 'alert', 'warning', 'offline') NOT NULL DEFAULT 'normal',
    alert_type ENUM('assault', 'theft', 'suspicious'),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cameras_status (status),
    INDEX idx_cameras_active (active)
);

-- 3. user_cameras (Junction Table)
CREATE TABLE user_cameras (
    user_id VARCHAR(36) NOT NULL,
    camera_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (user_id, camera_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
);

-- 4. events
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    camera_id VARCHAR(36) NOT NULL,
    type ENUM('assault', 'theft', 'suspicious', 'normal') NOT NULL,
    timestamp DATETIME NOT NULL,
    status ENUM('processing', 'resolved') NOT NULL DEFAULT 'processing',
    description TEXT NOT NULL,
    ai_action TEXT,
    clip_url VARCHAR(500),
    summary TEXT,
    analysis_report TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE,
    INDEX idx_events_camera_id (camera_id),
    INDEX idx_events_type (type),
    INDEX idx_events_status (status),
    INDEX idx_events_timestamp (timestamp DESC)
);

-- 5. ai_responses
CREATE TABLE ai_responses (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    action VARCHAR(200) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_ai_responses_event_id (event_id),
    INDEX idx_ai_responses_status (status)
);

-- 6. notifications
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    event_id VARCHAR(36),
    type ENUM('alert', 'warning', 'info', 'success') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_read (user_id, `read`),
    INDEX idx_notifications_created_at (created_at DESC)
);

-- 7. refresh_tokens
CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_tokens_token (token),
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_expires_at (expires_at)
);

-- 8. system_settings
CREATE TABLE system_settings (
    `key` VARCHAR(100) PRIMARY KEY,
    value JSON NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 초기 데이터
INSERT INTO system_settings (`key`, value) VALUES
('system_status', '{"status": "normal", "message": "시스템 정상"}'),
('storage_info', '{"usedStorage": 0, "totalStorage": 500}'),
('ai_settings', '{"sensitivity": 75, "autoResponse": true, "nightMode": true}');
```

---

## PostgreSQL 버전

```sql
-- ENUM 타입 생성
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE camera_status AS ENUM ('normal', 'alert', 'warning', 'offline');
CREATE TYPE alert_type AS ENUM ('assault', 'theft', 'suspicious');
CREATE TYPE event_type AS ENUM ('assault', 'theft', 'suspicious', 'normal');
CREATE TYPE event_status AS ENUM ('processing', 'resolved');
CREATE TYPE ai_response_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE notification_type AS ENUM ('alert', 'warning', 'info', 'success');

-- 테이블 생성은 MySQL과 유사, ENUM 타입명 사용
-- JSON → JSONB 사용 권장
```

---

## 통계 쿼리 예시

### 일별 이벤트 통계
```sql
SELECT 
    DAYNAME(timestamp) as day,
    COUNT(*) as events,
    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
FROM events
WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY DAYNAME(timestamp), DAYOFWEEK(timestamp)
ORDER BY DAYOFWEEK(timestamp);
```

### 이벤트 유형별 통계
```sql
SELECT 
    type,
    COUNT(*) as count
FROM events
GROUP BY type;
```

### 대시보드 요약 통계
```sql
SELECT 
    (SELECT COUNT(*) FROM events WHERE DATE(timestamp) = CURDATE()) as today_events,
    (SELECT COUNT(*) FROM events WHERE DATE(timestamp) = CURDATE() - INTERVAL 1 DAY) as yesterday_events,
    (SELECT COUNT(*) FROM ai_responses WHERE status = 'completed') * 100.0 / 
        NULLIF((SELECT COUNT(*) FROM ai_responses), 0) as ai_response_rate,
    (SELECT COUNT(*) FROM events WHERE status = 'processing' AND type IN ('assault', 'theft')) as active_alerts;
```
