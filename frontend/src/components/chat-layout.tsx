'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Phone, X, Mic, Send, HeartHandshake, BookOpen } from 'lucide-react'
import { sendMessage, type ChatMessage } from '@/lib/api'
import { getSessionId, storeSessionId } from '@/lib/session'
import { ChecklistModal } from './checklist-modal'


const SAFE_URL = 'https://www.google.com/search?q=天気'
const SESSION_SECONDS = 15 * 60

type DisplayMessage = ChatMessage & {
  timestamp: Date
  read?: boolean
}

const makeInitialMessage = (): DisplayMessage => ({
  role: 'assistant',
  content:
    'こんにちは。ここは、あなたの気持ちに寄り添う場所です。\nどんなことでも、一緒に整理していきましょう。\nまずは、今の状況を教えていただけますか？',
  timestamp: new Date(),
})

interface Props {
  initialMessage?: string
  onOpenCategories: () => void
}

export function ChatLayout({ initialMessage, onOpenCategories }: Props) {
  const [messages, setMessages] = useState<DisplayMessage[]>([makeInitialMessage()])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS)
  const [showChecklist, setShowChecklist] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const initialSentRef = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Session safety timer — auto-exit when time runs out
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.location.replace(SAFE_URL)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Send the message selected on the welcome/category screen
  useEffect(() => {
    if (!initialMessage || initialSentRef.current) return
    initialSentRef.current = true

    const content = initialMessage
    setMessages((prev) => [...prev, { role: 'user', content, timestamp: new Date() }])
    setLoading(true)

    sendMessage(content, getSessionId())
      .then((data) => {
        storeSessionId(data.session_id)
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...prev[prev.length - 1], read: true } as DisplayMessage,
          { role: 'assistant', content: data.reply, timestamp: new Date() },
        ])
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '申し訳ありません、接続に問題が発生しました。少し待ってからもう一度お試しください。',
            timestamp: new Date(),
          },
        ])
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(
    async (overrideText?: string) => {
      const content = overrideText ?? input.trim()
      if (!content || loading) return

      if (!overrideText) setInput('')
      setMessages((prev) => [...prev, { role: 'user', content, timestamp: new Date() }])
      setLoading(true)
      setSecondsLeft(SESSION_SECONDS) // reset timer on activity

      try {
        const data = await sendMessage(content, getSessionId())
        storeSessionId(data.session_id)
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...prev[prev.length - 1], read: true } as DisplayMessage,
          { role: 'assistant', content: data.reply, timestamp: new Date() },
        ])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '申し訳ありません、接続に問題が発生しました。少し待ってからもう一度お試しください。',
            timestamp: new Date(),
          },
        ])
      } finally {
        setLoading(false)
        textareaRef.current?.focus()
      }
    },
    [input, loading],
  )

  const handleChecklistSubmit = (checkedItems: string[]) => {
    const message =
      `DVチェックリストで以下の項目に当てはまりました：\n\n` +
      checkedItems.map((item) => `・${item}`).join('\n')
    handleSend(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const timerMin = Math.floor(secondsLeft / 60)
  const timerSec = secondsLeft % 60
  const timerWarning = secondsLeft <= 60

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)]">
      {showChecklist && (
        <ChecklistModal
          onClose={() => setShowChecklist(false)}
          onSubmit={handleChecklistSubmit}
        />
      )}
      {/* Header - welcome screen と統一 */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]">
        <div className="flex gap-2">
          <a
            href="tel:110"
            className="flex items-center gap-1.5 bg-[var(--color-danger)] text-white px-3 py-2 rounded-xl text-sm font-bold shadow-sm"
          >
            <Phone size={14} />
            110
          </a>
          <a
            href="tel:#8891"
            className="flex items-center gap-1.5 bg-[var(--color-danger)] text-white px-3 py-2 rounded-xl text-sm font-bold shadow-sm"
          >
            <Phone size={14} />
            #8891
          </a>
        </div>
        <button
          onClick={() => window.location.replace(SAFE_URL)}
          className="flex items-center gap-1.5 border-2 border-red-300 text-red-400 bg-red-50 px-3 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-red-100"
        >
          <X size={14} />
          すぐ閉じる
        </button>
      </header>

      {/* Sub-header: anonymous mode + timer */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 bg-white/70 border border-[var(--color-border)] rounded-full px-3 py-1 text-xs text-[var(--color-text-secondary)]">
          <span>🕵️</span>
          <span className="font-medium">匿名モード</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-mono ${
            timerWarning ? 'text-[var(--color-danger)] font-bold animate-pulse' : 'text-[var(--color-text-muted)]'
          }`}
        >
          <span>⏱</span>
          <span>
            残り {timerMin}分{timerSec.toString().padStart(2, '0')}秒
          </span>
        </div>
      </div>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <div className="max-w-2xl mx-auto space-y-3 pb-2">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              onSimplify={() => handleSend('もう少し簡単に説明してもらえますか？')}
            />
          ))}

          {loading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0">
                <HeartHandshake size={14} className="text-[var(--color-accent-dark)]" />
              </div>
              <div className="bg-[var(--color-bubble-ai)] rounded-2xl rounded-tl-sm px-4 py-3">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] px-4 pt-3 pb-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Input row */}
          <div className="flex items-end gap-2">
            <div className="flex-1 flex items-end bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)] rounded-xl transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力してください..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none max-h-36 leading-relaxed"
                style={{ minHeight: '48px', height: 'auto' }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 144)}px`
                }}
              />
              <button className="p-3 text-[var(--color-accent)]" aria-label="音声入力（未実装）">
                <Mic size={18} />
              </button>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="送信"
              className="flex-shrink-0 w-12 h-12 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] disabled:bg-[var(--color-border)] disabled:cursor-not-allowed text-white rounded-xl shadow-sm flex items-center justify-center transition-colors"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <FooterActionButton
              emoji="📁"
              label="カテゴリを選ぶ"
              sub="相談内容から選択"
              onClick={onOpenCategories}
              colorClass="bg-amber-50 border-amber-200 text-amber-800"
            />
            <FooterActionButton
              emoji="✅"
              label="DVチェックリスト"
              sub="状況を確認してみる"
              onClick={() => {setShowChecklist(true);setSecondsLeft(SESSION_SECONDS)}}
              colorClass="bg-teal-50 border-teal-200 text-teal-800"
            />
            <FooterActionButton
              emoji="📍"
              label="相談窓口を探す"
              sub="支援先を見つける"
              onClick={() => {}}
              colorClass="bg-rose-50 border-rose-200 text-rose-800"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}

