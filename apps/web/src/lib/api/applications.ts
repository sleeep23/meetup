import { supabase } from '../supabase'
import type { ApplicationRow } from '@/lib/types/meetup'

// ── 신청 여부 확인 ────────────────────────────

/** 현재 유저가 해당 모임에 신청했는지 확인 */
export async function checkMyApplication(
  meetupId: string,
): Promise<ApplicationRow | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('application')
    .select('*')
    .eq('meetup_id', meetupId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data as ApplicationRow | null
}

// ── 모임 신청 ─────────────────────────────────

/** 모임에 신청 */
export async function applyToMeetup(
  meetupId: string,
): Promise<ApplicationRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { data, error } = await supabase
    .from('application')
    .insert({
      meetup_id: meetupId,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    // 중복 신청 에러 처리
    if (error.code === '23505') {
      throw new Error('이미 신청한 모임입니다')
    }
    throw error
  }

  return data as ApplicationRow
}

// ── 신청 취소 ─────────────────────────────────

/** 모임 신청 취소 */
export async function cancelApplication(meetupId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { error } = await supabase
    .from('application')
    .delete()
    .eq('meetup_id', meetupId)
    .eq('user_id', user.id)

  if (error) throw error
}

// ── 내가 신청한 모임 ──────────────────────────

/** 현재 유저가 신청한 모임 ID 목록 */
export async function fetchMyApplicationMeetupIds(): Promise<string[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('application')
    .select('meetup_id')
    .eq('user_id', user.id)

  if (error) throw error
  return (data ?? []).map((row) => row.meetup_id)
}
