# sessionID 永続化対応

## 背景

- 元々 `sessionId` は `chat-layout.tsx` の `useState` で管理されており、サーバーが返す `session_id`（`sendMessage` 呼び出し後の `.then`/`await` 以降）を受け取って初めて値が確定していた。
- この方式だと、ページをリロードすると `sessionId` が失われる、初回送信が失敗すると `sessionId` が undefined のままになる、といった課題があった。
- 今回、クライアント側で sessionID を生成し `sessionStorage` に保存する方式に変更した。

---

## 方針

1. **保存先は `sessionStorage`**
   `localStorage` は同一デバイスの別ユーザーに見られる可能性があるため避けた。既存の `safety-modal.tsx` が同じ理由で `sessionStorage` を採用しており、その方針に統一した。本アプリはDV相談という機微な内容を扱うため、この点を優先した。

2. **ID生成は `crypto.randomUUID()`**
   Web標準APIで追加依存が不要。暗号学的に安全な乱数（CSPRNG）でUUID v4を生成する。`Math.random()` 系の自作IDは、IDを推測されると第三者に会話を覗き見られるリスクに直結するため非推奨と判断した。`nanoid`/`uuid` 等のnpmパッケージも候補として検討したが、標準APIのみで要件を満たせるため依存追加は見送った。

3. **IDの真正性はクライアント側を正とする**
   現状バックエンド（`chat.py`, `session.py`）はクライアントが送った `session_id` をそのまま受け取って返すだけのスタブ実装で、検証・永続化ロジックは存在しない。そのためサーバーの応答(`data.session_id`)を信頼して上書きする必要がなく、クライアント生成のIDをそのまま使い続ける設計にした。

4. **既存の関心の分離パターンを維持**
   `lib/api.ts` の `sendMessage`/`checkHealth` を `chat-layout.tsx` からimportする既存パターンに合わせ、ストレージ操作は新規ファイル `lib/session.ts` に分離した（API通信ロジックとブラウザストレージ操作は別の関心事のため）。

---

## ファイルごとの変更

### `frontend/src/lib/session.ts`（新規作成）

`getOrCreateSessionId()` をexport。`sessionStorage` に `kari_session_id` キーで値があれば返し、なければ `crypto.randomUUID()` で生成して保存してから返す。

```ts
const SESSION_ID_KEY = 'kari_session_id'

export function getOrCreateSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_ID_KEY)
  if (existing) return existing

  const newId = crypto.randomUUID()
  sessionStorage.setItem(SESSION_ID_KEY, newId)
  return newId
}
```

**なぜこの形にしたか**
- 関数名を `getSessionId` ではなく `getOrCreateSessionId` としたのは、「存在しない場合に新規作成する」という副作用を名前から読み取れるようにするため。
- 戻り値は常に `string`（`undefined` を返さない）にして、呼び出し側で存在チェックを書かずに済むようにした。

### `frontend/src/components/chat-layout.tsx`（変更）

- `import { getOrCreateSessionId } from '@/lib/session'` を追加
- `const [sessionId, setSessionId] = useState<string | undefined>()` を削除
- 初回メッセージ送信処理（welcome/categoryからの遷移時）: `sendMessage(content, undefined)` の直前に `const sid = getOrCreateSessionId()` を呼び、`sendMessage(content, sid)` に変更。`.then` 内の `setSessionId(data.session_id)` を削除
- 通常送信処理 `handleSend`: 同様に `getOrCreateSessionId()` を呼んで得た `sid` を `sendMessage` に渡し、`setSessionId(data.session_id)` を削除
- `useCallback` の依存配列から `sessionId` を除外（`[input, loading, sessionId]` → `[input, loading]`）

**なぜこの形にしたか**
- `sessionStorage` はブラウザAPIのため、レンダリング中（SSR時）に直接呼ぶと `sessionStorage is not defined` エラーになる。`useEffect` 内・イベントハンドラ内（クライアントでのみ実行されるタイミング）に限定して呼ぶ必要があり、元のコードの呼び出し位置（effect内, handleSend内）はこの制約を元から満たしていたため、呼び出し場所自体は変えていない。
- `getOrCreateSessionId()` は同期処理であり、`sendMessage` の非同期処理（Promise）とは別レイヤーのため、両者の間に競合状態は生まれない。2箇所で呼んでも2回目以降は保存済みの値を読むだけなので安全（冪等）。
- `sessionId` をReactのstateとして持つ必要がなくなった（`sessionStorage` が真実の源になったため）。これにより、サーバーの応答を待たずに最初の送信時点でIDが確定するようになり、「初回送信が失敗した場合に `sessionId` が undefined のままになる」という従来の暗黙的なエッジケースも解消された。

---

## 検討したが見送った代替案

- **ヘッダー経由でsessionIdを送る方式**: 意味的には自然だが、バックエンドが現状1エンドポイントのスタブ実装であり、複数エンドポイントが増えるタイミングで再検討する方が無理がないため見送った。
- **`session_id` → `token` への命名変更**: 影響範囲が `chat.py` / `session.py` / `api.ts` / `chat-layout.tsx` の4ファイルに及び修正範囲が大きくなるため、現状は `sessionID` の名称を維持する方針とした。
