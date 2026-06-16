❯ `export async function` async ってなんですか？

● async = 「この関数は時間がかかる処理を含む」という宣言

  ---
  C言語との根本的な違い

  C言語はコードを**上から順番に実行**します。

  ```c
  // C言語：上から順に実行される
  char* res = http_request(...);  // ← 終わるまでここで止まる
  printf(res);                    // ← 終わってから実行される
  ```

  JavaScriptはデフォルトで**待たずに次へ進みます**。

  ```ts
  // async なし：待たずに次へ進んでしまう
  const res = fetch(...)  // ← 終わってないのに
  console.log(res)        // ← ここが実行されてしまう → 中身が空
  ```

  ---
  async / await で「待つ」ことができる

  ```ts
  async function sendMessage() {
    const res = await fetch(...)  // ← await をつけると終わるまで待つ
    console.log(res)              // ← 終わってから実行される
  }
  ```

  - `async` → 「この関数の中で `await` を使う」という宣言
  - `await` → 「ここで処理が終わるまで待て」という命令

  `async` をつけないと `await` が使えません。セットで使います。

  ---
  なぜ api.ts で必要か

  ```ts
  export async function sendMessage(...) {
    const res = await fetch(`${API_BASE}/api/v1/chat`, ...)
    //          ^^^^^
    //          HTTPリクエストが終わるまで待つ
  ```

  サーバーへの通信（`fetch`）は時間がかかります。返事が来るまで待たないと、空の結果を使ってしまいます。

  ---
  C言語で例えると

  ```c
  // C言語の場合、http_request は返事が来るまで勝手に待つ（ブロッキング）
  char* res = http_request("POST", url, body);
  process(res);  // ← 返事が来てから実行される
  ```

  C言語は「終わるまで止まる（ブロッキング）」が基本です。JavaScriptは「止まらない（ノンブロッキング）」が基本なので、明示的に `await` で待つ指示が必要です。

  ---

❯ `Promise<>` ってなんですか

● Promise = 「後で値が届く」という約束の入れ物

  ---
  概念から理解する

  ```ts
  export async function sendMessage(...): Promise<{ reply: string; session_id: string }>
  ```

  `async` 関数は**即座に結果を返せません**（サーバーの返事を待っているから）。

  そこで「今すぐ結果は渡せないけど、後で届けます」という**約束（Promise）** を先に返します。

  ---
  日常で例えると

  ```
  ラーメン屋で注文する
    ↓
  「できたら持ってきます」と言われる  ← これが Promise
    ↓
  しばらく待つ
    ↓
  ラーメンが届く  ← Promise が解決された状態
  ```

  ---
  `<>` の中身は「最終的に届く値の型」

  ```ts
  Promise<boolean>                                    // 最終的に true/false が届く
  Promise<{ reply: string; session_id: string }>      // 最終的にこのオブジェクトが届く
  ```

  `<>` は今まで見てきた型パラメータと同じです。「何が届くか」を型で指定しています。

  ---
  await との関係

  ```ts
  // Promise を受け取る（まだ中身がない）
  const promise = sendMessage("こんにちは")

  // await で「届くまで待つ」
  const result = await sendMessage("こんにちは")
  //             ^^^^^
  //             Promise が解決されるまで待って、中身を取り出す
  ```

  `await` は Promise の封筒を開けて中身を取り出す操作です。

  ---
  C言語で例えると

  C言語には直接対応する概念がありませんが、強いて言えば：

  ```c
  // C言語：関数が終わるまでここで止まる（Promiseは不要）
  Result result = http_request(...);  // 終わるまで待つ
  process(result);

  // JavaScript：すぐ Promise が返ってくる、await で待つ
  const result = await fetch(...);  // Promise を待って中身を取り出す
  process(result);
  ```

  C言語は「終わるまで勝手に止まる」ので Promise が不要でした。JavaScriptは「止まらない」ので、Promise という仕組みで「後で届く値」を扱います。
