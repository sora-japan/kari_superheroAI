'use client'

import { useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { SAFE_URL } from '@/lib/constants'

export function QuickExit() {
  useEffect(() => {
    // ページロード時にダミー履歴エントリを追加。
    // これによりブラウザの「戻る」を押しても同ページに留まり、
    // セッション中に誤って前のページへ戻ることを防ぐ。
    history.pushState(null, '', window.location.href)

    const handlePopState = () => {
      // ユーザーが「戻る」を押したら再度同ページをプッシュして留まらせる
      history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleExit = () => {
    // location.replace は現在の履歴エントリを上書きするため、
    // 遷移後に「戻る」を押してもこのサイトには戻れない
    window.location.replace(SAFE_URL)
  }

  return (
    <button
      onClick={handleExit}
      aria-label="すぐにこのページを閉じる"
      className="
        fixed bottom-6 right-6 z-50
        flex items-center gap-2
        bg-[var(--color-danger)] hover:bg-[var(--color-danger-dark)]
        text-white font-bold text-sm
        px-4 py-3 rounded-full shadow-lg
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400
      "
    >
      <LogOut size={16} />
      すぐ閉じる
    </button>
  )
}
