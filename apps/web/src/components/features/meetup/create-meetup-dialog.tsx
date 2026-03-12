import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import { LocationPicker, type LocationPickerValue } from '@/components/ui/map'
import { createMeetup } from '@/lib/api/meetups'
import { createMeetupSchema } from '@/lib/schemas/meetup'

interface CreateMeetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateMeetupDialog({
  open,
  onOpenChange,
}: CreateMeetupDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(4)
  const [deadline, setDeadline] = useState('')
  const [location, setLocation] = useState<LocationPickerValue | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: createMeetup,
    onSuccess: () => {
      toast.success('모임이 만들어졌어요!')
      queryClient.invalidateQueries({ queryKey: ['meetups'] })
      resetForm()
      onOpenChange(false)
    },
  })

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setMaxParticipants(4)
    setDeadline('')
    setLocation(null)
    setValidationError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Zod 유효성 검사
    const result = createMeetupSchema.safeParse({
      title: title.trim(),
      description: description.trim() || undefined,
      maxParticipants,
      deadline: deadline ? new Date(deadline).toISOString() : '',
      location: location || undefined,
    })

    if (!result.success) {
      const firstError = result.error.errors[0]
      setValidationError(firstError?.message ?? '입력값을 확인해주세요')
      return
    }

    mutation.mutate(result.data)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm()
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 모임 만들기</DialogTitle>
          <DialogDescription>모임 정보를 입력해주세요</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              placeholder="모임 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택)</Label>
            <Textarea
              id="description"
              placeholder="간단한 설명을 추가해보세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* 장소 선택 */}
          <LocationPicker value={location} onChange={setLocation} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">최대 인원</Label>
              <Input
                id="maxParticipants"
                type="number"
                min={2}
                max={50}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">모집 마감일</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          {(validationError || mutation.error) && (
            <p className="text-sm text-destructive">
              {validationError || mutation.error?.message || '오류가 발생했습니다'}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || !title.trim()}
            >
              {mutation.isPending ? '생성 중...' : '모임 만들기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
