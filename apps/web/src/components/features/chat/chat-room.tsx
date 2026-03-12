import { MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useChat } from '@/lib/hooks/use-chat'
import { useAuth } from '@/lib/auth-context'
import { ChatMessageList } from './chat-message-list'
import { ChatInput } from './chat-input'

interface ChatRoomProps {
  meetupId: string
}

export function ChatRoom({ meetupId }: ChatRoomProps) {
  const { user } = useAuth()
  const { messages, isLoading, sendMessage, isSending } = useChat({
    meetupId,
    enabled: true,
  })

  return (
    <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <MessageCircle className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">채팅</h2>
        {messages.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {messages.length}
          </Badge>
        )}
      </div>

      {/* 메시지 목록 */}
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        currentUserId={user?.id}
      />

      {/* 입력 */}
      <ChatInput onSend={sendMessage} isSending={isSending} />
    </div>
  )
}
