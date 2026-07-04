'use client'

import { useState, useRef } from 'react'
import { Phone, X, HeartHandshake } from 'lucide-react'
import { ChecklistModal } from './checklist-modal'
import { CategoryModal } from './category-modal'

const SAFE_URL = 'https://www.google.com/search?q=天気'

interface Props {
  onStartChat: (message?: string) => void
  idleSecondsLeft: number
}

export function WelcomeScreen({ onStartChat, idleSecondsLeft }: Props) {
  const [input, setInput] = useState('')
  const [showChecklist, setShowChecklist] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleStart = (message?: string) => {
    const msg = message ?? input.trim()
    onStartChat(msg || undefined)
  }

  const handleChecklistSubmit = (checkedItems: string[]) => {
    const message =
    'DVチェックリストで以下の項目に当てはまりました:\n\n' +
    checkedItems.map((item) => `・${item}`).join('\n')
    handleStart(message)
  }

  const handleCategorySelect = (label: string) => {
    setShowCategoryModal(false)
    handleStart(label)
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-primary)] overflow-hidden">
      {showChecklist && (
        <ChecklistModal
        onClose={() => setShowChecklist(false)}
        onSubmit={handleChecklistSubmit}
        />
      )}
      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSelect={handleCategorySelect}
        />
      )}
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

      {/* Anonymous badge + idle timer */}
      <div className="flex items-center justify-between px-4 py-1 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-white/70 border border-[var(--color-border)] rounded-full px-3 py-1 text-xs text-[var(--color-text-secondary)] shadow-sm">
          <span>🕵️</span>
          <span className="font-medium">匿名モード</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-mono ${idleSecondsLeft <= 60 ? 'text-[var(--color-danger)] font-bold animate-pulse' : 'text-[var(--color-text-muted)]'}`}>
          <span>⏱</span>
          <span>残り {Math.floor(idleSecondsLeft / 60)}分{String(idleSecondsLeft % 60).padStart(2, '0')}秒</span>
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
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-[var(--color-accent-light)] hover:bg-[var(--color-accent-light)]/70 text-[var(--color-accent-dark)] font-medium"
            >
              <span>📁</span>
              <span>カテゴリーを選ぶ</span>
            </button>
            {/* DVチェックリスト: same chip style */}
            <button
              onClick={() => setShowChecklist(true)}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-[var(--color-accent-light)]/70 text-[var(--color-accent-dark)] font-medium"
            >
              <span>✅</span>
              <span>DVチェックリスト</span>
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
    </div>
  )
}
