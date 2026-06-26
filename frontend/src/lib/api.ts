const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function sendMessage(
  message: string,
  sessionId: string | null,
): Promise<{ reply: string; session_id: string }> {
  const res = await fetch(`${API_BASE}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
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
