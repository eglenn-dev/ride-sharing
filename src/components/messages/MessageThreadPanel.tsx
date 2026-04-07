import { useEffect, useMemo, useRef, useState } from 'react'
import { getMessages, markThreadRead, sendMessage } from '#/lib/messages'
import { usePolling } from '#/lib/use-polling'

type MessageRow = {
  id: string
  body: string
  createdAt: string | Date
  authorId: string
  author: { id: string; name: string }
}

const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

export default function MessageThreadPanel({
  threadId,
  currentUserId,
}: {
  threadId: string
  currentUserId: string
}) {
  const [messages, setMessages] = useState<Array<MessageRow>>([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const lastId = messages.at(-1)?.id

  const fetcher = useMemo(
    () => async (_signal: AbortSignal) => {
      const next = await getMessages({
        data: { threadId, sinceId: lastId },
      })
      return next as Array<MessageRow>
    },
    [threadId, lastId],
  )

  const { data, error: pollError } = usePolling(fetcher, 5000)

  useEffect(() => {
    if (!data || data.length === 0) return
    setMessages((current) => {
      const seen = new Set(current.map((m) => m.id))
      const additions = data.filter((m) => !seen.has(m.id))
      if (additions.length === 0) return current
      return [...current, ...additions]
    })
  }, [data])

  useEffect(() => {
    if (pollError) {
      setError(pollError.message)
    }
  }, [pollError])

  useEffect(() => {
    void markThreadRead({ data: { threadId } })
  }, [threadId, messages.length])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return

    setIsSending(true)
    setError(null)
    try {
      const message = await sendMessage({
        data: { threadId, body: trimmed },
      })
      setMessages((current) => [...current, message as unknown as MessageRow])
      setDraft('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to send message.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="grid gap-3">
      <div
        ref={scrollRef}
        className="h-[60vh] overflow-y-auto rounded-2xl border border-[var(--line)] bg-white/40 p-4"
      >
        {messages.length === 0 ? (
          <p className="m-0 mt-8 text-center text-sm text-[var(--sea-ink-soft)]">
            No messages yet. Say hi!
          </p>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {messages.map((message) => {
              const mine = message.authorId === currentUserId
              return (
                <li
                  key={message.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? 'bg-[rgba(79,184,178,0.22)] text-[var(--sea-ink)]'
                        : 'bg-white/70 text-[var(--sea-ink)]'
                    }`}
                  >
                    {!mine && (
                      <p className="m-0 mb-0.5 text-xs font-semibold text-[var(--sea-ink-soft)]">
                        {message.author.name}
                      </p>
                    )}
                    <p className="m-0 whitespace-pre-wrap">{message.body}</p>
                    <p className="m-0 mt-1 text-right text-[10px] text-[var(--sea-ink-soft)]">
                      {TIME_FORMATTER.format(new Date(message.createdAt))}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-[rgba(183,63,48,0.35)] bg-[rgba(183,63,48,0.08)] p-2 text-sm text-[rgb(138,44,35)]">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={isSending}
          placeholder="Type a message..."
          className="h-10 flex-1 rounded-xl border border-[var(--line)] bg-white/60 px-3 text-sm text-[var(--sea-ink)] outline-none transition focus:border-[rgba(50,143,151,0.5)] disabled:cursor-not-allowed disabled:bg-white/40"
        />
        <button
          type="submit"
          disabled={isSending || draft.trim().length === 0}
          className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.18)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
