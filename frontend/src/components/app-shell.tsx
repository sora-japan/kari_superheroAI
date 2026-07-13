'use client'

import { useState, useEffect } from 'react'
import { SafetyModal } from '@/components/safety-modal'
import { WelcomeScreen } from '@/components/welcome-screen'
import { CategoryScreen } from '@/components/category-screen'
import { ChatLayout } from '@/components/chat-layout'
import { safeExit } from '@/lib/safe-exit'

const PRE_CHAT_IDLE_SECONDS = 15 * 60

type Screen = 'welcome' | 'category' | 'chat'

export function AppShell() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [initialMessage, setInitialMessage] = useState<string | undefined>()
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(PRE_CHAT_IDLE_SECONDS)

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

  // Inactivity countdown on pre-chat screens
  useEffect(() => {
    if (screen === 'chat') return

    setIdleSecondsLeft(PRE_CHAT_IDLE_SECONDS)

    const interval = setInterval(() => {
      setIdleSecondsLeft((prev) => {
        if (prev <= 1) {
          safeExit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [screen])

  const goToChat = (message?: string) => {
    setInitialMessage(message)
    setScreen('chat')
  }

  return (
    <div className="h-full flex flex-col">
      <SafetyModal idleSecondsLeft={idleSecondsLeft} />
      {screen === 'welcome' && (
        <WelcomeScreen
          onOpenCategories={() => setScreen('category')}
          onStartChat={goToChat}
          idleSecondsLeft={idleSecondsLeft}
        />
      )}
      {screen === 'category' && (
        <CategoryScreen
          onBack={() => setScreen('welcome')}
          onStartChat={goToChat}
          idleSecondsLeft={idleSecondsLeft}
        />
      )}
      {screen === 'chat' && (
        <ChatLayout
          initialMessage={initialMessage}
          onOpenCategories={() => setScreen('category')}
        />
      )}
    </div>
  )
}
