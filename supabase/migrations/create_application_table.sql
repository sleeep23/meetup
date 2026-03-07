-- =============================================
-- 술모임 모임 신청(application) 테이블
-- Supabase SQL Editor에서 실행하세요
-- create_meetup_table.sql 실행 후 실행해야 합니다
-- =============================================

-- application 테이블 생성
create table if not exists public.application (
  id uuid default gen_random_uuid() primary key,
  meetup_id uuid references public.meetup(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,

  -- 같은 모임에 같은 유저가 중복 신청 방지
  unique (meetup_id, user_id)
);

-- RLS 활성화
alter table public.application enable row level security;

-- 정책: 본인의 신청 내역만 조회 가능
create policy "신청 조회: 본인만"
  on public.application for select
  using (auth.uid() = user_id);

-- 정책: 모임의 신청자 수 조회를 위해 모든 인증 사용자가 count 가능
-- (상세 페이지에서 현재 참여자 수 표시용)
create policy "신청 수 조회: 인증 사용자"
  on public.application for select
  using (auth.uid() is not null);

-- 정책: 인증된 사용자만 신청 가능
create policy "신청 생성: 인증 사용자"
  on public.application for insert
  with check (auth.uid() = user_id);

-- 정책: 본인의 신청만 취소(삭제) 가능
create policy "신청 취소: 본인만"
  on public.application for delete
  using (auth.uid() = user_id);

-- 인덱스: 모임별 신청자 조회용
create index if not exists idx_application_meetup_id on public.application (meetup_id);

-- 인덱스: 유저별 신청 내역 조회용
create index if not exists idx_application_user_id on public.application (user_id);
