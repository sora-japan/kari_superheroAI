# A担当 学習ガイド

プログラミング初心者向けに、各ファイルを**読む順番通り**にまとめた教科書です。
「このコードは何をしているのか」を中心に説明しています。

---

## 動作処理の順番

アプリを開いてからチャット画面に入るまで、裏側でどのファイルが順番に動くかを示しています。

```
ブラウザで localhost:3000 を開く
  ↓
① layout.tsx
    └─ HTMLの外枠（<html><body>）を作る
       Googleの検索結果に出ないよう設定する

  ↓
② page.tsx
    └─ AppShell（次のファイル）を呼び出す

  ↓
③ app-shell.tsx
    └─ 「今どの画面を表示するか」の管理を開始する
       ブラウザの「戻る」ボタンを無効化する

  ↓ app-shell が最初に読み込むもの

④ safety-modal.tsx
    └─ 初回アクセスのみ、安全の使い方ポップアップを表示する
       「確認しました」を押すと閉じる（以降タブを閉じるまで表示しない）

  ↓ ポップアップを閉じると

⑤ welcome-screen.tsx
    └─ ウェルカム画面を表示する
       クイックチップ・テキスト入力・緊急電話ボタンがある

  ↓ カテゴリボタンを押すと（任意）

⑥ category-screen.tsx
    └─ 8枚のカードから相談内容を選べる画面を表示する

  ↓ カードまたは入力でチャットへ

（chat-layout.tsx → B担当の範囲）

※ quick-exit.tsx はこのフローには登場しない（レガシーファイル・最後に参考として読む）
```

---

## はじめに読む：前提知識

コードを読む前に、この3つだけ頭に入れておいてください。

### ① Reactコンポーネントとは

ReactはUIを「部品（コンポーネント）」という単位で作ります。
コンポーネントは**関数**で書かれていて、画面に表示したいHTMLを返します。

```tsx
// これがコンポーネント。関数と同じ書き方。
function MyButton() {
  return <button>押してね</button>   // ← HTMLっぽい書き方（JSXという）
}
```

C言語でいう「関数」と同じですが、戻り値がHTMLになっています。

---

### ② propsとは

コンポーネントに値を渡すための仕組みです。関数の引数と同じです。

```tsx
// 受け取る側
function Greeting({ name }: { name: string }) {
  return <p>こんにちは、{name}さん</p>
}

// 渡す側
<Greeting name="さくら" />   // → こんにちは、さくらさん と表示される
```

---

### ③ useStateとは

「値が変わったら画面を自動で更新する」ための仕組みです。

```tsx
const [open, setOpen] = useState(false)
//     ↑現在の値  ↑値を変える関数  ↑最初の値
```

`setOpen(true)` を呼ぶと `open` が `true` になり、画面が自動で再描画されます。
C言語の変数と違って、値を変えると**画面も一緒に更新される**のがポイントです。

---

## ファイル1：`app/layout.tsx`（23行）★☆☆

### 使われている言語・技術

- **TypeScript** — ファイル全体の言語
- **Next.js** — `Metadata` 型でSEO設定を記述する仕組みを提供
- **JSX** — `<html>` `<body>` などのHTML構造を書くための記法
- **Tailwind CSS** — `h-full` などのクラス名でスタイルを指定

**一言で言うと：** アプリ全体のHTMLの外枠を作るファイル

```tsx
export const metadata: Metadata = {
  title: 'かり - 安心して話せる相談室',  // ブラウザのタブに表示されるタイトル
  robots: { index: false, follow: false }, // Googleの検索結果にこのサイトを出さない設定
}
```

`robots: { index: false }` はGoogleに「このサイトを検索結果に載せないで」と伝えています。
DV相談サービスなので、検索して発見されないようにするための安全対策です。

```tsx
<head>
  <meta name="referrer" content="no-referrer" /> {/* このサイトからどこかに移動したとき「ここから来た」という情報を送らない */}
</head>
```

`no-referrer` は「どこからこのサイトに来たか」の情報を他のサイトに送らないようにする設定です。
たとえばこのサイトからGoogleに飛んだとき、Googleに「DV相談サイトから来ました」と伝わらないようにしています。

