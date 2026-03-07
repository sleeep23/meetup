import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase가 URL hash에서 세션을 자동 복원
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError
        if (!session) throw new Error('세션을 찾을 수 없습니다')

        // onAuthStateChange가 SIGNED_IN을 감지하여 user state를 업데이트함.
        // 추가로 refreshProfile을 호출하여 profile fetch를 확실히 트리거.
        await refreshProfile()

        // 홈으로 이동
        navigate({ to: '/' })
      } catch (err) {
        console.error('OAuth 콜백 처리 실패:', err)
        setError(
          err instanceof Error ? err.message : '인증 처리에 실패했습니다',
        )
      }
    }

    handleCallback()
  }, [navigate, refreshProfile])

  if (error) {
    return (
      <div className="mx-auto max-w-sm py-16 text-center space-y-4">
        <p className="text-destructive">{error}</p>
        <a
          href="/auth/login"
          className="text-sm text-muted-foreground underline"
        >
          로그인 페이지로 돌아가기
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm py-16 text-center text-muted-foreground">
      로그인 처리 중...
    </div>
  )
}