function MessageBubble({
  message,
  onSimplify,
}: {
  message: DisplayMessage
  onSimplify: () => void
}) {
  const isUser = message.role === 'user'
  const timeStr = message.timestamp.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const isLong = message.content.length > 80

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="w-7 h-7 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0">
            <HeartHandshake size={14} className="text-[var(--color-accent-dark)]" />
          </div>
        )}
        <div
          className={`
            max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${isUser
              ? 'bg-[var(--color-bubble-user)] text-[var(--color-text-primary)] rounded-tr-sm'
              : 'bg-[var(--color-bubble-ai)] text-[var(--color-text-primary)] rounded-tl-sm'
            }
          `}
        >
          {message.content}
          {!isUser && isLong && (
            <button
              onClick={onSimplify}
              className="mt-2 flex items-center gap-1 text-xs text-[var(--color-accent)] border border-[var(--color-accent)]/50 rounded-full px-3 py-1 hover:bg-[var(--color-accent-light)] transition-colors"
            >
              <BookOpen size={11} />
              簡単に言うと？
            </button>
          )}
        </div>
      </div>

      {/* Timestamp + read receipt */}
      <div className={`flex items-center gap-1 mt-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <span className="text-[10px] text-[var(--color-text-muted)]">{timeStr}</span>
        {isUser && message.read && (
          <span className="text-[10px] text-blue-400">✓✓</span>
        )}
      </div>
    </div>
  )
}

function FooterActionButton({
  emoji,
  label,
  sub,
  onClick,
  colorClass,
}: {
  emoji: string
  label: string
  sub: string
  onClick: () => void
  colorClass: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 border rounded-xl px-2 py-2 text-left transition-opacity hover:opacity-75 ${colorClass}`}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-sm leading-none">{emoji}</span>
        <span className="text-[11px] font-bold leading-tight">{label}</span>
      </div>
      <p className="text-[9px] opacity-60 leading-tight pl-5">{sub}</p>
    </button>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}
