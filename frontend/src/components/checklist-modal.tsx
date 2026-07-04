'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const CHECKLIST_CATEGORIES = [
  {
    title: '身体的なもの',
    description: '殴ったり蹴ったりするなど、直接何らかの有形力を行使するもの。刑法第204条の傷害や第208条の暴行に該当する違法な行為であり、たとえそれが配偶者間で行われたとしても処罰の対象になります。',
    items: [
      '平手でうつ',
      '足でける',
      '身体を傷つける可能性のある物でなぐる',
      'げんこつでなぐる',
      '刃物などの凶器をからだにつきつける',
      '髪をひっぱる',
      '首をしめる',
      '腕をねじる',
      '引きずりまわす',
      '物をなげつける',
    ],
  },
  {
    title: '精神的なもの',
    description: '心無い言動等により、相手の心を傷つけるもの。精神的な暴力については、その結果、PTSD（心的外傷後ストレス障害）に至るなど、刑法上の傷害とみなされるほどの精神障害に至れば、刑法上の傷害罪として処罰されることもあります。',
    items: [
      '大声でどなる',
      '「誰のおかげで生活できるんだ」「かいしょうなし」などと言う',
      '実家や友人とつきあうのを制限したり、電話や手紙を細かくチェックしたりする',
      '何を言っても無視して口をきかない',
      '人の前でバカにしたり、命令するような口調でものを言ったりする',
      '大切にしているものをこわしたり、捨てたりする',
      '生活費を渡さない',
      '外で働くなと言ったり、仕事を辞めさせたりする',
      '子どもに危害を加えるといっておどす',
      'なぐるそぶりや、物をなげつけるふりをして、おどかす',
    ],
  },
  {
    title: '性的なもの',
    description: '嫌がっているのに性的行為を強要する、中絶を強要する、避妊に協力しないといったもの。夫婦間の性交であっても、刑法第177条の不同意性交等罪に当たる場合があります。',
    items: [
      '見たくないのにポルノビデオやポルノ雑誌をみせる',
      'いやがっているのに性行為を強要する',
      '中絶を強要する',
      '避妊に協力しない',
    ],
  },
]

interface Props {
  onClose: () => void
  onSubmit: (checkedItems: string[]) => void
}

export function ChecklistModal({ onClose, onSubmit }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [isClosing, setIsClosing] = useState(false)

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onClose(), 400)
  }

  const handleSubmit = () => {
    const checkedItems: string[] = []
    CHECKLIST_CATEGORIES.forEach((cat, ci) => {
      cat.items.forEach((item, ii) => {
        if (checked.has(`${ci}-${ii}`)) checkedItems.push(item)
      })
    })
    onSubmit(checkedItems)
    handleClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isClosing ? 'animate-[fadeOut_1s_ease]' : 'animate-[fadeIn_1s_ease]'}`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-lg bg-white rounded-2xl max-h-[85vh] flex flex-col ${isClosing ? 'animate-[slideDown_1s_ease]' : 'animate-[slideUp_1s_ease]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">✅ DVチェックリスト</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              当てはまると思うものにチェックをつけてください
            </p>
          </div>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Checklist */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
          {CHECKLIST_CATEGORIES.map((cat, ci) => (
            <div key={ci}>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">・{cat.title}</h3>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed mb-3">{cat.description}</p>
              <div className="space-y-3">
                {cat.items.map((item, ii) => {
                  const key = `${ci}-${ii}`
                  return (
                    <label key={key} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked.has(key)}
                        onChange={() => toggle(key)}
                        className="mt-0.5 w-4 h-4 accent-[var(--color-accent)] flex-shrink-0 cursor-pointer"
                      />
                      <span
                        className={`text-sm leading-relaxed transition-colors ${
                          checked.has(key)
                            ? 'text-[var(--color-text-primary)] font-bold'
                            : 'text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {item}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Reference */}
        <div className="px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
            参考：
            <a
              href="https://www.gender.go.jp/policy/no_violence/e-vaw/dv/02.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--color-accent)] mx-0.5"
            >
              男女共同参画局
            </a>
          </p>
        </div>

        {/* Submit */}
        <div className="px-4 py-3 border-t border-[var(--color-border)]">
          <button
            onClick={handleSubmit}
            disabled={checked.size === 0}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] disabled:bg-[var(--color-border)] disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {checked.size === 0 ? 'チェックしてから送信してください' : `チェックした ${checked.size} 件を相談する`}
          </button>
        </div>
      </div>
    </div>
  )
}
