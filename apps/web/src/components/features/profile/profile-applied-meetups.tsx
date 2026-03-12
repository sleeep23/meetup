import { Link } from '@tanstack/react-router'
import { Users, Calendar, ChevronRight, Beer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getMeetupStatus, getStatusBadgeProps } from '@/lib/meetup-utils'
import type { Meetup } from '@/lib/types/meetup'

interface ProfileAppliedMeetupsProps {
  meetups: Meetup[]
}

export function ProfileAppliedMeetups({ meetups }: ProfileAppliedMeetupsProps) {
  if (meetups.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 space-y-3">
        <div className="rounded-full bg-muted p-4">
          <Beer className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          아직 신청한 모임이 없어요
        </p>
        <Link to="/meetups">
          <Button variant="outline" size="sm">
            모임 둘러보기
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <section>
      <div className="space-y-2">
        {meetups.map((meetup) => {
          const deadlineDate = new Date(meetup.deadline)
          const status = getMeetupStatus(meetup)
          const { variant: badgeVariant, label: badgeLabel } =
            getStatusBadgeProps(status)

          return (
            <Link
              key={meetup.id}
              to="/meetups/$meetupId"
              params={{ meetupId: meetup.id }}
              className="block"
            >
              <div className="flex items-center gap-4 py-3.5 px-4 rounded-xl border border-border hover:border-primary/20 hover:bg-accent/50 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      variant={badgeVariant}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {badgeLabel}
                    </Badge>
                    <span className="text-sm font-medium truncate">
                      {meetup.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {meetup.application_count}/{meetup.max_participants}명
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {deadlineDate.toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      마감
                    </span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