```tsx
export default function RootLayout({ children }) { // children = この中に入る他の画面コンポーネント
  return (
    <html lang="ja" className="h-full"> {/* lang="ja" でブラウザに「日本語のサイト」と伝える */}
      <body className="h-full">{children}</body> {/* h-full = 画面の高さいっぱいに広げる */}
    </html>
  )
}
```

`children` は「このレイアウトの中に入る他のコンポーネント」のことです。
入れ子構造になっていて、他の全ての画面はこの `<body>` の中に表示されます。

---

## ファイル2：`app/page.tsx`（5行）★☆☆

### 使われている言語・技術

- **TypeScript** — ファイル全体の言語
- **Next.js** — URLにアクセスされたとき最初に実行されるファイルとして機能する
- **JSX** — `<AppShell />` のようなコンポーネントを書くための記法

**一言で言うと：** アプリを起動する最初の1行

```tsx
import { AppShell } from '@/components/app-shell' // app-shell.tsx からAppShellを読み込む

export default function Home() {  // localhost:3000 を開いたとき最初に実行される関数
  return <AppShell />             // AppShellコンポーネントを画面に表示する
}
```

`http://localhost:3000` を開いたときに最初に実行されるファイルです。
やっていることは「AppShellというコンポーネントを表示する」だけ。
本当の処理は次のファイルに委ねています。

`import` はC言語の `#include` に相当します。`@/components/app-shell` は `src/components/app-shell.tsx` のファイルを指しています。

---

## ファイル3：`app-shell.tsx`（51行）★★☆

### 使われている言語・技術

- **TypeScript** — ファイル全体の言語。`type Screen = ...` で型を定義
- **React（useState）** — 現在の画面（`screen`）を状態として管理する
- **React（useEffect）** — 起動時に1回だけ「戻るボタン無効化」を実行する
- **JSX** — 画面コンポーネントを条件付きで表示する記述
- **ブラウザ History API** — `history.pushState` / `popstate` でブラウザの「戻る」を制御

**一言で言うと：** 「今どの画面を表示するか」を管理する司令塔

このファイルがA担当で一番重要です。アプリ全体の画面切り替えを担っています。

### 画面の種類を定義している

```tsx
type Screen = 'welcome' | 'category' | 'chat' // Screenという型は3つの値のどれかしか入れられない
```

`|` は「または」という意味です。`Screen` という型は `welcome` か `category` か `chat` の3択しか入れられません。
C言語でいう `enum`（列挙型）に近い概念です。

### 現在の画面をstateで管理

```tsx
const [screen, setScreen] = useState<Screen>('welcome')
// screen    = 今どの画面を表示しているかを保持する変数（最初は 'welcome'）
// setScreen = screenの値を変えるための関数。呼ぶと画面が切り替わる
```

最初は `welcome`（ウェルカム画面）から始まります。
`setScreen('category')` と呼ぶとカテゴリ画面に切り替わります。

### 戻るボタンを無効化している

```tsx
useEffect(() => {
  history.pushState(null, '', window.location.href)           // 起動時に現在のURLを履歴に追加して「戻れない状態」を作る
  const handlePopState = () => history.pushState(null, '', window.location.href) // 「戻る」を押されたら再び同じURLを追加して留まらせる
  window.addEventListener('popstate', handlePopState)         // ブラウザの「戻る」ボタンが押されたときに上の関数を実行する
  return () => window.removeEventListener('popstate', handlePopState) // コンポーネントが消えるときにイベントの監視を止める（後片付け）
}, []) // [] = このuseEffectは最初の1回だけ実行する
```

`useEffect` は「コンポーネントが表示されたときに1回だけ実行する」仕組みです。
`[]` （空の配列）が最後にあるとき「最初の1回だけ」という意味になります。

`history.pushState` はブラウザの「戻る」ボタンを押されたときに反応する処理です。
ユーザーがブラウザの「←」を押しても、このサイトに留まり続けます。
加害者が「戻る」を押してDV相談サイトを発見できないようにするための安全機能です。

### 画面の切り替えはここで行う

