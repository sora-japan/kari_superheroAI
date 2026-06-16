[← parta.md に戻る](parta.md)

# Lucide React 知識まとめ

## Lucide React とは

SVGアイコンをReactコンポーネントとして使えるライブラリ。
`import { アイコン名 } from 'lucide-react'` と書くだけで使える。

---

## 基本的な使い方

```tsx
import { Phone, X, ShieldCheck } from 'lucide-react'

// コンポーネントとして使う
<Phone />
<X size={16} />
<ShieldCheck className="text-green-600" />
```

- HTMLタグと同じように書くだけで表示される
- `size` でサイズを指定（デフォルトは24px）
- `className` でTailwind CSSのクラスを適用できる

---

## このプロジェクトで使われているアイコン

| アイコン名 | 見た目 | 使用場所 |
|---|---|---|
| `ShieldCheck` | 盾にチェックマーク | safety-modal.tsx：安全説明のタイトル |
| `X` | ✕（バツ印） | 閉じるボタン、クイック退出ボタン |
| `Phone` | 電話 | 緊急電話ボタン |
| `Mic` | マイク | 音声入力ボタン（未実装） |
| `Shield` | 盾 | welcome-screen.tsx |
| `HeartHandshake` | 握手するハート | welcome-screen.tsx |
| `LogOut` | 矢印付きドア | quick-exit.tsx |

---

## プロパティ一覧

```tsx
<Phone
  size={20}               // サイズ（px）。デフォルト24
  color="red"             // 色。デフォルトは currentColor（親要素の文字色）
  strokeWidth={1.5}       // 線の太さ。デフォルト2
  className="mr-2"        // TailwindCSSのクラスを適用
/>
```

---

## color と className の違い

```tsx
// color プロパティで直接色指定
<Phone color="red" />

// Tailwind CSS のクラスで色指定（こちらをよく使う）
<Phone className="text-red-500" />
```

`className` でTailwindを使うとプロジェクト内の色管理が統一できるため、`className` の方が好まれる。

---

## アイコン名の調べ方

公式サイト [lucide.dev](https://lucide.dev) で検索できる。
検索結果のアイコンをクリックすると `import` 用のコード例が表示される。

---

## 参考文献

- [Lucide 公式サイト — アイコン検索](https://lucide.dev/icons)
- [Lucide React — インストール・使い方](https://lucide.dev/guide/packages/lucide-react)
