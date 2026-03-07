import { createFileRoute, Link } from '@tanstack/react-router'
import { Beer, ArrowRight, Users, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex flex-col items-center gap-12 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center space-y-6 max-w-lg mx-auto">
        <div className="inline-flex rounded-full bg-primary/10 p-4 mb-2">
          <Beer className="size-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-[1.15]">
          같이 마실 사람,{' '}
          <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
            여기서 찾자
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          대학생 술모임 매칭 서비스에서 새로운 인연을 만나보세요
        </p>
        <Link to="/meetups">
          <Button size="lg" className="text-base px-8 gap-2 rounded-full h-12 shadow-lg shadow-primary/20">
            모임 둘러보기
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {[
          { icon: Zap, title: '빠른 매칭', desc: '원하는 모임에 바로 신청' },
          { icon: Users, title: '대학생 전용', desc: '같은 또래와 함께하는 모임' },
          { icon: Shield, title: '안전한 서비스', desc: '인증된 사용자만 참여' },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border/50 p-6 text-center"
          >
            <div className="rounded-full bg-primary/10 p-2.5">
              <Icon className="size-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
