

// クイックExit実行時の移行先URL
export const SAFE_URL = 'https://www.google.com/search?q=天気';

// クイックExitを実行するまでの時間（秒）
export const QUICK_EXIT_SECONDS = 15 * 60;

// カテゴリ画面の選択肢
export const CATEGORIES = [
  { emoji: '💰', label: '生活費を\n渡してもらえない' },
  { emoji: '📱', label: 'スマホを\nチェックされる' },
  { emoji: '😡', label: '怒鳴られることが\n多い' },
  { emoji: '🚪', label: '外出を\n制限される' },
  { emoji: '❓', label: 'これって\nDV？' },
  { emoji: '🆘', label: '今すぐ\n逃げたい' },
  { emoji: '📸', label: '証拠の\n残し方' },
  { emoji: '👧', label: '子どもへの\n影響' },
]

// 緊急電話 object型
export const EMERGENCY_CONTACTS = {
    police: { label: '警察', number: '110', tel: 'tel:110' },
    oneStopSupport: { label: 'ワンストップ支援センター', number: '#8891', tel: 'tel:#8891' },
}

// 利用規約同意済みかどうかの localStorage key
export const STORAGE_KEY = 'kari_safety_acknowledged'
