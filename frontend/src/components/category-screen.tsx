'use client'

import { useState } from 'react'
import { Phone, X, Mic } from 'lucide-react'

import { SAFE_URL, CATEGORIES, EMERGENCY_CONTACTS } from '@/lib/constants'

interface Props {
  onBack: () => void
  onStartChat: (message?: string) => void
  idleSecondsLeft: number
}

export function CategoryScreen({ onBack, onStartChat, idleSecondsLeft }: Props) {
  const [input, setInput] = useState('')

  const handleSelect = (label: string) => {
    onStartChat(label.replace('\n', ''))
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="flex gap-2">
          <a
            href={`${EMERGENCY_CONTACTS.police.tel}`}
            className="flex items-center gap-1.5 bg-[var(--color-danger)] text-white px-3 py-2 rounded-xl text-sm font-bold shadow-sm"
          >
            <Phone size={14} />
            {EMERGENCY_CONTACTS.police.number}
          </a>
          <a
            href={`${EMERGENCY_CONTACTS.oneStopSupport.tel}`}
            className="flex items-center gap-1.5 bg-[var(--color-danger)] text-white px-3 py-2 rounded-xl text-sm font-bold shadow-sm"
          >
            <Phone size={14} />
            {EMERGENCY_CONTACTS.oneStopSupport.number}
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

      {/* Title + idle timer */}
      <div className="text-center px-4 pb-3 flex-shrink-0 relative">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center justify-center gap-2">
          <span>🌿</span>
          よくある相談
          <span>💕</span>
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          気になることを選ぶか、メッセージを入力してください
        </p>
        <div className={`mt-1 flex items-center justify-center gap-1 text-xs font-mono ${idleSecondsLeft <= 60 ? 'text-[var(--color-danger)] font-bold animate-pulse' : 'text-[var(--color-text-muted)]'}`}>
          <span>⏱</span>
          <span>残り {Math.floor(idleSecondsLeft / 60)}分{String(idleSecondsLeft % 60).padStart(2, '0')}秒</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Category cards */}
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map(({ emoji, label }) => (
            <button
              key={label}
              onClick={() => handleSelect(label)}
              className="
                bg-[var(--color-bg-card)] rounded-2xl p-3 shadow-sm
                flex flex-col items-center gap-2
                hover:shadow-md active:scale-95 transition-all duration-100
              "
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center text-2xl">
                {emoji}
              </div>
              <p className="text-[10px] text-[var(--color-text-secondary)] text-center leading-tight whitespace-pre-line">
                {label}
              </p>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <hr className="flex-1 border-[var(--color-border)]" />
          <span className="text-sm text-[var(--color-text-muted)] font-medium">または</span>
          <hr className="flex-1 border-[var(--color-border)]" />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-2xl px-4 py-3 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && input.trim() && onStartChat(input.trim())}
            placeholder="メッセージを入力"
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          <button className="text-[var(--color-accent)]" aria-label="音声入力（未実装）">
            <Mic size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
