import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from './supabase'
import { isDevAuthBypass, DEV_USER } from './dev'
import { getProfile, ensureProfile } from './auth'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types/user'

// ── 상태 타입 ──────────────────────────────────────────

/** Auth 상태: Supabase session/user 기반 */
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

/** Profile 상태: DB profile 테이블 기반 (auth와 독립) */
type ProfileStatus = 'idle' | 'loading' | 'loaded' | 'error'

interface AuthContextValue {
  // Auth
  authStatus: AuthStatus
  user: User | null

  // Profile
  profileStatus: ProfileStatus
  profile: Profile | null

  // Actions
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// ── Context ────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('idle')
  const [profile, setProfile] = useState<Profile | null>(null)

  // ── Profile 로드 함수 (수동 호출 가능) ──
  const refreshProfile = useCallback(async () => {
    setProfileStatus('loading')
    try {
      const p = await getProfile()
      setProfile(p)
      setProfileStatus(p ? 'loaded' : 'error')
    } catch {
      setProfileStatus('error')
    }
  }, [])

  // ── Dev 바이패스 ──
  useEffect(() => {
    if (!isDevAuthBypass) return
    setUser(DEV_USER as unknown as User)
    setAuthStatus('authenticated')
    refreshProfile()
  }, [refreshProfile])

  // ── 1) onAuthStateChange: 순수 상태 업데이트만 수행 ──
  useEffect(() => {
    if (isDevAuthBypass) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // 콜백 내부에서 추가 Supabase 호출 금지 — state만 업데이트
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setProfileStatus('idle')
        setAuthStatus('unauthenticated')
        return
      }

      if (session?.user) {
        setUser(session.user)
        setAuthStatus('authenticated')
      } else if (event === 'INITIAL_SESSION') {
        // session 없이 INITIAL_SESSION → 비로그인 확정
        setAuthStatus('unauthenticated')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── 2) user 변경 시 profile fetch — 별도 effect로 분리 ──
  const userId = user?.id
  useEffect(() => {
    if (isDevAuthBypass) return
    if (!userId) return

    let cancelled = false
    setProfileStatus('loading')

    const loadProfile = async () => {
      try {
        await ensureProfile()
        const p = await getProfile()
        if (!cancelled) {
          setProfile(p)
          setProfileStatus(p ? 'loaded' : 'error')
        }
      } catch {
        if (!cancelled) setProfileStatus('error')
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [userId]) // user.id 변경 시에만 재실행

  // ── 로그아웃 ──
  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // SIGNED_OUT 이벤트가 onAuthStateChange에서 상태를 초기화함
  }, [])

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        profileStatus,
        profile,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Auth 상태 접근 훅.
 * 반드시 AuthProvider 내부에서 사용해야 합니다.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다')
  }
  return ctx
}
