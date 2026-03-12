/** 사용자 프로필 (auth.users와 1:1 연결) */
export interface Profile {
  id: string
  nickname: string | null
  avatar_url: string | null
  created_at: string
}

/**
 * @deprecated User 타입은 Profile로 대체되었습니다.
 */
export interface User {
  id: string
  email: string
  nickname: string
  createdAt: string
}
