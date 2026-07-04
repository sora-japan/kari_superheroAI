[← parta.md に戻る](parta.md)

# ブラウザAPI 知識まとめ

このプロジェクトで使われているブラウザの標準機能（Web API）をまとめる。
JavaScriptに最初から組み込まれており、インポート不要で使える。

---

## History API（戻るボタン制御）

### 使用箇所
`app-shell.tsx`・`quick-exit.tsx`

### pushState

```tsx
history.pushState(null, '', window.location.href)
```

- ブラウザの「戻る」履歴に現在のURLを追加する
- ユーザーが「←（戻る）」を押したとき、追加したURLに戻ろうとする
- このアプリでは「戻れない状態」を作るために使う

### popstate イベント

```tsx
const handlePopState = () => history.pushState(null, '', window.location.href)
window.addEventListener('popstate', handlePopState)
```

- ブラウザの「戻る」「進む」ボタンが押されたときに発火するイベント
- 「戻る」を押されたら再び同じURLを追加して、同じページに留まらせる
- 結果として「戻るボタンが効かない」状態になる

### なぜ使うのか

DV相談サービスなので、加害者が「戻る」を押してサイトの存在を発見できないようにするための安全対策。

### イベントの後片付け

```tsx
return () => window.removeEventListener('popstate', handlePopState)
```

`useEffect` の return に書く「後片付け」。
コンポーネントが消えるとき、イベントの監視を止める（メモリリーク防止）。

---

## sessionStorage（一時データ保存）

### 使用箇所
`safety-modal.tsx`

```tsx
// 値を保存する
sessionStorage.setItem('kari_safety_acknowledged', '1')

// 値を取り出す
const acknowledged = sessionStorage.getItem('kari_safety_acknowledged')
// → 保存されていれば '1'、まだ保存されていなければ null
```

### localStorage との違い（重要）

| | sessionStorage | localStorage |
|---|---|---|
| データが消えるタイミング | タブを閉じると消える | ブラウザを閉じても残る |
| 用途 | 今のセッション限りの情報 | 次回以降も使いたい情報 |
| このアプリでの選択理由 | タブを閉じれば痕跡が消える | スマホを見られたとき発見される危険がある |

DV相談サービスとしてプライバシーを守るため、`localStorage` ではなく `sessionStorage` を使用。

### getItem の戻り値

| 状態 | 戻り値 |
|---|---|
| 値が保存されている | 保存した文字列（例：`'1'`） |
| まだ保存されていない | `null` |

```tsx
if (!acknowledged) {  // null のとき（まだ見ていないとき）
  setOpen(true)
}
```

---

## window.location（ページ移動）

### 使用箇所
`welcome-screen.tsx`・`category-screen.tsx`・`quick-exit.tsx`

### replace と href の違い

```tsx
// replace：履歴を上書きして移動（戻れない）
window.location.replace('https://www.google.com/search?q=天気')

// href：履歴に追加して移動（戻れる）
window.location.href = 'https://www.google.com/search?q=天気'
```

| | `replace()` | `href` への代入 |
|---|---|---|
| 戻るボタン | 戻れない | 戻れる |
| 履歴 | 上書き | 追加 |
| このアプリでの使用理由 | クイック退出後にDVサイトに戻れないようにする | — |

### SAFE_URL

```tsx
const SAFE_URL = 'https://www.google.com/search?q=天気'
```

クイック退出ボタンを押すと、怪しまれない「Google天気検索」のページに飛ぶ。
加害者がスマホを見ても「天気を調べていた」と思わせる安全設計。

---

## 参考文献

- [MDN — History API](https://developer.mozilla.org/ja/docs/Web/API/History_API)
- [MDN — sessionStorage](https://developer.mozilla.org/ja/docs/Web/API/Window/sessionStorage)
- [MDN — localStorage との違い](https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API)
- [MDN — window.location](https://developer.mozilla.org/ja/docs/Web/API/Location)
