[← parta.md に戻る](parta.md)

# Tailwind CSS 知識まとめ

## Tailwind CSS とは

クラス名を HTML に直接書いてスタイルを指定する CSS フレームワーク。
別途 `.css` ファイルを書かなくても、クラス名だけでデザインが完成する。

```tsx
<div className="h-full flex flex-col">
```

- `h-full` → 高さ100%
- `flex` → フレックスボックスレイアウト
- `flex-col` → 縦方向に並べる

---

## 基本的な書き方

通常のCSSと対応：

| Tailwind クラス | 対応するCSS |
|---|---|
| `h-full` | `height: 100%` |
| `w-full` | `width: 100%` |
| `flex` | `display: flex` |
| `flex-col` | `flex-direction: column` |
| `items-center` | `align-items: center` |
| `justify-center` | `justify-content: center` |

---

## 余白（spacing）

```tsx
<div className="p-4 m-2 gap-3">
```

| クラス | 意味 |
|---|---|
| `p-4` | padding（内側の余白）を 4 単位分 |
| `px-4` | 左右のpadding |
| `py-4` | 上下のpadding |
| `m-2` | margin（外側の余白）を 2 単位分 |
| `gap-3` | flex/grid の子要素間の隙間 |

数値は `1 = 4px` が基本単位。`p-4` は `padding: 16px`。

---

## 色

```tsx
<div className="bg-white text-gray-800 border-red-500">
```

| クラス | 意味 |
|---|---|
| `bg-white` | 背景色：白 |
| `bg-red-500` | 背景色：赤（500 = 中程度の濃さ） |
| `text-gray-800` | 文字色：濃いグレー |
| `border-red-500` | ボーダー色：赤 |

数値は `50`（薄い）〜 `950`（濃い）のスケール。

---

## 文字・フォント

```tsx
<p className="text-sm font-bold text-center">
```

| クラス | 意味 |
|---|---|
| `text-xs` | 極小文字 |
| `text-sm` | 小文字 |
| `text-base` | 標準サイズ |
| `text-lg` / `text-xl` | 大文字 |
| `font-bold` | 太字 |
| `text-center` | 中央揃え |

---

## 角丸・影

```tsx
<div className="rounded-xl shadow-lg">
```

| クラス | 意味 |
|---|---|
| `rounded` | 少し角丸 |
| `rounded-lg` | 大きめの角丸 |
| `rounded-xl` | さらに大きな角丸 |
| `rounded-full` | 完全な円形 |
| `shadow-lg` | 大きめの影 |

---

## グリッドレイアウト

```tsx
// category-screen.tsx での使用例
<div className="grid grid-cols-4 gap-3">
```

- `grid` → グリッドレイアウトを有効化
- `grid-cols-4` → 4列のグリッド
- `gap-3` → セル間の隙間

---

## 固定配置・z-index

```tsx
<button className="fixed bottom-4 right-4 z-50">
```

| クラス | 意味 |
|---|---|
| `fixed` | 画面に固定（スクロールしても動かない） |
| `bottom-4` | 下から 4 単位の位置 |
| `right-4` | 右から 4 単位の位置 |
| `z-50` | 重なり順を上にする（z-index: 50） |

---

## アニメーション

```tsx
<button className="transition-colors hover:bg-gray-100">
```

| クラス | 意味 |
|---|---|
| `transition-colors` | 色の変化をアニメーションで滑らかにする |
| `hover:bg-gray-100` | マウスオーバー時に背景色を変える |
| `active:scale-95` | クリック時に少し縮む |

`hover:` `active:` `focus:` は「状態」のプレフィックス。状態のときだけ適用するスタイルを書ける。

---

## 参考文献

- [Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs)
- [全クラス一覧（Cheat Sheet）](https://tailwindcss.com/docs/utility-first)
- [Flexbox ユーティリティ](https://tailwindcss.com/docs/flex)
- [Grid ユーティリティ](https://tailwindcss.com/docs/grid-template-columns)
