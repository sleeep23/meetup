-- =============================================
-- 술모임 프로필 테이블
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- profile 테이블 생성 (auth.users와 1:1)
create table if not exists public.profile (
  id uuid references auth.users(id) on delete cascade primary key,
  nickname text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- RLS 활성화
alter table public.profile enable row level security;

-- 정책: 모든 사용자가 프로필 조회 가능
create policy "프로필 조회: 모든 사용자"
  on public.profile for select
  using (true);

-- 정책: 본인만 프로필 생성 가능
create policy "프로필 생성: 본인만"
  on public.profile for insert
  with check (auth.uid() = id);

-- 정책: 본인만 프로필 수정 가능
create policy "프로필 수정: 본인만"
  on public.profile for update
  using (auth.uid() = id);
