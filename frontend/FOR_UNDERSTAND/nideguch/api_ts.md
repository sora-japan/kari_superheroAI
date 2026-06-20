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

  ---

❯ `sendMessage( a ): Promise<{ b }>{ c }` この形式だと思ったんですが、`( a )` のあとのコロンってどういう意味があるんですか？型注釈ですか？

● はい、型注釈です。**関数の戻り値の型注釈**です。

  ---
  場所による型注釈の書き方の違い

  ```ts
  const screen: Screen = 'welcome'        // 変数の型注釈：変数名の後
  (message?: string)                      // 引数の型注釈：引数名の後
  ): Promise<...> {                       // 戻り値の型注釈：引数リストの後
  ```

  全部コロンの後に型を書く、という点は同じです。書く場所が違うだけです。

  ---
  関数の構造で見ると

  ```ts
  function sendMessage(
    message: string,     // 引数の型注釈
    sessionId?: string,  // 引数の型注釈
  ): Promise<{ reply: string; session_id: string }>  // ← 戻り値の型注釈
  {
    // 処理
    return res.json()   // ← これが Promise<...> 型である必要がある
  }
  ```

  ---
  C言語で例えると

  ```c
  // C言語では戻り値の型は関数名の前に書く
  Promise sendMessage(char* message, char* sessionId) {
  //^^^^^^
  // 戻り値の型
  ```

  ```ts
  // TypeScript では引数リストの後に書く
  function sendMessage(message: string): Promise<...> {
  //                                   ^^^^^^^^^^^^
  //                                   戻り値の型
  ```

  書く位置がC言語と逆なだけで、意味は同じです。

  ---

❯ `const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'` `??` ってなんではてなが二つあるんですか？`&&` みたいな感じですか？

● `&&` とは別物です。**「左が null/undefined なら右を使う」** という演算子です。

  ---
  `??` の意味

  ```ts
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  //                           ^^^^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^^^^^^^^
  //                           左：環境変数の値         右：デフォルト値
  ```

  「環境変数に値が設定されていればそれを使う、**なければ** `'http://localhost:8000'` を使う」という意味です。

  ---
  C言語で例えると

  ```c
  char* api_url = getenv("NEXT_PUBLIC_API_URL");
  char* API_BASE = (api_url != NULL) ? api_url : "http://localhost:8000";
  //               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //               三項演算子で「NULLなら右を使う」
  ```

  `??` はこの三項演算子を短く書いたものです。

  ---
  `&&` との違い

  ```ts
  A && B    // A が「真」なら B を返す
  A ?? B    // A が「null/undefined」なら B を返す
  ```

  用途が全然違います。

  ```ts
  '' ?? 'デフォルト'    // → ''  （空文字は null でないのでそのまま）
  '' && 'デフォルト'    // → ''  （空文字は偽なので左を返す）

  null ?? 'デフォルト'  // → 'デフォルト'
  null && 'デフォルト'  // → null
  ```

  `??` は「値が**存在しない**とき」だけ右を使います。

  ---
  この行の意味まとめ

  ```ts
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  ```

  - 本番環境など → 環境変数に URL が設定されている → その URL を使う
  - ローカル開発中 → 環境変数が未設定（undefined） → `localhost:8000` を使う

  ---

❯ `process.env` ってなんですか

● process.env = 環境変数を読む仕組み

  ---
  環境変数とは

  プログラムの外側（OS やサーバー設定）で定義された変数です。コードに直接書かずに済む値を外から渡せます。

  ```
  本番サーバー: NEXT_PUBLIC_API_URL = "https://api.example.com"
  開発PC:      NEXT_PUBLIC_API_URL = 未設定
  ```

  ---
  C言語で例えると

  ```c
  #include <stdlib.h>

  // C言語でも環境変数を読む関数がある
  char* api_url = getenv("NEXT_PUBLIC_API_URL");
  ```

  `process.env.変数名` は C言語の `getenv("変数名")` と同じ意味です。

  ---
  `process` とは

  Node.js（JavaScriptの実行環境）が提供するオブジェクトです。実行中のプログラム自体の情報が入っています。

  ```ts
  process.env   // 環境変数一覧
  process.env.NEXT_PUBLIC_API_URL  // 特定の環境変数の値
  ```

  `.` でつないでプロパティにアクセスするのは、C言語の構造体メンバへのアクセスと同じ感覚です。

  ```c
  // C言語の構造体アクセスと同じ感覚
  process.env  →  process->env
  ```

  ---
  なぜ直接コードに書かないのか

  ```ts
  // こうしてしまうと…
  const API_BASE = 'https://api.example.com'
  ```

  - 本番URLがソースコードに露出する
  - 環境ごとに変えたいとき毎回コードを書き換える必要がある

  環境変数にすることで、**コードを変えずに環境ごとに値を切り替えられます**。

  ---

