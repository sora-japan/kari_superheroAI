'use client'

import { useState, useEffect } from 'react'
import { SafetyModal } from '@/components/safety-modal'
import { WelcomeScreen } from '@/components/welcome-screen'
import { CategoryScreen } from '@/components/category-screen'
import { ChatLayout } from '@/components/chat-layout'

type Screen = 'welcome' | 'category' | 'chat'

export function AppShell() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [initialMessage, setInitialMessage] = useState<string | undefined>()

  // Prevent back-navigation to reveal this site
  useEffect(() => {
    history.pushState(null, '', window.location.href)
    const handlePopState = () => history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const goToChat = (message?: string) => {
    setInitialMessage(message)
    setScreen('chat')
  }

  return (
    <div className="h-full flex flex-col">
      <SafetyModal />
      {screen === 'welcome' && (
        <WelcomeScreen
          onOpenCategories={() => setScreen('category')}
          onStartChat={goToChat}
        />
      )}
      {screen === 'category' && (
        <CategoryScreen
          onBack={() => setScreen('welcome')}
          onStartChat={goToChat}
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
