import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Beer } from 'lucide-react'
import { OAuthLoginButtons } from '@/components/features/auth/oauth-login-buttons'
import { Button } from '@/components/ui/button'
import { isDevAuthBypass } from '@/lib/dev'
import { useAuth } from '@/lib/auth-context'
import { useEffect } from 'react'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/auth/login')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { authStatus } = useAuth()

  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate({ to: '/' })
    }
  }, [authStatus, navigate])

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] -mt-6">
        <p className="text-muted-foreground">확인 중...</p>
      </div>
    )
  }

  if (authStatus === 'authenticated') return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 -mt-6">
      {/* Brand Hero */}
      <div className="flex flex-col items-center space-y-6 mb-10">
        <div className="relative">
          <div className="rounded-full bg-primary/10 p-6">
            <Beer className="size-12 text-primary" />
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl scale-150" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            술모임에 오신 것을 환영해요
          </h1>
          <p className="text-muted-foreground text-base max-w-xs mx-auto">
            대학생 모임 서비스에서 새로운 인연을 만나보세요
          </p>
        </div>
      </div>

      {/* Login Actions */}
      <div className="w-full max-w-sm space-y-6">
        <OAuthLoginButtons />

        <p className="text-xs text-center text-muted-foreground leading-relaxed">
          로그인 시{' '}
          <span className="underline underline-offset-2 cursor-pointer">
            이용약관
          </span>{' '}
          및{' '}
          <span className="underline underline-offset-2 cursor-pointer">
            개인정보처리방침
          </span>
          에 동의하는 것으로 간주됩니다
        </p>
      </div>

      {isDevAuthBypass && (
        <div className="mt-8 pt-6 border-t border-dashed w-full max-w-sm">
          <Button
            variant="outline"
            className="w-full text-muted-foreground"
            onClick={() => navigate({ to: '/' })}
          >
            [DEV] 인증 없이 들어가기
          </Button>
        </div>
      )}
    </div>
  )
}
