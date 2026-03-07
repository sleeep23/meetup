import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Beer, CalendarClock, Users, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MeetupCard } from '@/components/features/meetup/meetup-card'
import { MeetupCardSkeleton } from '@/components/features/meetup/meetup-card-skeleton'
import { CreateMeetupDialog } from '@/components/features/meetup/create-meetup-dialog'
import { fetchMeetups } from '@/lib/api/meetups'
import { useAuth } from '@/lib/auth-context'
import { getMeetupStatus } from '@/lib/meetup-utils'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'open' | 'urgent' | 'closed'

export const Route = createFileRoute('/meetups/')({
  component: MeetupsPage,
})

function MeetupsPage() {
  const navigate = useNavigate()
  const { authStatus } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const {
    data: meetups,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['meetups'],
    queryFn: fetchMeetups,
  })

  const filteredMeetups = meetups?.filter((meetup) => {
    if (activeFilter === 'all') return true
    const status = getMeetupStatus(meetup)
    if (activeFilter === 'open') return status === 'open'
    if (activeFilter === 'urgent') return status === 'urgent'
    if (activeFilter === 'closed') return status === 'full' || status === 'expired'
    return true
  })

  const counts = {
    all: meetups?.length ?? 0,
    open: meetups?.filter((m) => getMeetupStatus(m) === 'open').length ?? 0,
    urgent: meetups?.filter((m) => getMeetupStatus(m) === 'urgent').length ?? 0,
    closed:
      meetups?.filter((m) => ['full', 'expired'].includes(getMeetupStatus(m)))
        .length ?? 0,
  }

  const handleCreateClick = () => {
    if (authStatus !== 'authenticated') {
      navigate({ to: '/auth/login', search: { redirect: '/meetups' } })
      return
    }
    setDialogOpen(true)
  }

  const filters: { key: FilterType; label: string; icon: typeof Flame }[] = [
    { key: 'all', label: '전체', icon: Beer },
    { key: 'open', label: '모집중', icon: Users },
    { key: 'urgent', label: '마감임박', icon: Flame },
    { key: 'closed', label: '마감', icon: CalendarClock },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">모임 찾기</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            지금 모집 중인 술모임에 참여해보세요
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="hidden sm:inline-flex gap-2"
        >
          <Plus className="size-4" />
          모임 만들기
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {filters.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              activeFilter === key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="size-3.5" />
            {label}
            {!isLoading && counts[key] > 0 && (
              <span
                className={cn(
                  'ml-0.5 text-[10px] tabular-nums',
                  activeFilter === key
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground/70',
                )}
              >
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MeetupCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="rounded-full bg-destructive/10 p-4">
            <Beer className="size-8 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            모임을 불러오지 못했어요
            <br />
            잠시 후 다시 시도해주세요
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </Button>
        </div>
      ) : !filteredMeetups || filteredMeetups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="rounded-full bg-muted p-5">
            <Beer className="size-10 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">
              {activeFilter !== 'all'
                ? '해당하는 모임이 없어요'
                : '아직 모임이 없어요'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeFilter !== 'all'
                ? '다른 필터를 선택하거나 새 모임을 만들어보세요'
                : '첫 번째 술모임을 만들어보세요!'}
            </p>
          </div>
          <Button onClick={handleCreateClick} className="gap-2">
            <Plus className="size-4" />
            모임 만들기
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeetups.map((meetup) => (
            <Link
              key={meetup.id}
              to="/meetups/$meetupId"
              params={{ meetupId: meetup.id }}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <MeetupCard meetup={meetup} />
            </Link>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={handleCreateClick}
        className="fixed bottom-6 right-6 z-40 sm:hidden flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 transition-transform"
        aria-label="모임 만들기"
      >
        <Plus className="size-6" />
      </button>

      <CreateMeetupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
