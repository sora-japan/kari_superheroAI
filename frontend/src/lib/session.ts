const SESSION_ID_KEY = 'kari_session_id'

export function getSessionId(): string | null {
  return sessionStorage.getItem(SESSION_ID_KEY)
}

export function storeSessionId(id: string): void {
  sessionStorage.setItem(SESSION_ID_KEY, id)
}
