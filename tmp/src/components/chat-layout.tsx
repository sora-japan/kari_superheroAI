'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Phone, HeartHandshake, BookOpen } from 'lucide-react'
import { sendMessage, type ChatMessage } from '@/lib/api'

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'こんにちは。ここはあなたが安心して話せる場所です。\nどんなことでも、話せる範囲で教えてください。',
}

export function ChatLayout() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const data = await sendMessage(text, sessionId)
      setSessionId(data.session_id)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '申し訳ありません、接続に問題が発生しました。少し待ってからもう一度お試しください。',
        },
      ])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }, [input, loading, sessionId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter で改行、Enter のみで送信
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)]">
      {/* ヘッダー */}
      <header className="flex-shrink-0 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] px-4 py-3 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center">
              <HeartHandshake size={18} className="text-[var(--color-accent-dark)]" />
            </div>
            <div>
              <h1 className="font-bold text-[var(--color-text-primary)] text-base leading-tight">
                かり
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] leading-tight">
                安心して話せる相談室
              </p>
            </div>
          </div>

          {/* 緊急連絡先ボタン（プレースホルダー） */}
          <div className="flex items-center gap-2">
            <button
              aria-label="緊急相談窓口"
              title="緊急相談窓口"
              className="
                flex items-center gap-1.5 text-xs
                text-[var(--color-accent-dark)] hover:text-[var(--color-accent)]
                bg-[var(--color-accent-light)] hover:bg-[var(--color-accent-light)]/80
                px-3 py-1.5 rounded-full transition-colors
              "
            >
              <Phone size={13} />
              <span className="hidden sm:inline">相談窓口</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインチャットエリア */}
      <main className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <div className="max-w-2xl mx-auto space-y-4 pb-2">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[var(--color-bubble-ai)] rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* 下部：常駐ボタン群 + 入力欄 */}
      <footer className="flex-shrink-0 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] px-4 pt-3 pb-4 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* クイック返信候補（プレースホルダー） */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['話を聴いてほしい', '今、安全です', '助けてほしい'].map((label) => (
              <button
                key={label}
                onClick={() => {
                  setInput(label)
                  textareaRef.current?.focus()
                }}
                className="
                  flex-shrink-0 text-xs
                  border border-[var(--color-border)] hover:border-[var(--color-accent)]
                  text-[var(--color-text-secondary)] hover:text-[var(--color-accent-dark)]
                  bg-transparent hover:bg-[var(--color-accent-light)]
                  px-3 py-1.5 rounded-full transition-colors
                "
              >
                {label}
              </button>
            ))}
          </div>

          {/* テキスト入力 */}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力してください... (Enter で送信)"
              rows={1}
              className="
                flex-1 resize-none
                bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]
                rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)]
                placeholder:text-[var(--color-text-muted)]
                transition-colors max-h-36 leading-relaxed
              "
              style={{
                height: 'auto',
                minHeight: '48px',
              }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 144)}px`
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="送信"
              className="
                flex-shrink-0 w-12 h-12
                bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]
                disabled:bg-[var(--color-border)] disabled:cursor-not-allowed
                text-white rounded-xl shadow-sm
                flex items-center justify-center
                transition-colors duration-150
              "
            >
              <Send size={18} />
            </button>
          </div>

          {/* 注意書き */}
          <p className="text-center text-[10px] text-[var(--color-text-muted)]">
            緊急の場合は
            <a href="tel:110" className="underline mx-1">警察 110</a>
            /
            <a href="tel:119" className="underline mx-1">救急 119</a>
            /
            <a href="tel:#8008" className="underline mx-1">DVホットライン #8008</a>
            へ
          </p>
        </div>
      </footer>

      {/* 右下のQuick Exitのスペース確保 */}
      <div className="h-20" aria-hidden />
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0 mt-auto mb-1 mr-2">
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
      </div>
    </div>
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
