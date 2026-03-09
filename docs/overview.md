# 프로젝트 구현 명세서 및 아키텍처 개요

## 1. 모노레포 구조 전체 아키텍처 (Monorepo Architecture)
본 프로젝트는 **Yarn Workspaces**를 기반으로 한 모노레포(Monorepo) 구조를 채택하여 여러 애플리케이션과 패키지를 단일 저장소에서 효율적으로 관리하고 있습니다.
- **apps/**: 실제 배포 및 실행되는 프론트엔드/백엔드 애플리케이션들이 위치합니다.
  - `@meetup/web`: 메인 웹 클라이언트 애플리케이션입니다.
- **packages/**: 여러 애플리케이션에서 공통으로 사용되는 모듈, 타입, 유틸리티, UI 컴포넌트 등이 위치합니다.
  - `@meetup/shared`: 공통 데이터 스키마, TypeScript 타입 정의, 유틸리티 함수 등 비즈니스 로직과 데이터 검증 로직이 포함되어 중복 코드를 방지합니다.
- **supabase/**: 데이터베이스 마이그레이션(`migrations`) 및 백엔드 설정 파일이 포함되어 있어 BaaS(Backend as a Service)와의 연동을 관리합니다.

**장점**: 프론트엔드 애플리케이션(`web`)과 공통 패키지(`shared`) 간의 종속성 관리가 용이하며, 한 번의 빌드로 전체 패키지의 테스트 및 빌드를 병렬로 수행할 수 있습니다.

---

## 2. 웹 애플리케이션 아키텍처 (Web Architecture)
웹 애플리케이션(`apps/web`)은 최신 프론트엔드 생태계를 적극 활용하여 높은 성능과 유지보수성을 확보했습니다.

- **프레임워크 및 빌드 도구**: React 19와 Vite를 사용하여 빠르고 현대적인 렌더링 환경 제공
- **라우팅 (Routing)**: `TanStack Router`
  - 파일 기반 라우팅 시스템 채택 (`routeTree.gen.ts` 자동 생성)
  - 주요 라우트: 홈(`/`), 프로필(`/profile`), 밋업 목록(`/meetups`), 밋업 상세(`/meetups/$meetupId`), 로그인/콜백(`/auth`)
  - 타입 세이프(Type-safe)한 라우팅으로 개발 서버 런타임 오류 방지
- **상태 관리 및 데이터 패칭**: `TanStack React Query`
  - 서버 상태(Server State) 관리 및 캐싱, 자동 리패칭 로직 처리
- **백엔드 연동 (BaaS)**: `Supabase (@supabase/supabase-js)`
  - PostgreSQL 기반의 데이터베이스 스키마와 직접 통신
  - 인증(Authentication) 및 사용자 세션 관리
- **스타일링 (Styling)**: `TailwindCSS v4`
  - 유틸리티 퍼스트 CSS를 통한 빠른 UI 디자인 구현
  - `Radix UI` 프리미티브와 `clsx`, `tailwind-merge`, `class-variance-authority`를 결합하여 접근성 높은 커스텀 UI 스팀(shadcn/ui 스타일) 구축
- **폼 및 데이터 검증**: `zod`
  - 프론트엔드 폼 유효성 검사 및 Supabase에서 받아온 데이터 정합성 보장

---

## 3. 추후 구현 추천 기능 및 구현 방법 (Future Features & Implementation)

기본적인 MVP(인증, 밋업 생성/목록/신청/관리)가 갖춰진 후, 사용자의 참여도를 높이고 플랫폼으로서의 가치를 상승시키기 위해 다음 기능들을 추천합니다.

### 추천 기능 1: 실시간 알림 시스템 (Real-time Notifications)
**목적**: 밋업이 생성되거나, 내가 주최한 밋업에 새로운 신청자가 발생할 때, 신청이 승인/거부되었을 때 사용자에게 즉각적으로 알림을 제공합니다.
**구현 방법**:
- **데이터베이스**: `notifications` 테이블을 생성하여 사용자별 알림 내역을 저장.
- **실시간 통신**: Supabase의 **Realtime API (Postgres Changes)** 구독(Subscription) 채널을 활용. 웹 애플리케이션 진입 시 `useEffect`에서 구독을 초기화하여 알림 발생 시 우측 하단 토스트(`sonner`) 팝업을 띄움.
- **상태 업데이트**: TanStack Query를 활용해 알림 목록을 인피니트 캐싱하고, 읽음 처리 시 뮤테이션(Mutation)을 발생시킴.

### 추천 기능 2: 고급 검색 및 필터링 기능 (Advanced Search & Filter)
**목적**: 사용자가 자신의 관심사, 날짜, 지역 등에 맞춰 밋업을 쉽게 찾을 수 있도록 지원합니다.
**구현 방법**:
- **상태 관리**: URL 쿼리 파라미터(Search Params)를 활용. TanStack Router의 `search` 속성 검증(zod 활용)과 엮어 URL과 검색 상태를 동기화.
- **API 연동**: Supabase의 `.ilike()` (텍스트 검색) 및 `.gte()`, `.lte()` (날짜/인원수 필터링)를 활용하여 RPC(Remote Procedure Call) 또는 PostgREST 쿼리 최적화.
- **UI**: 디바운스(Debounce)가 적용된 검색 입력창, 태그 기반의 카테고리 필터 UI 구성.

### 추천 기능 3: 밋업 내 커뮤니티 채팅 또는 댓글 (Meetup Comments & Chat)
**목적**: 밋업 신청 전/후에 참여자들 간에 궁금한 점을 묻거나 소통할 수 있는 공간을 마련하여 커뮤니티 활성화.
**구현 방법**:
- **스키마 구조**: `comments` 또는 `messages` 테이블을 `meetup_id`에 종속되도록 생성하고, 권한 제어(RLS)를 통해 참여자/주최자만 볼 수 있는 프라이빗 댓글 기능 추가 지원.
- **구현 기법**: 낙관적 업데이트(Optimistic Update)를 React Query의 `onMutate`에 적용해 즉각적인 반응성 제공.
- **실시간 강화**: 채팅 형태인 경우 Supabase Realtime 채널 적용하여 다른 사람의 새 댓글이 화면을 다시 로드하지 않고 표시되도록 구현.

### 추천 기능 4: 주최자용 통합 관리 대시보드 (Organizer Dashboard)
**목적**: `My Page`의 확장판으로 밋업 주최자가 여러 신청자를 한눈에 보고 상태(승인/대기/거절)를 대량 변경하거나 통계를 볼 수 있게 함.
**구현 방법**:
- **신규 라우트**: `/meetups/$meetupId/manage` 라우트를 추가. 해당 라우트는 주최자의 UID와 밋업의 주최자 ID가 일치할 때만 접근 가능하도록 Route 훅(Loader)에서 가드 처리.
- **기능 컴포넌트**: `Radix UI`의 Data Table 구조를 만들어 신청자의 간략한 프로필을 띄우고 Bulk Action(전체 선택, 일괄 승인 등) 로직을 Supabase `.update()` API와 결합.

---

본 명세서는 현재 구현된 아키텍처의 안정성을 바탕으로 향후 확장 가능한 애플리케이션 기반을 증명하며, 추천된 기능들을 모듈형으로 점진적으로 추가 도입(Progressive Enhancement)하기에 적합하도록 설계되었습니다.
