import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Clock, Calendar, ArrowLeft, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { KakaoMap } from '@/components/ui/map'
import { MeetupDetailSkeleton } from '@/components/features/meetup/meetup-detail-skeleton'
import { fetchMeetup } from '@/lib/api/meetups'
import {
  applyToMeetup,
  cancelApplication,
  checkMyApplication,
} from '@/lib/api/applications'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import {
  getMeetupStatus,
  getStatusBadgeProps,
  formatTimeLeft,
} from '@/lib/meetup-utils'
import { extractLocation } from '@/lib/types/meetup'

export const Route = createFileRoute('/meetups/$meetupId')({
  component: MeetupDetailPage,
})

function MeetupDetailPage() {
  const { meetupId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { authStatus, user } = useAuth()

  const {
    data: meetup,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['meetup', meetupId],
    queryFn: () => fetchMeetup(meetupId),
  })

  const { data: myApplication } = useQuery({
    queryKey: ['myApplication', meetupId],
    queryFn: () => checkMyApplication(meetupId),
    enabled: authStatus === 'authenticated',
  })

  const hasApplied = !!myApplication

  const applyMutation = useMutation({
    mutationFn: () => applyToMeetup(meetupId),
    onSuccess: () => {
      toast.success('신청이 완료되었어요!', { description: '모임에서 만나요' })
      queryClient.invalidateQueries({ queryKey: ['meetup', meetupId] })
      queryClient.invalidateQueries({ queryKey: ['myApplication', meetupId] })
    },
    onError: (err: Error) => {
      toast.error('신청에 실패했어요', { description: err.message })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelApplication(meetupId),
    onSuccess: () => {
      toast('신청이 취소되었어요')
      queryClient.invalidateQueries({ queryKey: ['meetup', meetupId] })
      queryClient.invalidateQueries({ queryKey: ['myApplication', meetupId] })
    },
    onError: (err: Error) => {
      toast.error('취소에 실패했어요', { description: err.message })
    },
  })

  if (isLoading) {
    return <MeetupDetailSkeleton />
  }

  if (error || !meetup) {
    return (
      <div className="mx-auto max-w-2xl flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-destructive font-medium">
          {error ? '모임 정보를 불러오지 못했습니다.' : '존재하지 않는 모임입니다.'}
        </p>
        <Link
          to="/meetups"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const status = getMeetupStatus(meetup)
  const { variant: badgeVariant, label: badgeLabel } = getStatusBadgeProps(status)
  const isFull = meetup.application_count >= meetup.max_participants
  const deadlineDate = new Date(meetup.deadline)
  const isExpired = deadlineDate < new Date()
  const isMutating = applyMutation.isPending || cancelMutation.isPending
  const isOwner = user?.id === meetup.created_by
  const fillPercent = Math.min(
    (meetup.application_count / meetup.max_participants) * 100,
    100,
  )

  const location = meetup ? extractLocation(meetup) : null

  const handleApplyClick = () => {
    if (authStatus !== 'authenticated') {
      navigate({
        to: '/auth/login',
        search: { redirect: `/meetups/${meetupId}` },
      })
      return
    }

    if (hasApplied) {
      cancelMutation.mutate()
    } else {
      applyMutation.mutate()
    }
  }

  const getButtonLabel = () => {
    if (isOwner) return '내가 만든 모임이에요'
    if (isExpired) return '모집이 마감되었어요'
    if (isFull && !hasApplied) return '정원이 찼어요'
    if (isMutating) return hasApplied ? '취소 중...' : '신청 중...'
    if (hasApplied) return '신청 취소'
    if (authStatus !== 'authenticated') return '로그인하고 신청하기'
    return '신청하기'
  }

  return (
    <div className="mx-auto max-w-2xl pb-24 sm:pb-8">
      {/* Back link */}
      <Link
        to="/meetups"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        목록으로
      </Link>

      {/* Status + Title */}
      <div className="space-y-3">
        <Badge variant={badgeVariant} className="text-sm px-3 py-1">
          {badgeLabel}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
          {meetup.title}
        </h1>
      </div>

      {/* Creator info */}
      {meetup.creator_profile && (
        <div className="flex items-center gap-3 mt-5">
          <Avatar className="h-10 w-10">
            {meetup.creator_profile.avatar_url && (
              <AvatarImage
                src={meetup.creator_profile.avatar_url}
                alt={meetup.creator_profile.nickname ?? '개설자'}
              />
            )}
            <AvatarFallback className="text-sm bg-primary/10 text-primary">
              {meetup.creator_profile.nickname?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {meetup.creator_profile.nickname}
              {isOwner && (
                <span className="ml-1.5 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  나
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">모임 개설자</p>
          </div>
        </div>
      )}

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {/* Participants Card */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            참여 인원
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {meetup.application_count}
            <span className="text-base font-normal text-muted-foreground">
              /{meetup.max_participants}명
            </span>
          </p>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                status === 'full' || status === 'expired'
                  ? 'bg-status-closed'
                  : fillPercent >= 80
                    ? 'bg-status-urgent'
                    : 'bg-primary',
              )}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Deadline Card */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            모집 마감
          </div>
          <p className="text-lg font-bold">
            {deadlineDate.toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </p>
          <p
            className={cn(
              'text-xs font-medium flex items-center gap-1',
              status === 'urgent'
                ? 'text-status-urgent'
                : 'text-muted-foreground',
            )}
          >
            <Clock className="size-3" />
            {formatTimeLeft(meetup.deadline)}
          </p>
        </div>
      </div>

      {/* Location Section */}
      {location && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            <h2 className="font-medium">모임 장소</h2>
          </div>

          {/* Location Info Card */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-medium text-foreground">{location.name}</p>
            {location.address && (
              <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
            )}
          </div>

          {/* Map */}
          <KakaoMap
            location={location}
            className="w-full h-60 sm:h-80"
            level={3}
            showMarker={true}
            draggable={true}
            zoomable={true}
          />
        </div>
      )}

      {/* Description */}
      <div className="mt-6 rounded-xl bg-muted/50 p-5">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          모임 설명
        </h2>
        <p className="text-foreground leading-relaxed whitespace-pre-line">
          {meetup.description || '아직 설명이 없어요.'}
        </p>
      </div>

      {/* Desktop CTA */}
      <div className="hidden sm:block mt-8">
        <Button
          className="w-full h-12 text-base font-semibold"
          disabled={isOwner || (isFull && !hasApplied) || isExpired || isMutating}
          variant={hasApplied ? 'outline' : isOwner ? 'secondary' : 'default'}
          onClick={handleApplyClick}
        >
          {getButtonLabel()}
        </Button>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 safe-area-pb">
        <Button
          className="w-full h-12 text-base font-semibold"
          disabled={isOwner || (isFull && !hasApplied) || isExpired || isMutating}
          variant={hasApplied ? 'outline' : isOwner ? 'secondary' : 'default'}
          onClick={handleApplyClick}
        >
          {getButtonLabel()}
        </Button>
      </div>
    </div>
  )
}
