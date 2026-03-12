import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatInputProps {
  onSend: (content: string) => void
  isSending: boolean
}

export function ChatInput({ onSend, isSending }: ChatInputProps) {
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return

    onSend(trimmed)
    setContent('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t border-border"
    >
      <Input
        placeholder="메시지를 입력하세요..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        disabled={isSending}
        className="flex-1"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!content.trim() || isSending}
      >
        <Send className="size-4" />
      </Button>
    </form>
  )
}
