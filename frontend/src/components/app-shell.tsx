'use client'

import { useEffect } from 'react'
import { ChatLayout } from '@/components/chat-layout'
import { safeExit } from '@/lib/safe-exit'

export function AppShell() {
  // BFCache（特にSafari）対策の保険。
  // 「戻る／進む」でこのページがキャッシュから復元された場合、
  // e.persisted が true になる。想定外に会話画面が復活するのを防ぐため、
  // その瞬間に安全なページへ脱出する。
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) safeExit()
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  return (
    <div className="h-full flex flex-col">
      <ChatLayout />
    </div>
  )
}
