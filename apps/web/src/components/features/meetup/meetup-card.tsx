import { Users, Clock, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  getMeetupStatus,
  getStatusBadgeProps,
  formatTimeLeft,
} from '@/lib/meetup-utils'
import { hasLocation } from '@/lib/types/meetup'
import type { Meetup } from '@/lib/types/meetup'

interface MeetupCardProps {
  meetup: Meetup
}

export function MeetupCard({ meetup }: MeetupCardProps) {
  const status = getMeetupStatus(meetup)
  const { variant: badgeVariant, label: badgeLabel } = getStatusBadgeProps(status)
  const isClosed = status === 'expired' || status === 'full'
  const timeLeft = formatTimeLeft(meetup.deadline)
  const fillPercent = Math.min(
    (meetup.application_count / meetup.max_participants) * 100,
    100,
  )

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5',
        'h-full flex flex-col gap-0 py-0',
        isClosed && 'opacity-60 hover:opacity-80',
      )}
    >
      {/* Status + Time */}
      <div className="flex items-center justify-between px-5 pt-5">
        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
        <span
          className={cn(
            'flex items-center gap-1 text-xs',
            status === 'urgent'
              ? 'text-status-urgent font-medium'
              : 'text-muted-foreground',
          )}
        >
          <Clock className="size-3" />
          {timeLeft}
        </span>
      </div>

      {/* Title + Description */}
      <CardContent className="flex-1 pt-3 pb-0 px-5">
        <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {meetup.title}
        </h3>
        {meetup.description && (
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
            {meetup.description}
          </p>
        )}
      </CardContent>

      {/* Footer */}
      <div className="px-5 pb-5 pt-4 mt-auto space-y-3">
        {/* Participant progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="size-3.5" />
              참여
            </span>
            <span className="font-medium tabular-nums">
              {meetup.application_count}
              <span className="text-muted-foreground">
                /{meetup.max_participants}명
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isClosed
                  ? 'bg-status-closed'
                  : fillPercent >= 80
                    ? 'bg-status-urgent'
                    : 'bg-primary',
              )}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Location */}
        {hasLocation(meetup) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            <span className="truncate">{meetup.location_name}</span>
          </div>
        )}

        {/* Creator */}
        {meetup.creator_profile && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <Avatar className="h-5 w-5">
              {meetup.creator_profile.avatar_url && (
                <AvatarImage
                  src={meetup.creator_profile.avatar_url}
                  alt={meetup.creator_profile.nickname ?? ''}
                />
              )}
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {meetup.creator_profile.nickname?.[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {meetup.creator_profile.nickname}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