❯ `${API_BASE}/api/v1/chat` `API_BASE` って環境変数ですか？

● 違います。`API_BASE` は**このファイルの先頭で定義した変数**です。

  ---
  1行目を見ると

  ```ts
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  //    ^^^^^^^^
  //    これが API_BASE という変数
  ```

  `process.env.NEXT_PUBLIC_API_URL` が環境変数で、それを読んで `API_BASE` に入れています。

  ---
  流れで整理すると

  ```
  環境変数 NEXT_PUBLIC_API_URL
    ↓ process.env で読み出す
    ↓ ?? で「なければ localhost:8000」
  const API_BASE に代入
    ↓
  fetch の URL に使う
  ```

  ---
  C言語で例えると

  ```c
  // 環境変数を読んで変数に入れる
  char* env_val = getenv("NEXT_PUBLIC_API_URL");
  char* API_BASE = (env_val != NULL) ? env_val : "http://localhost:8000";

  // その変数を使う
  char url[256];
  sprintf(url, "%s/api/v1/chat", API_BASE);
  http_request(url, ...);
  ```

  `API_BASE` は「環境変数から読んだ値を入れておく普通の変数」です。

  ---

❯ `${API_BASE}` ってなんで `${}` でくくっているんですか？

● バッククォートで囲まれた文字列の中に変数を埋め込むための構文です。

  ---
  バッククォートと `${}` の関係

  JavaScriptには文字列の書き方が2種類あります。

  ```ts
  '普通の文字列'         // シングルクォート：変数を埋め込めない
  `テンプレート文字列`   // バッククォート：${}で変数を埋め込める
  ```

  `${}` はバッククォートの中でしか使えません。

  ---
  変数を埋め込む

  ```ts
  const API_BASE = 'http://localhost:8000'

  `${API_BASE}/api/v1/chat`
  // → 'http://localhost:8000/api/v1/chat'
  ```

  `${}` の中に変数を書くと、その値に展開されます。

  ---
  C言語で例えると

  ```c
  // C言語では sprintf で文字列に変数を埋め込む
  char url[256];
  sprintf(url, "%s/api/v1/chat", API_BASE);
  ```

  ```ts
  // TypeScript では ${}で直接埋め込める
  const url = `${API_BASE}/api/v1/chat`
  ```

  C言語の `%s` に相当するのが `${}` です。

  ---
  `${}` の中はJavaScriptとして評価される

  ```ts
  `${API_BASE}/api/v1/chat`   // 変数
  `${1 + 2}個`                // 式も書ける → '3個'
  `${'hello'.toUpperCase()}`  // 関数呼び出しも書ける → 'HELLO'
  ```

  `{}` の中であれば何でも書けます。

  ---

❯ `body:` ってなにが入っているんですか？

● body = サーバーに送るデータ本体

  HTTPリクエストの「荷物」にあたる部分です。

  ---
  `JSON.stringify({ message, session_id: sessionId })` を分解する

  ```ts
  body: JSON.stringify({ message, session_id: sessionId })
  ```

  **まず `{}` の中身から：**

  ```ts
  { message, session_id: sessionId }
  ```

  これはオブジェクトです。2つのプロパティを持っています。

  ```ts
  {
    message: message,        // 送るメッセージ文字列
    session_id: sessionId,   // セッションID
  }
  ```

  `message` は `message: message` の省略形です（名前が同じとき省略できます）。

  ---
  `JSON.stringify` で文字列に変換

  ```ts
  JSON.stringify({ message: "こんにちは", session_id: "abc123" })
  // → '{"message":"こんにちは","session_id":"abc123"}'
  ```

  オブジェクトをそのままHTTPで送れないので、JSON文字列に変換しています。

  ---
  C言語で例えると

  ```c
  // 送るデータを文字列に変換してbodyに入れる
  char body[512];
  sprintf(body, "{\"message\":\"%s\",\"session_id\":\"%s\"}", message, sessionId);

  HttpRequest req = {
      .method  = "POST",
      .headers = "Content-Type: application/json",
      .body    = body,   // ← ここに入る
  };
  ```

  ---
  method / headers / body の役割

  ```
  method: 'POST'     → 「データを送る」という操作の種類
  headers:           → 「bodyはJSON形式ですよ」という宣言
  body:              → 実際に送るデータ
  ```

  手紙で例えると、`headers` が封筒の表書き、`body` が中身の手紙です。

  ---

❯ fetchの戻り値って何なんですか？

