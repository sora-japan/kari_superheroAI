import { SAFE_URL } from '@/lib/constants'

// 「すぐ閉じる」や自動タイムアウト時に呼ぶ共通の脱出処理。
//
// location.replace は「今いる履歴エントリを上書き」するため、
// 遷移後にブラウザの「戻る」を押してもこのアプリには戻れない。
// （app-shell 側で余計な履歴エントリを積まないことが前提。
//   pushState でエントリを増やすと、それが残って戻れてしまうので注意）
export function safeExit(): void {
  window.location.replace(SAFE_URL)
}
