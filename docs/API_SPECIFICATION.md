# AEGIS API 명세서

> AI 기반 안전 모니터링 시스템 백엔드 API 명세

**Base URL**: `/api`  
**버전**: 1.1.0  
**최종 업데이트**: 2026-01-19

---

## 목차

1. [인증 (Auth)](#1-인증-auth)
2. [카메라 (Cameras)](#2-카메라-cameras)
3. [이벤트 (Events)](#3-이벤트-events)
4. [알림 (Notifications)](#4-알림-notifications)
5. [통계 (Stats)](#5-통계-stats)
6. [사용자 관리 (Users)](#6-사용자-관리-users---admin-전용)
7. [타입 정의](#7-타입-정의)
8. [에러 응답](#8-에러-응답)

---

## 인증 방식

- **Access Token**: `Authorization: Bearer {accessToken}` 헤더로 전송
- **Refresh Token**: `httpOnly` 쿠키로 관리 (`refreshToken`)
- Access Token 만료 시 `/api/auth/refresh`로 갱신

---

## 1. 인증 (Auth)

### 1.1 로그인

사용자 로그인 및 토큰 발급

```
POST /api/auth/login
```

**Request Body**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response** `200 OK`
```json
{
  "accessToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "user" | "admin",
    "assignedCameras": ["string"],
    "createdAt": "ISO8601 string",
    "approved": true
  }
}
```

**Set-Cookie**
```
refreshToken={token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

**Error Responses**
| Status | Error | Description |
|--------|-------|-------------|
| 401 | 등록되지 않은 이메일입니다. | 이메일 미존재 |
| 401 | 비밀번호가 일치하지 않습니다. | 비밀번호 불일치 |
| 403 | 관리자 승인 대기 중입니다. | 미승인 사용자 |

---

### 1.2 회원가입

신규 사용자 등록 (관리자 승인 필요)

```
POST /api/auth/signup
```

**Request Body**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다."
}
```

**Error Responses**
| Status | Error | Description |
|--------|-------|-------------|
| 400 | 이미 등록된 이메일입니다. | 중복 이메일 |

---

### 1.3 로그아웃

세션 종료 및 토큰 무효화

```
POST /api/auth/logout
```

**Request**
- Cookie: `refreshToken`

**Response** `200 OK`
```json
{
  "success": true
}
```

**Set-Cookie**
```
refreshToken=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
```

---

### 1.4 토큰 갱신

Access Token 재발급

```
POST /api/auth/refresh
```

**Request**
- Cookie: `refreshToken`

**Response** `200 OK`
```json
{
  "accessToken": "string"
}
```

**Error Responses**
| Status | Error | Description |
|--------|-------|-------------|
| 401 | Refresh token이 없습니다. | 쿠키 미존재 |
| 401 | 유효하지 않은 refresh token입니다. | 토큰 만료/무효 |
| 401 | 유효하지 않은 사용자입니다. | 사용자 미존재/미승인 |

---

### 1.5 내 정보 조회

현재 로그인한 사용자 정보 조회

```
GET /api/auth/me
```

**Request Headers**
```
Authorization: Bearer {accessToken}
```

**Response** `200 OK`
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "user" | "admin",
  "assignedCameras": ["string"],
  "createdAt": "ISO8601 string",
  "approved": true
}
```

**Error Responses**
| Status | Error | Description |
|--------|-------|-------------|
| 401 | 인증이 필요합니다. | Authorization 헤더 미존재 |
| 401 | 사용자를 찾을 수 없습니다. | 유효하지 않은 토큰 |

---

## 2. 카메라 (Cameras)

### 2.1 카메라 목록 조회

등록된 모든 카메라 목록 조회

```
GET /api/cameras
```

**Request Headers**
```
Authorization: Bearer {accessToken}
```

**Response** `200 OK`
```json
[
  {
    "id": "string",
    "name": "string",
    "connected": true,
    "alias": "string",
    "active": true
  }
]
```

**필드 설명**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 카메라 고유 ID |
| name | string | 미디어서버 원본 이름 (수정 불가) |
| connected | boolean | 온라인/오프라인 (미디어서버 연결 여부) |
| alias | string | 사용자 지정 별칭 (수정 가능) |
| active | boolean | ON/OFF 상태 (사용자 제어) |

---

## 3. 이벤트 (Events)

### 3.1 이벤트 목록 조회

감지된 모든 이벤트 목록 조회

```
GET /api/events
```

**Request Headers**
```
Authorization: Bearer {accessToken}
```

**Response** `200 OK`
```json
[
  {
    "id": "string",
    "cameraId": "string",
    "cameraName": "string",
    "type": "assault" | "theft" | "suspicious" | "normal",
    "timestamp": "ISO8601 string",
    "status": "processing" | "resolved",
    "description": "string",
    "aiAction": "string | null",
    "clipUrl": "string | null",
    "summary": "string | null",
    "analysisReport": "string | null"
  }
]
```

---

## 4. 알림 (Notifications)

### 4.1 알림 목록 조회

사용자의 모든 알림 조회

```
GET /api/notifications
```

**Request Headers**
```
Authorization: Bearer {accessToken}
```

**Response** `200 OK`
```json
[
  {
    "id": "string",
    "type": "alert" | "warning" | "info" | "success",
    "title": "string",
    "message": "string",
    "timestamp": "ISO8601 string",
    "read": false,
    "eventId": "string | null"
  }
]
```

---

## 5. 통계 (Stats)

### 6.1 통계 조회

다양한 통계 데이터 조회 (쿼리 파라미터로 유형 선택)

```
GET /api/stats?type={type}
```

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | 통계 유형 (미지정 시 전체 반환) |

**Type 옵션**
| Type | Description |
|------|-------------|
| `daily` | 주간 일별 이벤트 통계 |
| `event-types` | 이벤트 유형별 분포 |
| `monthly` | 월간 날짜별 이벤트 데이터 |
| `summary` | 대시보드 요약 통계 |
| `system` | 시스템 상태 |
| `storage` | 저장소 사용량 |

---

#### 6.1.1 일별 통계 (daily)

```
GET /api/stats?type=daily
```

**Response** `200 OK`
```json
[
  {
    "day": "월",
    "events": 12,
    "resolved": 11
  }
]
```

---

#### 6.1.2 이벤트 유형 통계 (event-types)

```
GET /api/stats?type=event-types
```

**Response** `200 OK`
```json
[
  {
    "type": "정상",
    "count": 245,
    "color": "hsl(var(--success))"
  }
]
```

---

#### 6.1.3 월간 통계 (monthly)

```
GET /api/stats?type=monthly
```

**Response** `200 OK`
```json
{
  "2026-01-19": {
    "events": 23,
    "alerts": 5
  }
}
```

---

#### 6.1.4 요약 통계 (summary)

```
GET /api/stats?type=summary
```

**Response** `200 OK`
```json
{
  "todayEvents": 23,
  "aiResponseRate": 98.5,
  "avgResponseTime": 2.3,
  "activeAlerts": 2,
  "todayEventsChange": -15,
  "aiResponseRateChange": 2.1
}
```

---

#### 6.1.5 시스템 상태 (system)

```
GET /api/stats?type=system
```

**Response** `200 OK`
```json
{
  "status": "normal" | "warning" | "error",
  "message": "시스템 정상"
}
```

---

#### 6.1.6 저장소 정보 (storage)

```
GET /api/stats?type=storage
```

**Response** `200 OK`
```json
{
  "usedStorage": 245,
  "totalStorage": 500
}
```

> 단위: GB

---

## 6. 사용자 관리 (Users) - Admin 전용

### 7.1 사용자 목록 조회

모든 사용자 목록 조회

```
GET /api/users
```

**Request Headers**
```
Authorization: Bearer {accessToken}
```

**Required Role**: `admin`

**Response** `200 OK`
```json
[
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "user" | "admin",
    "assignedCameras": ["string"],
    "createdAt": "ISO8601 string",
    "approved": true
  }
]
```

---

### 7.2 사용자 정보 수정

특정 사용자의 정보 수정

```
PATCH /api/users/{id}
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | 사용자 ID |

**Request Headers**
```
Authorization: Bearer {accessToken}
```

**Required Role**: `admin`

**Request Body** (부분 업데이트)
```json
{
  "name": "string",
  "role": "user" | "admin",
  "assignedCameras": ["string"]
}
```

**Response** `200 OK`
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "user" | "admin",
  "assignedCameras": ["string"],
  "createdAt": "ISO8601 string",
  "approved": true
}
```

**Error Responses**
| Status | Error | Description |
|--------|-------|-------------|
| 400 | 사용자 ID가 필요합니다. | ID 미제공 |
| 404 | 사용자를 찾을 수 없습니다. | 존재하지 않는 사용자 |

---

### 7.3 사용자 삭제

특정 사용자 삭제

```
DELETE /api/users/{id}
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | 사용자 ID |

**Request Headers**
```
Authorization: Bearer {accessToken}
```

**Required Role**: `admin`

**Response** `200 OK`
```json
{
  "success": true
}
```

**Error Responses**
| Status | Error | Description |
|--------|-------|-------------|
| 400 | 사용자 ID가 필요합니다. | ID 미제공 |
| 404 | 사용자를 찾을 수 없습니다. | 존재하지 않는 사용자 |

---

### 7.4 사용자 승인

가입 대기 중인 사용자 승인

```
PATCH /api/users/{id}/approve
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | 사용자 ID |

**Request Headers**
```
Authorization: Bearer {accessToken}
```

**Required Role**: `admin`

**Response** `200 OK`
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "user",
  "assignedCameras": [],
  "createdAt": "ISO8601 string",
  "approved": true
}
```

---

## 8. 타입 정의

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  assignedCameras: string[];  // 'all' 또는 카메라 ID 배열
  createdAt: string;          // ISO8601
  approved: boolean;
}
```

### Camera
```typescript
interface Camera {
  id: string;
  name: string;           // 미디어서버 원본 이름 (수정 불가)
  connected: boolean;     // 온라인/오프라인 (미디어서버 연결 여부)
  alias: string;          // 사용자 지정 별칭 (수정 가능)
  active: boolean;        // ON/OFF 상태 (사용자 제어)
}
```

### Event
```typescript
interface Event {
  id: string;
  cameraId: string;
  cameraName: string;
  type: 'assault' | 'theft' | 'suspicious' | 'normal';
  timestamp: string;           // ISO8601
  status: 'processing' | 'resolved';
  description: string;
  aiAction?: string;
  clipUrl?: string;
  summary?: string;
  analysisReport?: string;     // Markdown 형식
}
```

### Notification
```typescript
interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;           // ISO8601
  read: boolean;
  eventId?: string;
}
```


### SummaryStats
```typescript
interface SummaryStats {
  todayEvents: number;
  aiResponseRate: number;      // 퍼센트 (0-100)
  avgResponseTime: number;     // 초 단위
  activeAlerts: number;
  todayEventsChange: number;   // 전일 대비 변화율 (%)
  aiResponseRateChange: number;
}
```

### SystemStatus
```typescript
interface SystemStatus {
  status: 'normal' | 'warning' | 'error';
  message: string;
}
```

### StorageInfo
```typescript
interface StorageInfo {
  usedStorage: number;         // GB
  totalStorage: number;        // GB
}
```

---

## 9. 에러 응답

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "error": "에러 메시지"
}
```

### 공통 HTTP 상태 코드

| Status | Description |
|--------|-------------|
| 200 | 성공 |
| 400 | 잘못된 요청 (파라미터 오류) |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 내부 오류 |

---

## 구현 참고 사항

### 인증 흐름
1. 로그인 시 Access Token (응답 body) + Refresh Token (httpOnly 쿠키) 발급
2. API 호출 시 `Authorization: Bearer {accessToken}` 헤더 필수
3. Access Token 만료 시 (401 응답) → `/api/auth/refresh` 호출하여 갱신
4. Refresh Token도 만료 시 → 재로그인 필요

### 권한 체계
- **user**: 기본 사용자, 할당된 카메라만 조회 가능
- **admin**: 모든 기능 접근 가능, 사용자 관리 권한

### 페이지별 API 사용

| 페이지 | 사용 API |
|--------|----------|
| 로그인/회원가입 | auth/login, auth/signup |
| 대시보드 | cameras, events, stats (summary) |
| CCTV | cameras |
| 이벤트 | events |
| 멤버 관리 (Admin) | users (전체) |
| 설정 | stats (storage), auth/me |
| 헤더 (공통) | notifications, stats (system) |
