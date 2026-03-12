import { supabase } from '../supabase'
import type { ChatMessage } from '@/lib/types/chat'

// ── 채팅 히스토리 조회 ────────────────────────────

/** 특정 모임의 채팅 메시지를 시간순으로 조회 (발신자 프로필 포함) */
export async function fetchChatMessages(
  meetupId: string,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_message')
    .select('*, profile!user_id(nickname, avatar_url)')
    .eq('meetup_id', meetupId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map(normalizeChatMessage)
}

// ── 메시지 전송 ──────────────────────────────────

/** 채팅 메시지 전송 */
export async function sendChatMessage(
  meetupId: string,
  content: string,
): Promise<ChatMessage> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { data, error } = await supabase
    .from('chat_message')
    .insert({
      meetup_id: meetupId,
      user_id: user.id,
      content: content.trim(),
    })
    .select('*, profile!user_id(nickname, avatar_url)')
    .single()

  if (error) throw error

  return normalizeChatMessage(data)
}

// ── 유틸리티 ─────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeChatMessage(row: any): ChatMessage {
  return {
    id: row.id,
    meetup_id: row.meetup_id,
    user_id: row.user_id,
    content: row.content,
    created_at: row.created_at,
    sender_profile: row.profile
      ? { nickname: row.profile.nickname, avatar_url: row.profile.avatar_url }
      : null,
  }
}
