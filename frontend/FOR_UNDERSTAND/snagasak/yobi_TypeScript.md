[← parta.md に戻る](parta.md)

# TypeScript 知識まとめ

## TypeScript とは

JavaScript に「型」を追加した言語。
ファイルの拡張子は `.ts`（UIなし）または `.tsx`（JSXあり）。

- 変数や関数の引数に「この値は文字列しか入らない」と宣言できる
- 間違った型を渡すとコードを実行する前にエラーになる
- C言語の型宣言（`int`, `char*` など）と同じ感覚で書ける

---

## 基本的な型

```ts
const name: string = 'さくら'   // 文字列
const count: number = 3         // 数値（整数・小数どちらも）
const open: boolean = false     // true か false
```

C言語との対応：

| TypeScript | C言語 | 意味 |
|---|---|---|
| `string` | `char*` | 文字列 |
| `number` | `int` / `float` | 数値 |
| `boolean` | `int`（0/1） | 真偽値 |

---

## 型注釈の書き方

```ts
// 変数
const x: number = 5

// 関数の引数・戻り値
function greet(name: string): string {
  return 'こんにちは、' + name
}

// 戻り値なし（void）
function doSomething(): void {
  console.log('処理した')
}
```

`void` はC言語の `void` と同じ意味。「戻り値なし」。

---

## interface（オブジェクトの型定義）

```tsx
// welcome-screen.tsx での使用例
interface Props {
  onOpenCategories: () => void            // 引数なし・戻り値なしの関数
  onStartChat: (message?: string) => void // messageは省略可能（?がつく）
}
```

- `interface` はオブジェクトの「形」を定義する
- C言語の `struct` に近い概念
- コンポーネントのpropsの型を定義するのによく使う

---

## type（型の別名）

```tsx
// app-shell.tsx での使用例
type Screen = 'welcome' | 'category' | 'chat'
```

- `type` は型に名前をつける
- `|`（パイプ）は「または」という意味
- C言語の `enum` に近い概念。決まった値しか入れられなくする

---

## オプショナル（省略可能）プロパティ

```ts
(message?: string)   // ? がついているので省略してもよい
```

- `?` をつけると「あってもなくてもよい」という意味になる
- 省略したとき、値は `undefined` になる

---

## 型アサーション・型インポート

```tsx
import type { Metadata } from 'next'
// ↑ 型だけをインポートする（実行時には消える）

export const metadata: Metadata = { ... }
// ↑ 変数の型を明示する
```

- `import type` はTypeScriptの型情報だけを読み込む構文
- 実行時のJavaScriptには影響しない

---

## よく出るエラーの読み方

| エラー | 意味 |
|---|---|
| `Type 'string' is not assignable to type 'number'` | 文字列を数値の変数に入れようとした |
| `Property 'X' does not exist on type 'Y'` | オブジェクトに存在しないプロパティにアクセスした |
| `Cannot find name 'X'` | 宣言していない変数を使おうとした |

---

## 参考文献

- [TypeScript 公式ドキュメント](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook — 基本の型](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
- [TypeScript を5分で理解する](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
