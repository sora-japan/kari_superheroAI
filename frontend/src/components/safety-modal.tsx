'use client'

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ShieldCheck, X } from 'lucide-react'

const STORAGE_KEY = 'kari_safety_acknowledged'

export function SafetyModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // セッションストレージを使用（タブを閉じると消える）
    // localStorageは同デバイスの他の人に見られる可能性があるため避ける
    const acknowledged = sessionStorage.getItem(STORAGE_KEY)
    if (!acknowledged) {
      setOpen(true)
    }
  }, [])

  const handleAcknowledge = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 z-50
            w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2
            bg-[var(--color-bg-card)] rounded-2xl shadow-2xl
            p-6 focus:outline-none
          "
          // Escキーで閉じられないようにする（明示的な確認を求める）
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[var(--color-accent-light)] rounded-full p-2">
              <ShieldCheck size={22} className="text-[var(--color-accent-dark)]" />
            </div>
            <Dialog.Title className="text-lg font-bold text-[var(--color-text-primary)]">
              安全にご利用いただくために
            </Dialog.Title>
          </div>

          <Dialog.Description asChild>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <p>
                このサービスは、あなたのプライバシーを最優先に設計されています。
                以下の点をご確認ください。
              </p>

              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 space-y-3">
                <TipItem
                  icon="🔒"
                  title="シークレットモードの利用をおすすめします"
                  detail="Chrome: Ctrl+Shift+N / Safari: Command+Shift+N"
                />
                <TipItem
                  icon="🗑️"
                  title="通常モードの場合は閲覧履歴を削除できます"
                  detail="Chrome: Ctrl+Shift+Del / Safari: 履歴メニュー→履歴を消去"
                />
                <TipItem
                  icon="🚪"
                  title="画面右上の「すぐ閉じる」ボタン"
                  detail="押すと即座に別のページに移動し、戻れないようにします"
                />
              </div>

              <p className="text-xs text-[var(--color-text-muted)]">
                ※ このダイアログはタブを閉じると再度表示されます
              </p>
            </div>
          </Dialog.Description>

          <button
            onClick={handleAcknowledge}
            className="
              mt-5 w-full
              bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]
              text-white font-bold py-3 rounded-xl
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400
            "
          >
            確認しました、始める
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function TipItem({
  icon,
  title,
  detail,
}: {
  icon: string
  title: string
  detail: string
}) {
  return (
    <div className="flex gap-3">
      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold text-[var(--color-text-primary)] text-sm">{title}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{detail}</p>
      </div>
    </div>
  )
}
