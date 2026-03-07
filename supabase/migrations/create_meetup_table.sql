-- =============================================
-- 술모임 모임(meetup) 테이블
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- meetup 테이블 생성
create table if not exists public.meetup (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  max_participants int not null default 4
    check (max_participants >= 2 and max_participants <= 50),
  deadline timestamptz not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- RLS 활성화
alter table public.meetup enable row level security;

-- 정책: 모든 사용자가 모임 조회 가능 (비로그인 포함)
create policy "모임 조회: 모든 사용자"
  on public.meetup for select
  using (true);

-- 정책: 인증된 사용자만 모임 생성 가능
create policy "모임 생성: 인증 사용자"
  on public.meetup for insert
  with check (auth.uid() = created_by);

-- 정책: 본인이 만든 모임만 수정 가능
create policy "모임 수정: 작성자만"
  on public.meetup for update
  using (auth.uid() = created_by);

-- 정책: 본인이 만든 모임만 삭제 가능
create policy "모임 삭제: 작성자만"
  on public.meetup for delete
  using (auth.uid() = created_by);

-- 인덱스: 마감일 기준 정렬용
create index if not exists idx_meetup_deadline on public.meetup (deadline desc);

-- 인덱스: 작성자별 조회용
create index if not exists idx_meetup_created_by on public.meetup (created_by);
