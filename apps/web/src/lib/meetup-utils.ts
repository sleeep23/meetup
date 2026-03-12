import type { Meetup } from '@/lib/types/meetup'

export type MeetupStatus = 'open' | 'urgent' | 'full' | 'expired'

export function getMeetupStatus(meetup: Meetup): MeetupStatus {
  const deadlineDate = new Date(meetup.deadline)
  const isExpired = deadlineDate < new Date()
  const isFull = meetup.application_count >= meetup.max_participants
  const isUrgent =
    !isExpired &&
    !isFull &&
    deadlineDate.getTime() - Date.now() < 1000 * 60 * 60 * 24

  if (isExpired) return 'expired'
  if (isFull) return 'full'
  if (isUrgent) return 'urgent'
  return 'open'
}

export function getStatusBadgeProps(status: MeetupStatus) {
  const map = {
    open: { variant: 'status-open' as const, label: '모집중' },
    urgent: { variant: 'status-urgent' as const, label: '마감임박' },
    full: { variant: 'status-closed' as const, label: '정원 마감' },
    expired: { variant: 'status-closed' as const, label: '마감됨' },
  }
  return map[status]
}

export function formatTimeLeft(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return '마감됨'

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) return `${days}일 남음`
  if (hours > 0) return `${hours}시간 남음`
  return `${minutes}분 남음`
}
