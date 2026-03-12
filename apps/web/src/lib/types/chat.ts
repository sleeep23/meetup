import type { Profile } from './user'

/** DB chat_message 테이블 row (snake_case) */
export interface ChatMessageRow {
  id: string
  meetup_id: string
  user_id: string
  content: string
  created_at: string
}

/** 프론트엔드 표시용 채팅 메시지 (발신자 프로필 포함) */
export interface ChatMessage extends ChatMessageRow {
  /** 발신자 프로필 (profile JOIN) */
  sender_profile: Pick<Profile, 'nickname' | 'avatar_url'> | null
}
