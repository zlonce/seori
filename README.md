# Seori

소규모 매장의 아르바이트 근무·임금 관리 웹 서비스입니다.
사장님(OWNER), 매니저(MANAGER), 알바생(STAFF) 권한을 나눠서 근무 일정 투표, 근무 기록, 임금 계산, 공지·재고·메모 관리를 한곳에서 처리합니다.

## 주요 기능

| 구분 | 기능 |
| --- | --- |
| 알바비 계산 | 근무 기록 기반 월급 자동 계산 (22:00 이후는 초과 시급 적용) |
| 근무 일정 | 주 단위 투표 → 마감 → 확정 흐름, 마감 후 재오픈 가능, 날짜별 영업일 설정 |
| 특정일 | 지정한 날은 전체 근무시간에 초과 시급 적용 |
| 공지 · 재고 · 메모 | 공지 작성, 구역별 재고 관리, 할 일 메모 |
| 직원 관리 | 직원 계정 생성, 시급·프로필 수정 |

### 권한

- **OWNER**: 직원 관리, 특정일 관리, 주간 일정 생성·마감·확정·재오픈, 배정 수정, 공지 관리
- **MANAGER**: 직원 관리를 제외한 운영과 일정 투표 관리
- **STAFF**: 일정 투표, 본인 근무 기록·월급 확인, 공지·재고·메모 사용

## 기술 스택

- **Frontend**: React, TypeScript, Vite
- **Backend**: Spring Boot, Java 21, Spring Security, JPA, JWT
- **Database**: MySQL
- **Infra**: Docker Compose, Caddy, GitHub Actions, Oracle Cloud

## 프로젝트 구조

```
seori/
├── seori_front/          # React 프론트엔드
├── seori_back/           # Spring Boot 백엔드
├── scripts/backup.sh     # MySQL 일일 백업
├── docker-compose.yaml   # 운영 구성 (mysql + backend + frontend)
└── .github/workflows/    # CI/CD
```

## 브랜치 전략

- `main`: 운영 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`, `fix/*`, `refactor/*`, `chore/*`: 이슈 번호를 붙인 작업 브랜치 (예: `feature/55-voting-reopen`)
