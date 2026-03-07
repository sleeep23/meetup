import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PlusCircle, CheckCircle2 } from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { ProfileCreatedMeetups } from '@/components/features/profile/profile-created-meetups'
import { ProfileAppliedMeetups } from '@/components/features/profile/profile-applied-meetups'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import { fetchMyCreatedMeetups, fetchMyAppliedMeetups } from '@/lib/api/meetups'
import { cn } from '@/lib/utils'

type ProfileTab = 'created' | 'applied'

export const Route = createFileRoute('/profile/')({
  beforeLoad: async ({ location }) => {
    await requireAuth({ location })
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { profile, profileStatus } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>('created')

  const { data: createdMeetups, isLoading: createdLoading } = useQuery({
    queryKey: ['myCreatedMeetups'],
    queryFn: fetchMyCreatedMeetups,
  })

  const { data: appliedMeetups, isLoading: appliedLoading } = useQuery({
    queryKey: ['myAppliedMeetups'],
    queryFn: fetchMyAppliedMeetups,
  })

  const createdCount = createdMeetups?.length ?? 0
  const appliedCount = appliedMeetups?.length ?? 0

  const tabs = [
    {
      key: 'created' as const,
      label: '만든 모임',
      count: createdCount,
      icon: PlusCircle,
    },
    {
      key: 'applied' as const,
      label: '신청한 모임',
      count: appliedCount,
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20">
            {profile?.avatar_url && (
              <AvatarImage
                src={profile.avatar_url}
                alt={profile.nickname ?? '프로필'}
              />
            )}
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {profile?.nickname?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">
              {profileStatus === 'loading'
                ? '...'
                : profile?.nickname ?? '마이페이지'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              내 정보와 모임 내역
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-xl bg-background/80 p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{createdCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">만든 모임</p>
          </div>
          <div className="rounded-xl bg-background/80 p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{appliedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">신청한 모임</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative',
              activeTab === key
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
            <span
              className={cn(
                'text-xs tabular-nums',
                activeTab === key
                  ? 'text-primary/70'
                  : 'text-muted-foreground/50',
              )}
            >
              {count}
            </span>
            {activeTab === key && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'created' ? (
        createdLoading ? (
          <ProfileSkeleton />
        ) : (
          <ProfileCreatedMeetups meetups={createdMeetups ?? []} />
        )
      ) : appliedLoading ? (
        <ProfileSkeleton />
      ) : (
        <ProfileAppliedMeetups meetups={appliedMeetups ?? []} />
      )}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3.5 px-4 rounded-xl border animate-pulse"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-14 rounded-full bg-muted" />
              <div className="h-4 w-40 rounded bg-muted" />
            </div>
            <div className="flex gap-3">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
