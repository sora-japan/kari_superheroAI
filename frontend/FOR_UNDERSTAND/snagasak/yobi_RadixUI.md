[← parta.md に戻る](parta.md)

# Radix UI 知識まとめ

## Radix UI とは

アクセシビリティ（障害者対応）が最初から組み込まれているUIコンポーネントライブラリ。
見た目のスタイルは自分で自由に設定できる（スタイルなし＝ヘッドレス）。

このプロジェクトでは `safety-modal.tsx` でモーダル（ポップアップ）に使用している。

---

## Dialog（モーダル）の基本構造

```tsx
import * as Dialog from '@radix-ui/react-dialog'

<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Portal>
    <Dialog.Overlay />      {/* 背景の暗いオーバーレイ */}
    <Dialog.Content>        {/* モーダルの中身 */}
      <Dialog.Title>タイトル</Dialog.Title>
      <Dialog.Description>説明</Dialog.Description>
      {/* ここに内容を書く */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

---

## 各コンポーネントの役割

| コンポーネント | 役割 |
|---|---|
| `Dialog.Root` | モーダル全体のコンテナ。`open` で開閉を制御 |
| `Dialog.Portal` | モーダルをページ最前面に表示するためのラッパー |
| `Dialog.Overlay` | モーダルの背後に表示される暗い半透明の背景 |
| `Dialog.Content` | モーダルの本体（白い枠の部分） |
| `Dialog.Title` | モーダルのタイトル（アクセシビリティ用に必須） |
| `Dialog.Description` | モーダルの説明文（省略可） |

---

## open と onOpenChange

```tsx
<Dialog.Root open={open} onOpenChange={setOpen}>
```

- `open` → モーダルが開いているかどうか（`true`/`false`）
- `onOpenChange` → 開閉状態が変わったときに呼ばれる関数
- ESCキーや外側クリックで閉じようとしたとき、`setOpen(false)` が呼ばれる

---

## ESCキー・外側クリックを無効化する

```tsx
// safety-modal.tsx での使用例
<Dialog.Content
  onEscapeKeyDown={(e) => e.preventDefault()}
  onPointerDownOutside={(e) => e.preventDefault()}
>
```

- `e.preventDefault()` → デフォルトの動作（モーダルを閉じる）をキャンセルする
- このアプリでは「確認しました」ボタン以外ではモーダルが閉じないようにしている
- 誤操作で安全の注意書きを閉じてしまわないための設計

---

## なぜ Radix UI を使うのか

自分でモーダルを作ると対応が難しい機能が最初から入っている：

| 機能 | 内容 |
|---|---|
| フォーカストラップ | モーダルが開いている間、キーボード操作がモーダル内に閉じ込められる |
| aria 属性 | スクリーンリーダーに「これはモーダルです」と伝える属性が自動で付く |
| スクロールロック | モーダル表示中は背景がスクロールしない |
| ESCキーで閉じる | デフォルトでESCキーに対応（今回は無効化している） |

---

## Radix UI の他のコンポーネント

このプロジェクトでは Dialog のみ使用しているが、他にも多数ある：

| コンポーネント | 用途 |
|---|---|
| `@radix-ui/react-dropdown-menu` | ドロップダウンメニュー |
| `@radix-ui/react-tooltip` | ツールチップ |
| `@radix-ui/react-checkbox` | チェックボックス |
| `@radix-ui/react-select` | セレクトボックス |

---

## 参考文献

- [Radix UI — Dialog コンポーネント](https://www.radix-ui.com/primitives/docs/components/dialog)
- [Radix UI — 全コンポーネント一覧](https://www.radix-ui.com/primitives)
- [アクセシビリティとは（WAI-ARIA）](https://developer.mozilla.org/ja/docs/Learn/Accessibility/WAI-ARIA_basics)
