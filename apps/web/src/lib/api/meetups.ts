import { supabase } from '../supabase'
import type { Meetup, MeetupRow } from '@/lib/types/meetup'
import type { CreateMeetupInput } from '@/lib/schemas/meetup'

// ── 모임 목록 조회 ────────────────────────────

/** 모든 모임을 생성일 기준 내림차순으로 조회 (신청자 수 + 개설자 프로필 포함) */
export async function fetchMeetups(): Promise<Meetup[]> {
  const { data, error } = await supabase
    .from('meetup')
    .select('*, application(count), profile!created_by(nickname, avatar_url)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map(normalizeMeetup)
}

// ── 모임 상세 조회 ────────────────────────────

/** 단일 모임을 ID로 조회 (신청자 수 + 개설자 프로필 포함) */
export async function fetchMeetup(id: string): Promise<Meetup | null> {
  const { data, error } = await supabase
    .from('meetup')
    .select('*, application(count), profile!created_by(nickname, avatar_url)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // row not found
    throw error
  }

  return normalizeMeetup(data)
}

// ── 내가 만든 모임 ────────────────────────────

/** 현재 로그인 유저가 만든 모임 목록 */
export async function fetchMyCreatedMeetups(): Promise<Meetup[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('meetup')
    .select('*, application(count), profile!created_by(nickname, avatar_url)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map(normalizeMeetup)
}

// ── 내가 신청한 모임 ──────────────────────────

/** 현재 로그인 유저가 신청한 모임 목록 */
export async function fetchMyAppliedMeetups(): Promise<Meetup[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  // 1) 내가 신청한 meetup_id 목록 조회
  const { data: applications, error: appError } = await supabase
    .from('application')
    .select('meetup_id')
    .eq('user_id', user.id)

  if (appError) throw appError
  if (!applications || applications.length === 0) return []

  const meetupIds = applications.map((a) => a.meetup_id)

  // 2) 해당 모임들 조회
  const { data, error } = await supabase
    .from('meetup')
    .select('*, application(count), profile!created_by(nickname, avatar_url)')
    .in('id', meetupIds)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map(normalizeMeetup)
}

// ── 모임 생성 ─────────────────────────────────

/** 새 모임 생성 */
export async function createMeetup(
  input: CreateMeetupInput,
): Promise<MeetupRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const insertData: Record<string, unknown> = {
    title: input.title,
    description: input.description ?? null,
    max_participants: input.maxParticipants,
    deadline: input.deadline,
    created_by: user.id,
  }

  // 장소 정보가 있으면 추가
  if (input.location) {
    insertData.location_name = input.location.name
    insertData.location_address = input.location.address ?? null
    insertData.location_latitude = input.location.latitude
    insertData.location_longitude = input.location.longitude
  }

  const { data, error } = await supabase
    .from('meetup')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error
  return data as MeetupRow
}

// ── 모임 수정 ─────────────────────────────────

/** 모임 정보 수정 (개설자만 가능) */
export async function updateMeetup(
  id: string,
  input: Partial<CreateMeetupInput>,
): Promise<MeetupRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  // snake_case로 변환
  const updates: Record<string, unknown> = {}
  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description || null
  if (input.maxParticipants !== undefined) updates.max_participants = input.maxParticipants
  if (input.deadline !== undefined) updates.deadline = input.deadline

  const { data, error } = await supabase
    .from('meetup')
    .update(updates)
    .eq('id', id)
    .eq('created_by', user.id) // 본인 모임만 수정 가능
    .select()
    .single()

  if (error) throw error
  return data as MeetupRow
}

// ── 모임 삭제 ─────────────────────────────────

/** 모임 삭제 (개설자만 가능) */
export async function deleteMeetup(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { error } = await supabase
    .from('meetup')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) throw error
}

// ── 유틸리티 ──────────────────────────────────

/**
 * Supabase의 `application(count)` + `profile!created_by` 응답을 정규화.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMeetup(row: any): Meetup {
  const applicationCount =
    Array.isArray(row.application) && row.application.length > 0
      ? row.application[0].count
      : 0

  const creatorProfile = row.profile
    ? { nickname: row.profile.nickname, avatar_url: row.profile.avatar_url }
    : null

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    max_participants: row.max_participants,
    deadline: row.deadline,
    created_by: row.created_by,
    created_at: row.created_at,
    location_name: row.location_name ?? null,
    location_address: row.location_address ?? null,
    location_latitude: row.location_latitude ?? null,
    location_longitude: row.location_longitude ?? null,
    application_count: applicationCount,
    creator_profile: creatorProfile,
  }
}
