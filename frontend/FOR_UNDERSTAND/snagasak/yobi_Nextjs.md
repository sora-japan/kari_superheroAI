[← parta.md に戻る](parta.md)

# Next.js 知識まとめ

## ファイル規約（App Router）

Next.js の `app/` ディレクトリには、ファイル名に特別な意味がある。

| ファイル名 | 役割 |
|---|---|
| `layout.tsx` | HTMLの外枠（`<html><body>`）を作る。全ページ共通のラッパー |
| `page.tsx` | そのURLにアクセスされたとき最初に実行されるファイル |

`localhost:3000` を開くと `app/layout.tsx` → `app/page.tsx` の順に実行される。

---

## Metadata 型

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'サイトのタイトル',
  robots: { index: false, follow: false },
}
```

- Next.js が提供する型で、ページの `<head>` タグの内容を定義する
- `layout.tsx` や `page.tsx` でこの変数を `export` すると、Next.js が自動で `<head>` に反映する
- HTMLを直接書かなくても、オブジェクト形式でSEO設定ができる

### 主なプロパティ

| プロパティ | 内容 |
|---|---|
| `title` | ブラウザのタブに表示されるタイトル |
| `description` | 検索結果に表示される説明文 |
| `robots` | 検索エンジンのクロール設定 |

### robots 設定

```tsx
robots: { index: false, follow: false }
```

- `index: false` → Googleの検索結果にこのページを載せない
- `follow: false` → ページ内のリンクをたどらない
- DV相談サービスなど、検索で発見されたくないサイトに使う安全対策

---

## パスエイリアス（`@/`）

```tsx
import { AppShell } from '@/components/app-shell'
```

- `@/` は `src/` ディレクトリを指すエイリアス
- C言語の `#include` に相当する。ファイルを読み込む仕組み
- Next.js プロジェクトでは慣習的に `@/` を使う（相対パスの `../../` を避けるため）

---

## RootLayout の構造

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
```

- `children` はこのレイアウトの中に入る他のコンポーネント（全ページ共通の入れ子）
- `lang="ja"` はブラウザに「日本語のサイト」と伝える属性
- 全ての画面はこの `<body>` の中に表示される

---

## `<head>` への直接タグ追加

```tsx
<head>
  <meta name="referrer" content="no-referrer" />
</head>
```

- `layout.tsx` の JSX 内に `<head>` を書くと、Next.js がページの `<head>` に追加する
- `no-referrer` はリファラー情報（どこから来たか）を他サイトに送らない設定
- Metadata 型でカバーされないタグはこの方法で直接書く

---

## 参考文献

- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [Metadata API リファレンス](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [App Router — layout.tsx の解説](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
