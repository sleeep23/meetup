import { Link, useNavigate } from '@tanstack/react-router'
import { Beer, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'

export function Header() {
  const { authStatus, profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
          <Beer className="size-5 text-primary" />
          <span>술모임</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/meetups"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
            activeProps={{ className: 'text-foreground font-medium bg-accent' }}
          >
            모임 목록
          </Link>
          {authStatus === 'authenticated' ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all">
                  {profile?.avatar_url && (
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={profile.nickname ?? '프로필'}
                    />
                  )}
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {profile?.nickname?.[0]?.toUpperCase() ?? '?'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="icon-sm" onClick={handleLogout} className="text-muted-foreground">
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : authStatus === 'unauthenticated' ? (
            <Link to="/auth/login">
              <Button size="sm" className="rounded-full px-4">로그인</Button>
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