```tsx
return (
  <div className="h-full flex flex-col"> {/* 画面全体を縦に並べるコンテナ */}
    <SafetyModal />                       {/* 常に読み込まれているが、中で表示するか自己判断する */}
    {screen === 'welcome'  && <WelcomeScreen ... />}  {/* screenが'welcome'のときだけ表示 */}
    {screen === 'category' && <CategoryScreen ... />} {/* screenが'category'のときだけ表示 */}
    {screen === 'chat'     && <ChatLayout ... />}     {/* screenが'chat'のときだけ表示 */}
  </div>
)
```

`{screen === 'welcome' && <WelcomeScreen />}` は「screenがwelcomeのときだけWelcomeScreenを表示する」という意味です。
C言語の `if (screen == "welcome") { 表示する }` と同じ意味です。

`<SafetyModal />` は常に読み込まれていますが、中でモーダルを表示するかどうかを自分で判断しています（次のファイルで説明します）。

---

## ファイル4：`safety-modal.tsx`（117行）★★☆

### 使われている言語・技術

- **TypeScript** — ファイル全体の言語
- **React（useState）** — モーダルの開閉状態（`open`）を管理する
- **React（useEffect）** — 起動時に「過去に見たか」を確認してモーダルを開くかどうか判断する
- **Radix UI（Dialog）** — アクセシビリティ対応済みのモーダルを提供する外部ライブラリ
- **Lucide React** — `ShieldCheck` `X` アイコンを表示するライブラリ
- **Tailwind CSS** — モーダルのレイアウト・色・角丸などのスタイル
- **sessionStorage（Web API）** — 「このモーダルをすでに見たか」をブラウザに一時保存する

**一言で言うと：** 最初に1回だけ出る「安全の使い方」の説明ポップアップ

### 一度見たかどうかを記憶する

```tsx
const STORAGE_KEY = 'kari_safety_acknowledged' // sessionStorageに保存するときのキー名（名前のようなもの）

useEffect(() => {
  const acknowledged = sessionStorage.getItem(STORAGE_KEY) // 「すでに見たか」をブラウザから取り出す
  if (!acknowledged) {   // 取り出した値がnull（まだ見ていない）なら
    setOpen(true)        // モーダルを開く
  }
}, []) // [] = 最初の1回だけ実行
```

`sessionStorage` はブラウザに一時的にデータを保存する仕組みです。
`sessionStorage.getItem('キー名')` で値を取り出し、`setItem('キー名', '値')` で保存します。

**localStorageとの違い（重要）：**
- `localStorage` → タブを閉じても残る。スマホを他の人に見られたとき発見される危険がある
- `sessionStorage` → タブを閉じると消える。このアプリはこちらを使用

### ボタンを押したら閉じて記録する

```tsx
const handleAcknowledge = () => {
  sessionStorage.setItem(STORAGE_KEY, '1') // ブラウザに「見た（='1'）」という印を保存する
  setOpen(false)                           // openをfalseにしてモーダルを閉じる
}
```

### ESCキーで閉じられないようにしている

```tsx
onEscapeKeyDown={(e) => e.preventDefault()}    // ESCキーが押されても閉じない（デフォルト動作をキャンセル）
onPointerDownOutside={(e) => e.preventDefault()} // モーダルの外側をクリックされても閉じない
```

誤操作でモーダルを閉じてしまわないよう、ESCキーや背景クリックでは閉じられないようにしています。
「確認しました」ボタンを押したときだけ閉じます。

### TipItemというコンポーネント

```tsx
function TipItem({ icon, title, detail }) { // icon・title・detail の3つをpropsとして受け取る
  return (
    <div>
      <span>{icon}</span>   {/* 絵文字アイコンを表示 */}
      <p>{title}</p>        {/* 太字のタイトルを表示 */}
      <p>{detail}</p>       {/* 小さい補足テキストを表示 */}
    </div>
  )
}
```

モーダルの中の各ヒント項目を表示する小さな部品です。
同じレイアウトのものが3つあるため、コンポーネントとして分離しています。
`icon` `title` `detail` をpropsとして受け取り、それぞれの場所に表示します。

---

## ファイル5：`welcome-screen.tsx`（167行）★★☆

### 使われている言語・技術