● fetch の戻り値は `Response` オブジェクトです

  ```ts
  const res = await fetch(...)
  //    ^^^
  //    Response オブジェクトが入る
  ```

  サーバーからの「返事一式」が入ったオブジェクトです。

  ---
  Response オブジェクトの中身

  コードで使われているものを見ると：

  ```ts
  res.ok      // 通信が成功したか？ → true / false
  res.status  // HTTPステータスコード → 200, 404, 500 など
  res.json()  // bodyをJSONとして読み出す → オブジェクトが返る
  ```

  ---
  C言語で例えると

  ```c
  typedef struct {
      int   ok;      // 成功したか
      int   status;  // ステータスコード
      char* body;    // レスポンスの中身
  } Response;

  Response res = http_request(url, req);
  ```

  ---
  コードの流れで見ると

  ```ts
  const res = await fetch(...)       // Response が届く

  if (!res.ok) {                     // 失敗していたら
    throw new Error(`API error: ${res.status}`)  // エラーを投げる
  }

  return res.json()                  // 成功していたら中身を返す
  ```

  ```
  res.ok = true  → res.json() でデータを取り出して return
  res.ok = false → エラーを throw（例外を投げる）
  ```

  ---
  `res.json()` の戻り値

  ```ts
  return res.json()
  // → { reply: string; session_id: string } が返る
  ```

  これが関数の戻り値の型 `Promise<{ reply: string; session_id: string }>` に対応しています。

  ---

❯ `try {} catch {}` ってなんですか？

● try/catch = エラーが起きたときの対処の仕組み

  ---
  構造

  ```ts
  try {
    // 試みる処理
  } catch {
    // 失敗したときの処理
  }
  ```

  「まず `try` の中を実行する。エラーが起きたら `catch` の中を実行する」という意味です。

  ---
  C言語との違い

  C言語にはtry/catchがありません。エラーは戻り値で判定していました。

  ```c
  // C言語：戻り値でエラー判定
  int res = http_request(url);
  if (res < 0) {
      return false;  // 失敗
  }
  return true;
  ```

  JavaScriptでは通信失敗時に**例外（エラー）が投げられる**ので、try/catchで受け取ります。

  ---
  このコードの流れ

  ```ts
  try {
    const res = await fetch(...)  // 通信を試みる
    return res.ok                 // 成功したら true/false を返す
  } catch {
    return false                  // 通信自体が失敗したら false を返す
  }
  ```

  ```
  通信成功 → res.ok を返す（サーバーが応答した = true）
  通信失敗 → catch に入る → false を返す（サーバーに繋がらなかった）
  ```

  ---
  `sendMessage` との違い

  ```ts
  // sendMessage：エラーをそのまま投げる
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  // checkHealth：エラーを握りつぶして false を返す
  } catch {
    return false
  }
  ```

  `checkHealth` は「繋がるかどうか確認するだけ」の関数なので、失敗しても `false` を返すだけで十分です。

  ---

❯ `sendMessage` と `checkHealth` との使い道の違いって実際どういう風になっているのですか？

● 実は `checkHealth` は `chat-layout.tsx` では**使われていません**。

  ---
  chat-layout.tsx の import を見ると

  ```ts
  import { sendMessage, type ChatMessage } from '@/lib/api'
  //       ^^^^^^^^^^^
  //       sendMessage だけ使っている
  //       checkHealth は import されていない
  ```

  ---
  `sendMessage` の実際の使われ方

  コードの中で2か所使われています。

  **① チャット画面を開いたとき（初回メッセージの自動送信）**

  ```ts
  sendMessage(content, undefined)   // 64行目
    .then(...)   // 成功したら返信を表示
    .catch(...)  // 失敗したらエラーメッセージを表示
  ```

  **② ユーザーがメッセージを送信したとき**

  ```ts
  const data = await sendMessage(content, sessionId)  // 97行目
  ```

  ---
  `checkHealth` は現時点では未使用

  `api.ts` に定義はされていますが、どこからも呼ばれていません。

  「サーバーが起動しているか確認する」用途で作られた関数と思われますが、現状のコードでは使われていない状態です。将来的にチャット画面を開く前にサーバーの死活確認をする、といった使い方を想定して用意されているのかもしれません。

  ---

❯ `const makeInitialMessage = (): DisplayMessage => ({*})` 関数を DisplayMessage に型注釈している←？という理解でいいんですか？

