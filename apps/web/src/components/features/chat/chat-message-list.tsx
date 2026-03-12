import { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ChatMessage } from '@/lib/types/chat'

interface ChatMessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
  currentUserId: string | undefined
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

/** 같은 날짜인지 확인 */
function isSameDay(a: string, b: string) {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

export function ChatMessageList({
  messages,
  isLoading,
  currentUserId,
}: ChatMessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)

  const handleScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    const threshold = 50
    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }

  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        메시지를 불러오는 중...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        아직 메시지가 없어요. 첫 메시지를 보내보세요!
      </div>
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="max-h-80 overflow-y-auto p-4 space-y-3"
    >
      {messages.map((msg, idx) => {
        const isMe = msg.user_id === currentUserId
        const showDateSep =
          idx === 0 || !isSameDay(messages[idx - 1].created_at, msg.created_at)

        return (
          <div key={msg.id}>
            {/* 날짜 구분선 */}
            {showDateSep && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatDateSeparator(msg.created_at)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            {isMe ? (
              /* 내 메시지 */
              <div className="flex justify-end">
                <div className="max-w-[75%] text-right">
                  <div className="inline-block rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-3 py-2 text-sm text-left">
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ) : (
              /* 상대 메시지 */
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  {msg.sender_profile?.avatar_url && (
                    <AvatarImage
                      src={msg.sender_profile.avatar_url}
                      alt={msg.sender_profile.nickname ?? ''}
                    />
                  )}
                  <AvatarFallback className="text-xs bg-muted">
                    {msg.sender_profile?.nickname?.[0] ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[75%]">
                  <p className="text-xs text-muted-foreground mb-1">
                    {msg.sender_profile?.nickname ?? '알 수 없음'}
                  </p>
                  <div className="inline-block rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
