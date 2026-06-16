# コード分担に関するやりとり

---

**Q:** frontend/src この中にあるコードを分担して理解したいです。appディレクトリとcomponentsディレクトリ内部にあるコードが理解の対象なのですが、内容の依存関係とコードの重たさに応じて分担を切り分けたいと思っています。どういった分担がよさそうでしょうか？

---

**A:**

まずファイルの行数と依存関係を確認します。

## 依存関係の全体図

```
app/page.tsx (5行)
  └── app-shell.tsx (51行)  ← 画面遷移の司令塔
        ├── safety-modal.tsx (117行)
        ├── welcome-screen.tsx (167行)
        ├── category-screen.tsx (119行)
        └── chat-layout.tsx (376行)
              └── lib/api.ts (32行)

app/layout.tsx (23行) ← 独立
quick-exit.tsx (49行) ← 独立（おそらくユーティリティ）
```

## 推奨分担（3人）

| 担当 | ファイル | 行数計 | 内容 |
|---|---|---|---|
| **A: 骨格担当** | `app/layout.tsx` `app/page.tsx` `app-shell.tsx` `quick-exit.tsx` | 128行 | アプリ全体の起動・画面遷移の仕組み |
| **B: 初期画面担当** | `welcome-screen.tsx` `category-screen.tsx` `safety-modal.tsx` | 403行 | ユーザーが最初に見る3画面 |
| **C: チャット担当** | `chat-layout.tsx` `lib/api.ts` | 408行 | チャットUI・APIとの通信 |

## 読む順の推奨

- **A → B → C** の順に読むと依存関係の流れに沿えます
- AがB・Cに「どう繋がるか」（`setScreen` の呼び出し箇所など）を把握してから、B・Cが各画面の詳細に入ると理解が深まります
- chat-layout.tsx（376行）はこの中で最も重いので、C担当は余裕を持って読む時間を確保することをお勧めします

---

**Q:** すみませんが分担は二人を想定しています。依存関係を鑑みてお互い重複したコードを見る形でも構いません。どのような形がよさそうでしょうか？

---

**A:**

2人であれば、`app-shell.tsx` を**共通で読む**形にするのがよいです。

## 推奨分担（2人・app-shell は共通）

| 担当 | ファイル | 行数 |
|---|---|---|
| **A: 初期フロー担当** | `app/layout.tsx` `app/page.tsx` `app-shell.tsx`（共通） `quick-exit.tsx` `safety-modal.tsx` `welcome-screen.tsx` `category-screen.tsx` | 531行 |
| **B: チャット担当** | `app-shell.tsx`（共通） `chat-layout.tsx` `lib/api.ts` | 459行 |

## app-shell を共通にする理由

`app-shell.tsx` はすべての画面の**切り替え役（司令塔）**です。

```
app-shell.tsx が管理するもの
  - どの画面を表示するか（welcome / category / chat）
  - 画面間でメッセージをどう受け渡すか
  - ブラウザの「戻る」を無効化する処理
```

ここを両者が把握していないと、A は「チャットにどうつながるのか」、B は「どこから呼ばれるのか」がそれぞれ不明瞭になります。51行と短いので、共通で読むコストは低いです。

## 読む順の推奨

```
A担当: layout → page → app-shell → safety-modal → welcome-screen → category-screen → quick-exit

B担当: app-shell → api.ts → chat-layout（上から順に）
```

B は `api.ts`（32行）を先に読んでおくと、`chat-layout.tsx` の中でAPIを呼ぶ箇所の理解がスムーズです。

---

**Q:** 読む順の推奨

A担当: layout → page → app-shell → safety-modal → welcome-screen → category-screen → quick-exit

B担当: app-shell → api.ts → chat-layout（上から順に）　この二人は具体的にどのような担当分野の違いがありますか？

---

**A:**

一言で表すと以下のとおりです。

| | A担当 | B担当 |
|---|---|---|
| **役割** | 「アプリに入ってチャットを始めるまで」 | 「チャットを始めてから会話が終わるまで」 |

## A担当が理解する世界

**ユーザーがアプリを開いた瞬間から、チャット開始ボタンを押すまで**の全体です。

- アプリがどう起動するか（`layout` → `page`）
- 最初に出る安全確認モーダル（`safety-modal`）
- 初期画面のレイアウト・よくある相談チップ（`welcome-screen`）
- カテゴリ一覧画面（`category-screen`）
- 画面をすぐ閉じる処理（`quick-exit`）
- どの画面がいつ表示されるかの制御（`app-shell`）

→ **UI の見た目と画面遷移のロジックが中心**

## B担当が理解する世界

**チャット画面に入ってから、会話・退出するまで**の全体です。

- フロントエンドとバックエンドがどう通信するか（`api.ts`）
- チャットメッセージの送受信と表示（`chat-layout`）
- タイマー・セッション管理（`chat-layout` 内）
- ローディング表示・エラー処理（`chat-layout` 内）
- どこからチャット画面が呼ばれるかの入口（`app-shell`）

→ **データの流れと非同期処理が中心**

## 協力が必要になる接点

`app-shell.tsx` の以下の1箇所が両者の境界線です。

```tsx
// A担当が理解する「チャット開始を呼び出す側」
const goToChat = (message?: string) => {
  setInitialMessage(message)
  setScreen('chat')        // ← ここでBの世界に渡す
}
```

A はここまで、B はここから先、という明確な分担になります。

---

**Q:** 重たさはABどちらが重そうですか？コードの分量なども知りたいです。

---

**A:**

## 分量の比較

| | A担当 | B担当 |
|---|---|---|
| ファイル数 | 7本 | 3本 |
| 合計行数 | **531行** | **459行** |

## ただし「重さ」は B のほうが重い

分量はAが多いですが、**読む難しさはBのほうが高い**です。

### A担当のファイル内訳

| ファイル | 行数 | 難しさ |
|---|---|---|
| `layout.tsx` | 23行 | ★☆☆ ほぼ定型文 |
| `page.tsx` | 5行 | ★☆☆ 1画面呼ぶだけ |
| `app-shell.tsx` | 51行 | ★★☆ 画面切替のロジック |
| `quick-exit.tsx` | 49行 | ★☆☆ シンプル |
| `safety-modal.tsx` | 117行 | ★★☆ モーダルの開閉 |
| `welcome-screen.tsx` | 167行 | ★★☆ UIとイベント |
| `category-screen.tsx` | 119行 | ★★☆ UIとイベント |

→ 難しいファイルがなく、**広く浅く読む**イメージ

### B担当のファイル内訳

| ファイル | 行数 | 難しさ |
|---|---|---|
| `app-shell.tsx` | 51行 | ★★☆ （共通） |
| `api.ts` | 32行 | ★★☆ fetch処理 |
| `chat-layout.tsx` | **376行** | ★★★ 最難関 |

→ `chat-layout.tsx` 1本に非同期処理・タイマー・状態管理が集中しており、**1ファイルを深く読む**イメージ

## まとめ

```
A: 広く・浅く（ファイル数は多いが読みやすい）
B: 狭く・深く（ファイル数は少ないがchat-layoutが重い）
```

React や非同期処理（`async/await`、`useEffect`）に慣れている人が B を担当すると読みやすいです。
