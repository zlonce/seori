# Seori API 명세서

> Base URL: `http://localhost:8080`  
> 인증 방식: JWT Bearer Token (Authorization 헤더)

---

## 공통

### 인증 헤더
```
Authorization: Bearer {accessToken}
```

### 공통 에러 응답
```json
{
  "code": "ERROR_CODE",
  "message": "에러 메시지"
}
```

| HTTP 상태 | 설명 |
|-----------|------|
| 400 | 잘못된 요청 (유효성 검사 실패) |
| 401 | 인증 실패 (토큰 없음/만료/유효하지 않음) |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 중복 데이터 |

### 에러 코드 목록

| 에러 코드 | HTTP | 메시지 |
|-----------|------|--------|
| `USER_NOT_FOUND` | 404 | 존재하지 않는 사용자입니다. |
| `DUPLICATE_USER_ID` | 409 | 이미 등록된 전화번호 뒷자리입니다. |
| `INVALID_PASSWORD` | 401 | 비밀번호가 올바르지 않습니다. |
| `INVALID_CURRENT_PASSWORD` | 401 | 현재 비밀번호가 올바르지 않습니다. |
| `INVALID_TOKEN_TYPE` | 401 | 유효하지 않은 토큰 타입입니다. |
| `INVALID_REFRESH_TOKEN` | 401 | 유효하지 않은 리프레시 토큰입니다. |
| `WORK_RECORD_NOT_FOUND` | 404 | 존재하지 않는 근무 기록입니다. |
| `FORBIDDEN_WORK_RECORD` | 403 | 본인의 근무 기록만 수정할 수 있습니다. |
| `SPECIAL_DAY_NOT_FOUND` | 404 | 존재하지 않는 특정일입니다. |
| `DUPLICATE_SPECIAL_DAY` | 409 | 이미 등록된 특정일입니다. |

---

## 인증 API

Base Path: `/api/auth`  
인증 불필요

---

### POST /api/auth/login — 로그인

**요청**
```json
{
  "userId": "string",
  "password": "string"
}
```

**응답 200**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**응답 Set-Cookie**
```
refreshToken=eyJ...; HttpOnly; Path=/api/auth; Max-Age=604800
```

---

### POST /api/auth/refresh — 토큰 갱신

**요청**: 쿠키에 `refreshToken` 포함 (자동)

**응답 200**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

### POST /api/auth/logout — 로그아웃

**요청**: 없음

**응답 200**: `refreshToken` 쿠키 삭제

---

## 사용자 API

Base Path: `/api/users`  
인증 필요

---

### POST /api/users — 사용자 생성

**권한**: OWNER

**요청**
```json
{
  "phone": "string",
  "name": "string",
  "role": "OWNER | MANAGER | STAFF",
  "hourlyWage": 10000,
  "overtimeWage": 15000,
  "weeklyWorkDays": 1
}
```

> `weeklyWorkDays`: 1 또는 2  
> `userId`는 서버에서 전화번호 뒷 4자리로 자동 생성  
> 초기 비밀번호는 서버 정책에 따라 설정 (추후 확인 필요)

**응답 204**: No Content

---

### GET /api/users/staff — 스태프 목록 조회

**권한**: OWNER, MANAGER

**응답 200**
```json
[
  {
    "userId": "string",
    "name": "string",
    "phone": "string",
    "role": "MANAGER | STAFF",
    "hourlyWage": 10000,
    "overtimeWage": 15000,
    "weeklyWorkDays": 1
  }
]
```

---

### PATCH /api/users/{userId}/profile — 스태프 프로필 수정

**권한**: OWNER, MANAGER

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `userId` | string | 수정할 사용자 ID |

**요청**
```json
{
  "name": "string",
  "role": "MANAGER | STAFF",
  "hourlyWage": 10000,
  "overtimeWage": 15000,
  "weeklyWorkDays": 1
}
```

> `role`에 OWNER는 설정 불가

**응답 204**: No Content

---

### PATCH /api/users/password — 비밀번호 변경

**권한**: 모든 인증 사용자 (본인)

**요청**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

> `newPassword`: 4~20자

**응답 204**: No Content

---

## 근무 기록 API

Base Path: `/api/work-records`  
인증 필요

---

### GET /api/work-records/my — 내 근무 기록 조회

**권한**: 모든 인증 사용자

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | int | O | 연도 (예: 2024) |
| `month` | int | O | 월 (1~12) |