● 少し違います。**関数の戻り値**に型注釈しています。

  ---
  構造を分解すると

  ```ts
  const makeInitialMessage = (): DisplayMessage => ({ ... })
  //                          ^   ^^^^^^^^^^^^^
  //                          |   戻り値の型注釈（この関数はDisplayMessageを返す）
  //                          引数リスト（空）
  ```

  「この関数を呼ぶと `DisplayMessage` 型の値が返ってくる」という宣言です。

  ---
  api.ts で見たものと同じ

  ```ts
  // api.ts で見たパターン
  function sendMessage(...): Promise<{ reply: string; session_id: string }> {

  // 今回のパターン
  const makeInitialMessage = (): DisplayMessage => ({
  ```

  どちらも「引数リストの後にコロンで戻り値の型を書く」という同じ構文です。

  ---
  C言語で例えると

  ```c
  // C言語：戻り値の型は関数名の前
  DisplayMessage makeInitialMessage() {
      return (DisplayMessage){ ... };
  }
  ```

  ```ts
  // TypeScript：戻り値の型は引数リストの後
  const makeInitialMessage = (): DisplayMessage => ({ ... })
  ```

  書く位置が違うだけで意味は同じです。

  ---
  まとめ

  ```
  (): DisplayMessage => ({ ... })
  ^^  ^^^^^^^^^^^^^
  |   戻り値の型注釈
  引数なし
  ```

  「関数に型注釈」ではなく「**この関数が返す値**に型注釈」です。

---

## res.json()

❯ `return res.json()` ってなんですか？

● `res.json()` = 「サーバーから返ってきたデータをJavaScriptのオブジェクトに変換する」関数です。

  ---
  `fetch` の返り値を2段階で受け取る

  ```ts
  const res = await fetch(...)
  //    ^^^
  //    fetch の戻り値 = Response オブジェクト（ブラウザが提供）

  return res.json()
  //     封筒の中の「中身（JSON文字列）」を取り出してオブジェクトに変換する
  ```

  ---
  なぜ2段階なのか

  サーバーが返すデータは最初「テキスト（文字列）」として届きます。

  ```
  サーバーの返答（テキスト）:
  '{"reply": "こんにちは", "session_id": "abc123"}'

  ↓ res.json() で変換

  JavaScriptのオブジェクト:
  { reply: "こんにちは", session_id: "abc123" }
  ```

  C言語で例えると：

  ```c
  char* raw = receive_from_server();      // 生テキストで届く
  struct Response res = parse_json(raw);  // 構造体に変換
  ```

  `res.json()` がその変換処理に相当します。

  ---
  `res.json()` は Promise を返す

  ```ts
  return res.json()
  // res.json() は Promise を返す
  // sendMessage 自体が async なので、呼び出し側は await で受け取れる
  ```

  呼び出し側（chat-layout.tsx）では：

  ```ts
  const data = await sendMessage(content, sessionId)
  // data = { reply: "...", session_id: "..." }
  data.reply      // AIの返信テキスト
  data.session_id // セッションID
  ```

  `res.json()` で変換されたオブジェクトが最終的に `data` に入ります。

  ---

❯ `json()` をどこかで import しているそぶりがないんですが、これは標準で使えるんですか？また、`res.json()` とした場合、res の中身を JavaScript のオブジェクトにした上で return しているということなんですか？

● 2つとも正確な理解です。

  ---
  質問1：json() はどこからきているのか

  `json()` は `res` オブジェクトが持っているメソッドです。import は不要です。

  ```ts
  const res = await fetch(...)
  //    ^^^
  //    fetch の戻り値 = Response オブジェクト（ブラウザが提供）
  ```

  `fetch()` はブラウザが標準で持っている機能で、戻り値として `Response` というオブジェクトを返します。この `Response` オブジェクトが最初から `json()` メソッドを持っています。

  C言語で例えると：

  ```c
  // FILE* を fopen で受け取ると、fread などのメソッドが使えるのと同じイメージ
  FILE* res = fopen(...);   // FILE構造体が返ってくる
  fread(buf, ..., res);     // FILE構造体が持つ操作を使う

  // JavaScript
  const res = await fetch(...)  // Response オブジェクトが返ってくる
  res.json()                    // Response が持つメソッドを使う
  ```

  `fetch` / `Response` / `json()` はすべてブラウザの標準機能なので import 不要です。

  ---
  質問2：res の中身をオブジェクトに変換して return しているか

  そうです。ただし正確には「`res` 全体」ではなく「`res` の中のボディ（本文）」を変換しています。

  ```ts
  const res = await fetch(...)
  // res の中身:
  //   res.ok      → 通信成功かどうか（true/false）
  //   res.status  → ステータスコード（200, 404 など）
  //   res.body    → サーバーが返したテキストデータ（本文）← これが対象

  return res.json()
  // res.body（テキスト）を読み取って JavaScript オブジェクトに変換して返す
  ```

  封筒で例えると：

  ```
  res = 封筒全体
    ├── res.ok     = 「正常に届いたか」のスタンプ
    ├── res.status = 「ステータスコード」
    └── res.body   = 封筒の中の手紙（JSON テキスト）

  res.json() = 手紙を取り出して読み込む
  ```

  ---
  まとめ

  ```
  json()        → import 不要。fetch の戻り値（Response）が最初から持っているメソッド
  res.json()    → res の本文（JSON テキスト）を JavaScript オブジェクトに変換して返す
  ```
