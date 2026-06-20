import { HTTP_STATUS_CODE } from '@/types/http_status_code'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function sendMessage(
  message: string,
  sessionId?: string,
): Promise<{ reply: string; session_id: string }> {
  // const res = await fetch(`${API_BASE}/api/v1/chat`, {
  
  const res = await fetch(`${API_BASE}/api/v1/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (res.status !== HTTP_STATUS_CODE.OK) {
    throw new Error(`API error: ${res.status}`)
  }
  // if (!res.ok) {
  //   throw new Error(`API error: ${res.status}`)
  // }
  if (res?.body?.token) {
    sessionStorage.setItem('token', res?.body?.token);
  }

  const res = await fetch(`${API_BASE}/api/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': `${sessionStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      message,
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
