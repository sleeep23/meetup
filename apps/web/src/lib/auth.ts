import { supabase } from './supabase'
import { isDevAuthBypass, DEV_USER } from './dev'
import { redirect } from '@tanstack/react-router'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '@meetup/shared'

/** 현재 Supabase 세션을 가져온다 */
export async function getSession(): Promise<Session | null> {
  if (isDevAuthBypass) {
    return { user: DEV_USER } as unknown as Session
  }
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/** 현재 로그인된 유저를 가져온다 */
export async function getUser(): Promise<User | null> {
  if (isDevAuthBypass) {
    return DEV_USER as unknown as User
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    // signOut 호출 안 함. 세션 관리는 onAuthStateChange에 위임.
    // 네트워크 오류/토큰 갱신 타이밍 등 일시적 실패일 수 있음.
    return null
  }

  return user
}

/**
 * 보호 라우트의 beforeLoad에서 사용.
 * 세션이 없으면 /auth/login?redirect=현재경로 로 이동시킨다.
 * dev 모드에서는 우회한다.
 */
export async function requireAuth(opts: { location: { href: string } }) {
  if (isDevAuthBypass) return
  const user = await getUser()
  if (!user) {
    throw redirect({
      to: '/auth/login',
      search: { redirect: opts.location.href },
    })
  }
  return user
}

/** Google OAuth 로그인 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}

/**
 * 첫 로그인 시 profile 테이블에 row가 없으면 자동 생성.
 * OAuth provider에서 받은 정보를 활용한다.
 */
export async function ensureProfile(): Promise<Profile | null> {
  const user = await getUser()
  if (!user) return null

  // 기존 프로필 확인
  const { data: existing } = await supabase
    .from('profile')
    .select('*')
    .eq('id', user.id)
    .single()

  if (existing) return existing as Profile

  // 신규 프로필 생성 (OAuth provider 메타데이터 활용)
  const nickname =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    '사용자'
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null

  const { data: newProfile, error } = await supabase
    .from('profile')
    .insert({
      id: user.id,
      nickname,
      avatar_url: avatarUrl,
    })
    .select()
    .single()

  if (error) {
    console.error('프로필 생성 실패:', error)
    return null
  }

  return newProfile as Profile
}

/** 현재 로그인 유저의 프로필을 가져온다 */
export async function getProfile(): Promise<Profile | null> {
  if (isDevAuthBypass) {
    return {
      id: DEV_USER.id,
      nickname: DEV_USER.nickname,
      avatar_url: null,
      created_at: new Date().toISOString(),
    }
  }

  const user = await getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profile')
    .select('*')
    .eq('id', user.id)
    .single()

  return (data as Profile) ?? null
}
