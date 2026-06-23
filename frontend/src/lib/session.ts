// localStorageは同デバイスの他の人に見られる可能性があるため避け、sessionStorageを使う
const SESSION_ID_KEY = 'kari_session_id'

export function getOrCreateSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_ID_KEY)
  if (existing)
    return existing

  const newId = crypto.randomUUID()
  sessionStorage.setItem(SESSION_ID_KEY, newId)
  return newId
}
