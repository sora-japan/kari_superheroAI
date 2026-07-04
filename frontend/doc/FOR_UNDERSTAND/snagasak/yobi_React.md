[← parta.md に戻る](parta.md)

# React 知識まとめ

## React とは

UIを「コンポーネント（部品）」という単位で組み立てるJavaScriptライブラリ。
コンポーネントは **関数** で書かれていて、画面に表示したいHTMLを返す。

```tsx
function MyButton() {
  return <button>押してね</button>
}
```

C言語でいう「関数」と同じ書き方だが、戻り値がHTMLになっている。

---

## JSX（HTMLっぽい記法）

```tsx
return (
  <div className="h-full">   {/* HTMLの div タグ */}
    <p>こんにちは</p>
  </div>
)
```

- JSXはJavaScriptの中にHTMLを書ける記法
- `class` の代わりに `className` を使う（JavaScriptの予約語と衝突するため）
- `{/* コメント */}` でコメントを書く
- `{}` の中にはJavaScriptの式を書ける：`<p>{name}</p>`

---

## props（コンポーネントへの引数）

```tsx
// 受け取る側
function Greeting({ name }: { name: string }) {
  return <p>こんにちは、{name}さん</p>
}

// 渡す側
<Greeting name="さくら" />   // → こんにちは、さくらさん
```

- propsはコンポーネントへの引数
- C言語の関数引数と同じ概念
- 親コンポーネントから子コンポーネントへ値を渡す

---

## useState（状態管理）

```tsx
const [open, setOpen] = useState(false)
//     ↑現在の値  ↑値を変える関数  ↑最初の値
```

- 値が変わると画面が自動で再描画される
- C言語の変数と違い、`setOpen(true)` を呼ぶと **画面も一緒に更新される**
- `useState<Screen>('welcome')` のように型を指定することもできる

### このプロジェクトでの使用例

```tsx
// app-shell.tsx
const [screen, setScreen] = useState<Screen>('welcome')
// setScreen('category') で画面が切り替わる

// safety-modal.tsx
const [open, setOpen] = useState(false)
// setOpen(true) でモーダルが開く

// welcome-screen.tsx
const [input, setInput] = useState('')
// テキスト入力欄の内容を管理
```

---

## useEffect（副作用）

```tsx
useEffect(() => {
  // ここに処理を書く
  return () => {
    // コンポーネントが消えるときの後片付け（省略可）
  }
}, [依存配列])
```

- コンポーネントが表示されたあとに実行される処理
- 「画面の外側の操作」（イベント登録・API呼び出しなど）に使う

### 依存配列の意味

| 書き方 | タイミング |
|---|---|
| `[]` | 最初の1回だけ実行 |
| `[value]` | `value` が変わるたびに実行 |
| なし（省略） | 毎回レンダリングのたびに実行 |

### このプロジェクトでの使用例

```tsx
// app-shell.tsx：起動時に1回だけ「戻るボタン無効化」を実行
useEffect(() => {
  history.pushState(null, '', window.location.href)
  const handlePopState = () => history.pushState(null, '', window.location.href)
  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState) // 後片付け
}, [])

// safety-modal.tsx：起動時に「過去に見たか」を確認してモーダルを開くか判断
useEffect(() => {
  const acknowledged = sessionStorage.getItem(STORAGE_KEY)
  if (!acknowledged) setOpen(true)
}, [])
```

---

## useRef（DOM要素への参照）

```tsx
const inputRef = useRef<HTMLInputElement>(null)

// 要素に ref を渡す
<input ref={inputRef} />

// DOM要素に直接アクセス
inputRef.current?.focus()
```

- `useRef` はDOM要素（HTMLの要素そのもの）を直接操作したいときに使う
- `.current` で実際の要素を取り出す（nullチェックが必要）
- `welcome-screen.tsx` でテキスト入力欄にフォーカスを当てるために使用

---

## 条件付きレンダリング

```tsx
// && 演算子：条件がtrueのときだけ表示
{screen === 'welcome' && <WelcomeScreen />}

// 三項演算子：条件によって表示を切り替える
{open ? <Modal /> : null}
```

C言語の `if` 文に相当する処理を、JSXの中に直接書く方法。

---

## .map()（リストのレンダリング）

```tsx
{CATEGORIES.map(({ emoji, label }) => (
  <button key={label}>
    {emoji} {label}
  </button>
))}
```

- 配列の全要素に同じ処理をする。C言語の `for` ループに相当
- `key` は各要素を識別するためにReactが必要とする目印（一意な値を渡す）
- `category-screen.tsx` で8枚のカードを自動生成するために使用

---

## 参考文献

- [React 公式ドキュメント](https://react.dev)
- [useState リファレンス](https://react.dev/reference/react/useState)
- [useEffect リファレンス](https://react.dev/reference/react/useEffect)
- [useRef リファレンス](https://react.dev/reference/react/useRef)
- [リストのレンダリング（.map）](https://react.dev/learn/rendering-lists)
