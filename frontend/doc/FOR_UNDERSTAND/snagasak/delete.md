# 「戻る」で復活させない対応（すぐ閉じる／自動タイムアウト）

## 目的

DV相談アプリでは、加害者に画面を見られないことが最重要。
「すぐ閉じる」ボタンや自動タイムアウトで安全なページ（Google天気）へ遷移した後、
ブラウザの **「戻る」でアプリ（＝相談画面・会話内容）が復活しないように** した。

Chrome / Safari 両方で「戻る」してもアプリに戻れないことを実機確認済み。

---

## 何が問題だったか（戻れてしまった原因）

「すぐ閉じる」もタイムアウトも、処理は `window.location.replace(SAFE_URL)`。
`location.replace` は **「今いる履歴エントリを上書き」** するので、本来は戻れないはず。

ところが `app-shell.tsx` にあった「戻る防止」コードが、
起動時に `history.pushState` で **余分な履歴エントリを1つ追加** していた。

```
起動時の履歴:  [前のサイト, アプリ(表示), アプリ(pushStateで追加)]
                                          ↑ replace はここだけ上書きする

閉じた後:      [前のサイト, アプリ(表示), Google天気]
                          ↑ このアプリのエントリが残る！

Google天気で「戻る」→ アプリ(表示) が復活 ← これが漏れ
```

つまり **「戻る防止」の pushState が、逆に「戻ると復活する」原因** になっていた（矛盾）。

---

## 修正内容

### 1. 脱出処理を1か所に集約（新規ファイル）

`frontend/src/lib/safe-exit.ts` を新設。
バラバラにコピペされていた「安全ページへ遷移する処理」を `safeExit()` に統一した。
遷移先URL（`SAFE_URL`）は既存の `frontend/src/lib/constants.ts` にあるので、それを import して使う。

```ts
import { SAFE_URL } from '@/lib/constants'

export function safeExit(): void {
  window.location.replace(SAFE_URL)
}
```

`safeExit()` を呼んでいる3か所：
- `chat-layout.tsx`（150行目付近） … 「すぐ閉じる」ボタン
- `chat-layout.tsx`（39行目付近）  … 会話セッションの自動タイムアウト
- `app-shell.tsx`（14行目付近）    … BFCache復元時の保険（後述の「3.」）

→ 今後は `safe-exit.ts` の1ファイルを直せば全箇所に反映される。

> 補足：この対応の途中で `main` を取り込むマージを行った。`main` 側のリファクタで
> 画面（welcome / category / chat）が `chat-layout.tsx` に統合され、
> `welcome-screen.tsx` と `category-screen.tsx` は削除されている。
> そのため「すぐ閉じる」ボタンやタイマーは今は `chat-layout.tsx` に集約されている。

### 2. 戻れる原因（pushState）を削除

`app-shell.tsx` の「戻る防止」useEffect（`history.pushState` / `popstate`）を削除。
これで履歴が `[前のサイト, アプリ]` だけになり、
`location.replace` でアプリのエントリが確実に消えて「戻る」で復活しなくなった。

### 3. Safari（BFCache）対策の保険を追加

`app-shell.tsx` に `pageshow` の保険を追加。

```ts
useEffect(() => {
  const handlePageShow = (e: PageTransitionEvent) => {
    if (e.persisted) safeExit()
  }
  window.addEventListener('pageshow', handlePageShow)
  return () => window.removeEventListener('pageshow', handlePageShow)
}, [])
```

- `e.persisted === true` = 「BFCacheから復元された（戻る/進むで冷凍解凍された）」の合図
- 万一アプリが履歴に残って復活しかけても、表示された瞬間に脱出する「最後の砦」
- 通常アクセス時は `persisted` が false なので何も起きない（Chrome/Safari両方で無害）

### 4. 不要ファイルの削除

`frontend/src/components/quick-exit.tsx` を削除。
- どこからも import されていない未使用ファイルだった
- 同じ「漏れやすい pushState」を持っていたため、混乱の元として除去

---

## Safari の注意点（なぜ特別扱いが必要か）

### BFCache（バックフォワードキャッシュ）が強力
- 「戻る/進む」で表示するページを、**画面もJavaScriptのメモリ状態もまるごと冷凍保存** する。
- 普通のリロードと違い `useEffect` などが再実行されないことがあり、
  アプリが履歴に残っていた場合 **会話内容ごと復活** する危険がある（Chromeより漏れやすい）。
- → 上記「3. pageshow の保険」でカバー。

### iOSは「エッジスワイプ」で戻れる
- ボタンだけでなく **画面左端からのスワイプ** で戻れる（無意識に起きやすい）。
- スワイプ中に **戻り先のプレビューがチラッと見える** ことがあり、これはJSで完全には防げない。
- → アプリを履歴から消す方針（1・2）で、そもそも戻り先にアプリが無い状態にして対処。

### sessionStorage の挙動差
- セッションID保持に `sessionStorage`（`lib/session.ts`）を使用。
- Safariはタブ復元やBFCache復帰時の挙動がChromeとズレることがある。
- 今回の「戻る」対策には直接影響しないが、今後の注意点としてメモ。

---

## 動作確認（Chrome / Safari）

1. 「すぐ閉じる」→ 戻る → アプリが出ない ✅
2. タイムアウト放置 → 戻る → アプリが出ない ✅
3. iOS Safari の左端スワイプで戻る → 同様 ✅

すべて「Google天気、さらにその前のサイト」に飛ぶだけで、相談画面・会話には戻れない。

---

## 変更ファイル一覧

| ファイル | 変更 |
|---|---|
| `frontend/src/lib/safe-exit.ts` | 新規（`safeExit()` を定義。`SAFE_URL` は constants.ts から import） |
| `frontend/src/components/app-shell.tsx` | pushStateの戻る防止を削除・pageshow保険を追加・safeExit呼び出し |
| `frontend/src/components/chat-layout.tsx` | 「すぐ閉じる」ボタンとタイムアウトを safeExit 呼び出しに変更 |
| `frontend/src/components/quick-exit.tsx` | 削除（未使用・漏れやすいコード） |

※ `welcome-screen.tsx` / `category-screen.tsx` は main のリファクタで削除済み
（`chat-layout.tsx` に統合された）。`SAFE_URL` の定義は `frontend/src/lib/constants.ts`。
