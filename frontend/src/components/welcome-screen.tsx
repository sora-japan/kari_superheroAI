'use client'

import { useState, useRef } from 'react'
import { Phone, X, HeartHandshake } from 'lucide-react'

const SAFE_URL = 'https://www.google.com/search?q=天気'

const CATEGORIES: { emoji: string; label: string; comingSoon?: boolean }[] = [
  { emoji: '💬', label: '生活費を渡してもらえない' },
  { emoji: '📲', label: 'スマホをチェックされる' },
  { emoji: '😔', label: '怒鳴られることが多い' },
  { emoji: '🏠', label: '外出を制限される' },
  { emoji: '❓', label: 'これってDV？' },
  { emoji: '🏃', label: '今すぐ逃げたい' },
  { emoji: '📝', label: '証拠の残し方', comingSoon: true },
  { emoji: '👶', label: '子どもへの影響' },
]

interface Props {
  onOpenCategories: () => void
  onStartChat: (message?: string) => void
}

export function WelcomeScreen({ onOpenCategories: _onOpenCategories, onStartChat }: Props) {
  const [input, setInput] = useState('')
  const [showComingSoon, setShowComingSoon] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleStart = (message?: string) => {
    const msg = message ?? input.trim()
    onStartChat(msg || undefined)
  }

  const handleComingSoon = () => {
    setShowComingSoon(true)
    setTimeout(() => setShowComingSoon(false), 2500)
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
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
      </div>

      {/* Anonymous badge */}
      <div className="flex justify-center py-1 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-white/70 border border-[var(--color-border)] rounded-full px-3 py-1 text-xs text-[var(--color-text-secondary)] shadow-sm">
          <span>🕵️</span>
          <span className="font-medium">匿名モード</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        </div>
      </div>

      {/* 2-pane layout */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top pane (55%): character + title + input centered */}
        <div className="h-[55%] flex flex-col items-center justify-center text-center px-6 gap-3 overflow-hidden">
          <div className="w-24 h-24 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center shadow-sm flex-shrink-0">
            <HeartHandshake size={50} className="text-[var(--color-accent)]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] leading-snug">
              何かお困りごとは<br />ありますか？
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              あなたの気持ちに寄り添い、<br />一緒に解決方法を考えます。
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              この会話は誰にも知られません。🔒
            </p>
          </div>
          {/* Input: fixed width, no mic */}
          <div className="w-full max-w-[320px]">
            <div className="flex items-center bg-white border border-[var(--color-border)] rounded-2xl px-4 py-3 shadow-sm">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="メッセージを入力"
                className="w-full bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom pane: よくある相談 scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
            <span>🌿</span>よくある相談
          </h2>
          <div className="flex gap-2 flex-wrap justify-center">
            {CATEGORIES.map(({ emoji, label, comingSoon }) => (
              <button
                key={label}
                onClick={() => comingSoon ? handleComingSoon() : handleStart(label)}
                className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full transition-colors font-medium ${
                  comingSoon
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-[var(--color-accent-light)] hover:bg-[var(--color-accent-light)]/70 text-[var(--color-accent-dark)]'
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
                {comingSoon && (
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded">予定</span>
                )}
              </button>
            ))}
            {/* DVチェックリスト: same gray chip style */}
            <button
              onClick={handleComingSoon}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-gray-100 text-gray-400 font-medium"
            >
              <span>✅</span>
              <span>DVチェックリスト</span>
              <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded">予定</span>
            </button>
          </div>
        </div>

        {/* 個人情報リンク: 最下部に固定 */}
        <div className="flex-shrink-0 py-3 text-center border-t border-[var(--color-border)]">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-xs text-[var(--color-text-muted)] underline underline-offset-2"
          >
            個人情報取扱に係る利用目的
          </a>
        </div>

      </div>

      {/* Coming soon toast */}
      {showComingSoon && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm shadow-lg text-[var(--color-text-secondary)] whitespace-nowrap z-50">
          この機能は現在実装予定です
        </div>
      )}
    </div>
  )
}
