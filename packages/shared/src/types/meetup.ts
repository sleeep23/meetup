import type { Profile } from './user'

/** DB meetup 테이블 row (snake_case) */
export interface MeetupRow {
  id: string
  title: string
  description: string | null
  max_participants: number
  deadline: string
  created_by: string
  created_at: string
}

/** 프론트엔드 표시용 모임 (application count + 개설자 프로필 포함) */
export interface Meetup extends MeetupRow {
  /** 현재 신청자 수 (application 테이블에서 count) */
  application_count: number
  /** 개설자 프로필 (profile JOIN) */
  creator_profile: Pick<Profile, 'nickname' | 'avatar_url'> | null
}

/** DB application 테이블 row */
export interface ApplicationRow {
  id: string
  meetup_id: string
  user_id: string
  created_at: string
}
