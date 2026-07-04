'use client'

import { useState, useEffect } from 'react'
import { SafetyModal } from '@/components/safety-modal'
import { WelcomeScreen } from '@/components/welcome-screen'
import { ChatLayout } from '@/components/chat-layout'

const SAFE_URL = 'https://www.google.com/search?q=天気'
const PRE_CHAT_IDLE_SECONDS = 15 * 60

type Screen = 'welcome' | 'chat'

export function AppShell() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [initialMessage, setInitialMessage] = useState<string | undefined>()
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(PRE_CHAT_IDLE_SECONDS)

  // Prevent back-navigation to reveal this site
  useEffect(() => {
    history.pushState(null, '', window.location.href)
    const handlePopState = () => history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Inactivity countdown on pre-chat screens
  useEffect(() => {
    if (screen === 'chat') return

    setIdleSecondsLeft(PRE_CHAT_IDLE_SECONDS)

    const interval = setInterval(() => {
      setIdleSecondsLeft((prev) => {
        if (prev <= 1) {
          window.location.replace(SAFE_URL)
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
          onStartChat={goToChat}
          idleSecondsLeft={idleSecondsLeft}
        />
      )}
      {screen === 'chat' && (
        <ChatLayout initialMessage={initialMessage} />
      )}
    </div>
  )
}
