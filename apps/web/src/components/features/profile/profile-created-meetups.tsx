import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Calendar, Pencil, Beer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateMeetup, deleteMeetup } from '@/lib/api/meetups'
import { getMeetupStatus, getStatusBadgeProps } from '@/lib/meetup-utils'
import type { Meetup } from '@/lib/types/meetup'

interface ProfileCreatedMeetupsProps {
  meetups: Meetup[]
}

export function ProfileCreatedMeetups({ meetups }: ProfileCreatedMeetupsProps) {
  const [editingMeetup, setEditingMeetup] = useState<Meetup | null>(null)

  if (meetups.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 space-y-3">
        <div className="rounded-full bg-muted p-4">
          <Beer className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">아직 만든 모임이 없어요</p>
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
        {meetups.map((meetup) => (
          <MeetupListItem
            key={meetup.id}
            meetup={meetup}
            onEdit={() => setEditingMeetup(meetup)}
          />
        ))}
      </div>

      {editingMeetup && (
        <EditMeetupDialog
          meetup={editingMeetup}
          open={!!editingMeetup}
          onOpenChange={(open) => !open && setEditingMeetup(null)}
        />
      )}
    </section>
  )
}

function MeetupListItem({
  meetup,
  onEdit,
}: {
  meetup: Meetup
  onEdit: () => void
}) {
  const deadlineDate = new Date(meetup.deadline)
  const status = getMeetupStatus(meetup)
  const { variant: badgeVariant, label: badgeLabel } = getStatusBadgeProps(status)

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 px-4 rounded-xl border border-border hover:border-primary/20 hover:bg-accent/50 transition-all">
      <Link
        to="/meetups/$meetupId"
        params={{ meetupId: meetup.id }}
        className="flex-1 min-w-0"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
            {badgeLabel}
          </Badge>
          <span className="text-sm font-medium truncate">{meetup.title}</span>
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
      </Link>
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.preventDefault()
          onEdit()
        }}
      >
        <Pencil className="size-3.5" />
      </Button>
    </div>
  )
}

function EditMeetupDialog({
  meetup,
  open,
  onOpenChange,
}: {
  meetup: Meetup
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(meetup.title)
  const [description, setDescription] = useState(meetup.description ?? '')
  const [maxParticipants, setMaxParticipants] = useState(meetup.max_participants)
  const [deadline, setDeadline] = useState(
    new Date(meetup.deadline).toISOString().slice(0, 16),
  )

  const updateMutation = useMutation({
    mutationFn: () =>
      updateMeetup(meetup.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        maxParticipants,
        deadline: new Date(deadline).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCreatedMeetups'] })
      queryClient.invalidateQueries({ queryKey: ['meetups'] })
      queryClient.invalidateQueries({ queryKey: ['meetup', meetup.id] })
      onOpenChange(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteMeetup(meetup.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCreatedMeetups'] })
      queryClient.invalidateQueries({ queryKey: ['meetups'] })
      onOpenChange(false)
    },
  })

  const handleDelete = () => {
    if (
      window.confirm(
        '정말 이 모임을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      )
    ) {
      deleteMutation.mutate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>모임 수정</DialogTitle>
          <DialogDescription>모임 정보를 수정해주세요</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateMutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-title">제목</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">설명 (선택)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-maxParticipants">최대 인원</Label>
              <Input
                id="edit-maxParticipants"
                type="number"
                min={2}
                max={50}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">모집 마감일</Label>
              <Input
                id="edit-deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          {(updateMutation.error || deleteMutation.error) && (
            <p className="text-sm text-destructive">
              {updateMutation.error?.message ||
                deleteMutation.error?.message ||
                '오류가 발생했습니다'}
            </p>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="sm:mr-auto"
            >
              {deleteMutation.isPending ? '삭제 중...' : '모임 삭제'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !title.trim()}
            >
              {updateMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
