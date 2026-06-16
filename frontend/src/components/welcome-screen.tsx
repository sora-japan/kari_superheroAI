'use client'

import { useState, useRef } from 'react'
import { Phone, X, Mic, HeartHandshake } from 'lucide-react'

const SAFE_URL = 'https://www.google.com/search?q=天気'

const CATEGORIES: { emoji: string; label: string; comingSoon?: boolean }[] = [
  { emoji: '💰', label: '生活費を\n渡してもらえない' },
  { emoji: '📱', label: 'スマホを\nチェックされる' },
  { emoji: '😡', label: '怒鳴られることが\n多い' },
  { emoji: '🚪', label: '外出を\n制限される' },
  { emoji: '❓', label: 'これって\nDV？' },
  { emoji: '🆘', label: '今すぐ\n逃げたい' },
  { emoji: '📸', label: '証拠の\n残し方', comingSoon: true },
  { emoji: '👧', label: '子どもへの\n影響' },
]

interface Props {
  onOpenCategories: () => void
  onStartChat: (message?: string) => void
}

export function WelcomeScreen({ onOpenCategories, onStartChat }: Props) {
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
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)]">
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

      {/* Scrollable main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Character + title */}
        <div className="flex flex-col items-center text-center px-6 pt-4 pb-3">
          <div className="w-28 h-28 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center shadow-sm">
            <HeartHandshake size={60} className="text-[var(--color-accent)]" />
          </div>
          <div className="mt-3 space-y-1">
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
        </div>

        {/* Input */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-2xl px-4 py-3 shadow-sm">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              placeholder="メッセージを入力"
              className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
            />
            <button className="text-[var(--color-accent)]" aria-label="音声入力（未実装）">
              <Mic size={20} />
            </button>
          </div>
        </div>

        {/* よくある相談 */}
        <div className="px-4 pb-4">
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
            <span>🌿</span>よくある相談
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(({ emoji, label, comingSoon }) => (
              <button
                key={label}
                onClick={() => comingSoon ? handleComingSoon() : handleStart(label.replace('\n', ''))}
                className="
                  bg-[var(--color-bg-card)] rounded-2xl p-2 shadow-sm
                  flex flex-col items-center gap-1.5 relative
                  hover:shadow-md active:scale-95 transition-all duration-100
                "
              >
                {comingSoon && (
                  <span className="absolute top-1 right-1 text-[8px] bg-amber-100 text-amber-700 px-1 rounded leading-tight">
                    予定
                  </span>
                )}
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center text-xl">
                  {emoji}
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)] text-center leading-tight whitespace-pre-line">
                  {label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={onOpenCategories}
            className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-75"
          >
            <span>📁</span>
            カテゴリを選ぶ
          </button>
          <button
            onClick={handleComingSoon}
            className="flex-1 flex items-center justify-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-75"
          >
            <span>✅</span>
            DVチェックリスト
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-8 text-center">
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
