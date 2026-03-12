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
  // 장소 정보 (선택적)
  location_name: string | null
  location_address: string | null
  location_latitude: number | null
  location_longitude: number | null
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

/** 장소 정보 객체 (지도 컴포넌트에서 사용) */
export interface MeetupLocation {
  name: string
  address: string | null
  latitude: number
  longitude: number
}

/** 장소 정보 타입 가드 */
export function hasLocation(meetup: Meetup | MeetupRow): boolean {
  return !!(
    meetup.location_latitude &&
    meetup.location_longitude &&
    meetup.location_name
  )
}

/** 장소 정보 추출 헬퍼 */
export function extractLocation(meetup: Meetup | MeetupRow): MeetupLocation | null {
  if (!hasLocation(meetup)) return null

  return {
    name: meetup.location_name!,
    address: meetup.location_address,
    latitude: meetup.location_latitude!,
    longitude: meetup.location_longitude!,
  }
}