- **TypeScript** — ファイル全体の言語。`interface Props` でpropsの型を定義
- **React（useState）** — テキスト入力欄の内容（`input`）を管理する
- **React（useRef）** — テキスト入力欄のDOM要素に直接アクセスするために使用
- **Lucide React** — `Phone` `X` `Mic` `Shield` `HeartHandshake` アイコン
- **Tailwind CSS** — 画面全体のレイアウト・色・余白などのスタイル
- **JSX** — 画面のHTMLを書くための記法
- **Web API（window.location）** — クイック退出ボタンで別ページへ移動する処理

**一言で言うと：** アプリを開いたときに最初に見える画面

### このコンポーネントが受け取るprops

```tsx
interface Props {
  onOpenCategories: () => void           // 「カテゴリを見る」ボタンが押されたときに呼ぶ関数（引数なし）
  onStartChat: (message?: string) => void // チャット開始時に呼ぶ関数。message は省略可能（?がついているため）
}
```

`() => void` は「引数なし・戻り値なし の関数」という意味です。
実際の処理（画面を切り替える）は `app-shell.tsx` 側が持っていて、この画面は「ボタンが押された」という事実だけを親に伝えます。

### テキスト入力の状態管理

```tsx
const [input, setInput] = useState('') // input = 入力欄の現在の文字列（最初は空）、setInput = 内容を更新する関数
```

テキストボックスに入力した内容をstateで管理しています。
`onChange={(e) => setInput(e.target.value)}` でキーを押すたびに `input` が更新されます。

### クイックチップ

```tsx
const QUICK_CHIPS = [                              // ボタンとして表示するチップの一覧（配列）
  { icon: '🏃', label: '今すぐ逃げたい' },         // icon = 絵文字、label = ボタンの文字とチャットに送るメッセージ
  { icon: '💬', label: '話を聴いてほしい' },
  { icon: '📋', label: '証拠の残し方を知りたい' },
]
```

定数として画面外に定義しています。
ボタンを押すと `handleStart(label)` が呼ばれ、そのラベルをメッセージとしてチャット画面に渡します。

### handleStart関数

```tsx
const handleStart = (message?: string) => {          // チップ押下またはEnterで呼ばれる関数
  const msg = message ?? input.trim()                // messageがあればそれ、なければ入力欄の文字（前後の空白を除去）を使う
  onStartChat(msg || undefined)                      // msgが空文字のときはundefinedを渡す（空メッセージを送らないため）
}
```

`??` は「左辺がnullまたはundefinedのとき右辺を使う」という演算子です。
チップを押したとき → `message` あり → チップのラベルを送る
入力欄からEnterしたとき → `message` なし → `input` の内容を送る

### クイック退出ボタン

```tsx
onClick={() => window.location.replace(SAFE_URL)} // ボタンを押したらSAFE_URL（Google天気）へ移動。履歴を上書きするので戻れない
```

`window.location.replace()` は画面を移動しますが、**履歴に残らない**のが特徴です。
通常の `window.location.href = URL` と違い、遷移後に「戻る」を押してもここには戻れません。

---

## ファイル6：`category-screen.tsx`（119行）★★☆

### 使われている言語・技術

- **TypeScript** — ファイル全体の言語。`interface Props` でpropsの型を定義
- **React（useState）** — テキスト入力欄の内容（`input`）を管理する
- **Lucide React** — `Phone` `X` `Mic` アイコン
- **Tailwind CSS** — 4列グリッド・カードの角丸・アニメーションなどのスタイル
- **JSX** — カードを `.map()` で自動生成するための記述
- **Web API（window.location）** — クイック退出ボタンの処理

**一言で言うと：** よくある相談カテゴリを8枚のカードで選べる画面

### カテゴリの定義

```tsx
const CATEGORIES = [                                        // カードとして表示するカテゴリの一覧（配列）
  { emoji: '💰', label: '生活費を\n渡してもらえない' },     // \n = 改行。カード上で2行に分けて表示される
  { emoji: '📱', label: 'スマホを\nチェックされる' },
  // ...全8種類
]
```

`\n` は改行記号です。カード上でラベルが2行で表示されます。

### カードのグリッドレイアウト

