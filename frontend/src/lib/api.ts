const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatMessagesParams = {
  message?: string
  category?: string
  quickReply?: string
}

type BackendMessageItem = {
  role: 'user' | 'ai'
  message: string
}

export type ChatMessagesResponse = {
  messages: BackendMessageItem[]
  session_id: string
}

export async function sendChatMessages(
  params: ChatMessagesParams,
  sessionId: string | null,
): Promise<ChatMessagesResponse> {
  const res = await fetch(`${API_BASE}/api/v1/chat/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: params.message ?? '',
      category: params.category,
      quickReply: params.quickReply,
      session_id: sessionId,
    }),
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/health`)
    return res.ok
  } catch {
    return false
  }
}
