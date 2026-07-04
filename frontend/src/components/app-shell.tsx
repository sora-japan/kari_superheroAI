'use client'

import { useEffect } from 'react'
import { ChatLayout } from '@/components/chat-layout'

export function AppShell() {
  // Prevent back-navigation to reveal this site
  useEffect(() => {
    history.pushState(null, '', window.location.href)
    const handlePopState = () => history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="h-full flex flex-col">
      <ChatLayout />
    </div>
  )
}