```tsx
<div className="grid grid-cols-4 gap-3"> {/* 4列のグリッドレイアウト。gap-3 = カード間の隙間 */}
  {CATEGORIES.map(({ emoji, label }) => ( // CATEGORIES配列の全要素に対してボタンを1枚ずつ生成する
    <button
      key={label}                          // Reactが各ボタンを区別するための目印（一意な値を渡す）
      onClick={() => handleSelect(label)}  // カードを押したらhandleSelectにそのlabelを渡す
    >
      ...
    </button>
  ))}
</div>
```

`CATEGORIES.map(...)` は配列の全要素に対して同じ処理を行います。
C言語の `for` ループに相当し、8枚のカードボタンを自動で生成しています。

`className="grid grid-cols-4"` はTailwind CSSのクラスで「4列のグリッドにする」という意味です。

`key={label}` はReactが各要素を識別するための目印です。リストを表示するときは必須です。

### handleSelect関数

```tsx
const handleSelect = (label: string) => {        // カードが押されたときに呼ばれる関数
  onStartChat(label.replace('\n', ''))           // label内の改行（\n）を空文字に置き換えてからチャット開始
}
```

カードのラベルには `\n`（改行）が含まれているので、チャットに送る前に取り除いています。

---

## ファイル7：`quick-exit.tsx`（49行）★☆☆

### 使われている言語・技術

- **TypeScript** — ファイル全体の言語
- **React（useEffect）** — 起動時に「戻るボタン無効化」を1回実行する
- **Lucide React** — `LogOut` アイコン
- **Tailwind CSS** — ボタンの見た目（丸・赤・固定位置）のスタイル
- **ブラウザ History API** — `history.pushState` / `popstate` でブラウザの「戻る」を制御
- **Web API（window.location）** — `location.replace()` でクイック退出を実行

**一言で言うと：** クイック退出ボタンの元の実装（現在は直接各画面に同じ処理が書かれている）

このファイルは現在 `app-shell.tsx` には読み込まれていません。
`welcome-screen.tsx` や `chat-layout.tsx` に直接同じ処理が書かれているため、実質レガシー（過去の実装）です。

ただし書いてある内容はクイック退出の仕組みをわかりやすく示しているので、参考として読む価値があります。

```tsx
const handleExit = () => {
  window.location.replace(SAFE_URL) // 現在の履歴エントリをSAFE_URLで上書きして移動。戻るボタンでも戻れない
}
```

`useEffect` 内の戻るボタン無効化も `app-shell.tsx` と同じ処理が書かれています。
今は `app-shell.tsx` がアプリ全体で1回この処理をやっているので、このファイルは重複になっています。

---

## まとめ：全体の流れ

```
ブラウザで開く
  ↓
layout.tsx   → HTMLの外枠を作る（Googleに載せない設定もここ）
  ↓
page.tsx     → AppShellを表示するよう指示
  ↓
app-shell.tsx → 「今どの画面を出すか」を管理・戻るボタン無効化
  ↓
safety-modal.tsx → 初回のみ安全説明ポップアップを表示
  ↓
welcome-screen.tsx → ウェルカム画面（クイックチップ・入力欄）
  ↓  チップかEnterを押す
category-screen.tsx → カテゴリ選択画面（8枚のカード）
  ↓  カードを選ぶ
（chat-layout.tsx へ → B担当の範囲）
```

---

## 覚えておく概念チェックリスト

読み終わったらこれが説明できるか確認してみてください。

- [ ] コンポーネントは「UIを返す関数」である
- [ ] `useState` は値が変わると画面が更新される変数である
- [ ] `props` はコンポーネントへの引数である
- [ ] `useEffect` の `[]` は「最初の1回だけ実行」という意味
- [ ] `sessionStorage` はタブを閉じると消える（`localStorage` との違い）
- [ ] `window.location.replace()` は遷移後に「戻る」で戻れない
- [ ] `history.pushState` は「戻る」ボタンを無効化するために使っている
- [ ] `robots: { index: false }` はGoogleの検索結果に出ないようにする設定
- [ ] `.map()` は配列の全要素に同じ処理をする（forループの代わり）
- [ ] `{条件 && <コンポーネント />}` は「条件がtrueのときだけ表示する」