**응답 200**
```json
[
  {
    "id": 1,
    "workDate": "2024-06-22",
    "startTime": "09:00",
    "endTime": "18:00",
    "status": "COMPLETED",
    "specialDay": false,
    "regularMinutes": 480,
    "overtimeMinutes": 0,
    "regularWage": 64000,
    "overtimeWage": 0,
    "totalWage": 64000
  }
]
```

**status 값**

| 값 | 설명 |
|----|------|
| `SCHEDULED` | 근무 예정 (날짜만 등록, 시간 없음) |
| `COMPLETED` | 근무 완료 (시작/종료 시간 있음) |
| `INCOMPLETE` | 날짜는 있으나 시간 미입력 |

---

### GET /api/work-records/staff/{staffId} — 스태프 근무 기록 조회

**권한**: OWNER, MANAGER

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `staffId` | string | 조회할 직원 ID |

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | int | O | 연도 |
| `month` | int | O | 월 (1~12) |

**응답 200**: `GET /api/work-records/my`와 동일한 구조

---

### POST /api/work-records — 근무 기록 생성

**권한**: 모든 인증 사용자

**요청**
```json
{
  "workDate": "2024-06-22",
  "startTime": "09:00",
  "endTime": "18:00"
}
```

> `startTime`, `endTime` 생략 시 `status = SCHEDULED`로 생성  
> 시간 형식: `HH:mm`

**응답 200**: 생성된 근무 기록 (단건, `GET /my` 응답 항목과 동일)

---

### PUT /api/work-records/{id} — 근무 기록 수정

**권한**: 본인 근무 기록만 수정 가능

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | long | 수정할 근무 기록 ID |

**요청**
```json
{
  "startTime": "09:00",
  "endTime": "18:00"
}
```

**응답 200**: 수정된 근무 기록 (단건)

---

### DELETE /api/work-records/{id} — 근무 기록 삭제

**권한**: 본인 근무 기록만 삭제 가능

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | long | 삭제할 근무 기록 ID |

**응답 204**: No Content

---

## 특정일 API

Base Path: `/api/special-days`

> 조회는 인증 불필요, 생성/삭제는 인증 필요

---

### GET /api/special-days — 특정일 월별 조회

**인증**: 불필요

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | int | O | 연도 |
| `month` | int | O | 월 (1~12) |

**응답 200**
```json
[
  {
    "id": 1,
    "date": "2024-06-06",
    "name": "현충일",
    "recurring": true
  }
]
```

---

### GET /api/special-days/active — 활성 특정일 조회

**인증**: 불필요

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | int | O | 연도 |

> `recurring = true`인 항목은 매년 해당 연도의 날짜로 적용되어 반환

**응답 200**: `GET /api/special-days`와 동일한 구조

---

### POST /api/special-days — 특정일 생성

**권한**: OWNER, MANAGER

**요청**
```json
{
  "date": "2024-06-06",
  "name": "현충일",
  "recurring": true
}
```

> `name`: 최대 30자  
> `date`: 중복 불가

**응답 200**: 생성된 특정일 (단건)

---

### DELETE /api/special-days/{id} — 특정일 삭제

**권한**: OWNER, MANAGER

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | long | 삭제할 특정일 ID |

**응답 204**: No Content

---

## 비즈니스 로직 참고

### 급여 계산 규칙

기준 시각: `22:00`

| 조건 | 처리 |
|------|------|
| 특정일인 경우 | 전체 시간을 초과수당으로 계산 |
| 종료 시각 ≤ 22:00 | 전체 시간을 정규 시급으로 계산 |
| 시작 시각 ≥ 22:00 | 전체 시간을 초과 시급으로 계산 |
| 혼합 (22:00 경계) | 22:00 이전은 정규, 이후는 초과로 분리 계산 |

### JWT 토큰

| 항목 | 값 |
|------|----|
| Access Token 유효기간 | 30분 |
| Refresh Token 유효기간 | 7일 |
| Refresh Token 저장 | HttpOnly 쿠키 (`Path=/api/auth`) |
| 알고리즘 | HS256 |

### 사용자 ID 생성 규칙

> 전화번호 뒷 4자리로 자동 생성 (중복 시 서버 정책에 따라 처리 — 추후 확인 필요)

### 역할 권한 체계

| 역할 | 설명 | 주요 권한 |
|------|------|-----------|
| `OWNER` | 사업주 | 모든 기능 |
| `MANAGER` | 관리자 | 스태프 조회/수정, 근무기록 조회, 특정일 관리 |
| `STAFF` | 직원 | 본인 근무기록 CRUD |
