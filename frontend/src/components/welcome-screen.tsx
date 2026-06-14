'use client'

import { useState, useRef } from 'react'
import { Phone, X, Mic, Shield, HeartHandshake } from 'lucide-react'

const SAFE_URL = 'https://www.google.com/search?q=天気'

const QUICK_CHIPS = [
  { icon: '🏃', label: '今すぐ逃げたい' },
  { icon: '💬', label: '話を聴いてほしい' },
  { icon: '📋', label: '証拠の残し方を知りたい' },
]

interface Props {
  onOpenCategories: () => void
  onStartChat: (message?: string) => void
}

export function WelcomeScreen({ onOpenCategories, onStartChat }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleStart = (message?: string) => {
    const msg = message ?? input.trim()
    onStartChat(msg || undefined)
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)]">
      {/* Anonymous badge */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="flex items-center gap-1.5 bg-white/70 border border-[var(--color-border)] rounded-full px-3 py-1 text-xs text-[var(--color-text-secondary)] shadow-sm">
          <span>🕵️</span>
          <span className="font-medium">匿名モード</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        </div>
      </div>

      {/* Top bar: phone buttons + quick exit */}
      <div className="flex items-center justify-between px-4 py-2">
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
          クイック退出
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-4">
        {/* Character placeholder */}
        <div className="w-44 h-44 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center shadow-sm">
          <HeartHandshake size={80} className="text-[var(--color-accent)]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] leading-snug">
            何かお困りごとは<br />ありますか？
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            あなたの気持ちに寄り添い、<br />一緒に解決方法を考えます。
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            この会話は誰にも知られません。🔒
          </p>
        </div>
      </main>

      {/* Bottom: input + chips + footer */}
      <footer className="px-4 pb-6 space-y-3">
        {/* Input */}
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

        {/* Quick chips */}
        <div className="flex gap-2 flex-wrap justify-center">
          {QUICK_CHIPS.map(({ icon, label }) => (
            <button
              key={label}
              onClick={() => handleStart(label)}
              className="flex items-center gap-1.5 bg-[var(--color-accent-light)] hover:bg-[var(--color-accent-light)]/70 text-[var(--color-accent-dark)] text-sm px-4 py-2 rounded-full transition-colors font-medium"
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1">
          <Shield size={11} />
          専門の相談員と連携し、あなたの安全をサポートします。
        </p>
      </footer>
    </div>
  )
}
