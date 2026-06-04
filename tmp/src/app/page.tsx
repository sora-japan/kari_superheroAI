import { ChatLayout } from '@/components/chat-layout'
import { QuickExit } from '@/components/quick-exit'
import { SafetyModal } from '@/components/safety-modal'

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <SafetyModal />
      <ChatLayout />
      <QuickExit />
    </div>
  )
}
