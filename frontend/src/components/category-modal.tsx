'use client'

import { X } from 'lucide-react'

const CATEGORIES = [
  { emoji: '💰', label: '生活費を\n渡してもらえない' },
  { emoji: '📱', label: 'スマホを\nチェックされる' },
  { emoji: '😡', label: '怒鳴られることが\n多い' },
  { emoji: '🚪', label: '外出を\n制限される' },
  { emoji: '❓', label: 'これって\nDV？' },
  { emoji: '🆘', label: '今すぐ\n逃げたい' },
  { emoji: '📸', label: '証拠の\n残し方' },
  { emoji: '👧', label: '子どもへの\n影響' },
]

interface Props {
  onClose: () => void
  onSelect: (label: string) => void
}

export function CategoryModal({ onClose, onSelect }: Props) {
  const handleSelect = (label: string) => {
    onSelect(label.replace('\n', ''))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-[fadeIn_1s_ease]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl max-h-[85vh] flex flex-col animate-[slideUp_1s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">📁 カテゴリーを選ぶ</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              気になることを選んでください
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Category grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
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
        </div>
      </div>
    </div>
  )
}
