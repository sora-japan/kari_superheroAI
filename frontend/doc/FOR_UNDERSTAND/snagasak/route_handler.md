# APIキーの送信をサーバー側に移した話 と Route Handler の解説

対象ファイル: `frontend/src/app/api/chat/route.ts`（新規）、`frontend/src/lib/api.ts`（変更）

---

## 第1部：今回やったこと

### きっかけ

`api.ts` の `sendChatMessages` にこう書かれていた。

```ts
const res = await fetch(`${API_BASE}/api/v1/chat/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x_api_key': "7NPZUmb7TbUksygDGxstHgw2SmKBx4y7"
  },
  ...
})
```

「これで backend に API キー渡せてる？」→ **渡せていなかった。**

### 問題1：ヘッダー名が違う

backend 側（`backend_certification` で追加された `app/core/security.py`）はこうなっている。

```python
async def verify_api_key(x_api_key: str = Header(default="", alias="x-api-key")) -> None:
```

`alias="x-api-key"` は **ハイフン**。フロントが送っていたのは `x_api_key` で **アンダースコア**。

HTTPヘッダー名は大文字小文字を区別しない（`Content-Type` と `content-type` は同じ）が、`-` と `_` は**完全に別の文字**。よって backend 側では「ヘッダーが来ていない」と判定され、`default=""` が使われて必ず 401 になっていた。

```
フロントが送る:  x_api_key: 7NPZ...
backendが探す:   x-api-key           ← 見つからない → "" → 401
```

なお `chat.py` は

```python
router = APIRouter(dependencies=[Depends(verify_api_key)])
```

とルーター全体に認証を掛けているので、`/chat` も `/chat/messages` も同じく弾かれる。

### 問題2：キーがブラウザに丸見え

これがより深刻だった。

`sendChatMessages` を呼んでいるのは `chat-layout.tsx` で、ファイル先頭に `'use client'` が付いている。つまりこの `fetch` は**ユーザーのブラウザ上で実行される**。

ブラウザで動くコードは、ビルドされて配信された JavaScript ファイルの中に文字列がそのまま入る。DevTools の Sources タブや、配信された `.js` を開けば誰でも読める。

```
サーバーで動くコード  → コードはサーバーから出ない → 秘密を書いてよい
ブラウザで動くコード  → コードが利用者に配られる   → 秘密を書いてはいけない
```

API キーは「このリクエストは正規のフロントエンドから来た」と証明するためのもの。それが誰でも読める状態だと、第三者が同じキーを付けて backend を直接叩けるので、認証の意味が消える。

backend の `.env.example` にも意図が書かれていた。

> フロントエンド(**Next.jsサーバー側**)とバックエンド間で共有するAPIキー

元々「Next.js のサーバー側で付ける」設計だった。

### 解決方針：間にサーバーを挟む

ヘッダー名だけ直しても問題2が残る。そこで **Next.js のサーバー側を経由させる**ことにした。

Next.js は「フロントエンドのフレームワーク」だが、実体はサーバープロセスでもある。ブラウザに HTML を配るサーバーが常に動いているので、そこに自前の API エンドポイントを生やせる。これが **Route Handler**。

```
【変更前】
  ブラウザ ──────(キー直付け・名前も違う)──────> backend:8000
     ↑
     キーがここに露出

【変更後】
  ブラウザ ──> /api/chat ──(x-api-key を付与)──> backend:8000
              (Next.jsサーバー)
                    ↑
                    キーはここに置く。ブラウザには渡さない
```

ブラウザ側のコードからキーが完全に消え、キーは Next.js サーバーのメモリ上（環境変数）にしか存在しなくなる。

**副次的な効果として CORS も消える。** 変更前はブラウザが `localhost:3000` から `localhost:8000` を叩いていたのでクロスオリジン通信であり、しかもカスタムヘッダー（`x-api-key`）付きなのでプリフライト（`OPTIONS` の事前問い合わせ）が発生していた。変更後はブラウザから見ると `/api/chat` という同一オリジンなので、CORS の仕組み自体が関与しなくなる。

### ディレクトリの深さについて

App Router では**ディレクトリ構造がそのまま URL になる**。

```
src/app/page.tsx                    →  /
src/app/api/chat/route.ts           →  /api/chat
src/app/api/chat/messages/route.ts  →  /api/chat/messages
```

つまり深さは「ネストしたかったから」ではなく「URL をそう決めたから」。今回はエンドポイントが1つなので浅い `api/chat` を採用した。

なお `api/` ディレクトリは Next.js が最初から用意しているものではない。Route Handler を作ると生えるだけで、慣習的にこの名前が使われている。

### なぜ `api/` の直下ではなく `chat/` の中なのか

`api/route.ts` としても動く。そうしなかったのは、**`chat` というディレクトリ名がそのままエンドポイントの名前になる**から。

```
src/app/api/route.ts        →  POST /api        ← 「api」という名前のエンドポイント
src/app/api/chat/route.ts   →  POST /api/chat   ← 「chat」という名前のエンドポイント
```

`route.ts` はファイル名が固定なので、**エンドポイントに名前を付けられる場所がディレクトリ名しかない。** `api/` 直下に置くと URL が `/api` になり、何の API なのかが名前から消えてしまう。

もう一つ実用的な理由として、**1つのセグメントに `route.ts` は1つしか置けない。** `api/route.ts` をチャット用に使うと `/api` という一等地が埋まる。後からセッション削除などの API を足したくなったときに、

```
src/app/api/chat/route.ts      →  /api/chat
src/app/api/session/route.ts   →  /api/session
```

と横に並べられる形にしておいた方が素直。`api/` は「ここから下は API」という仕切り、`chat/` が実際のエンドポイント名、という役割分担になっている。

（Next.js の制約として、同じセグメントに `page.tsx` と `route.ts` は共存できない。今回は `app/page.tsx` と `app/api/chat/route.ts` で階層が違うので問題ない。）

### 変更したファイル

| ファイル | 種別 | 内容 |
|---|---|---|
| `frontend/src/app/api/chat/route.ts` | 新規 | 中継役。ここで `x-api-key` を付ける |
| `frontend/src/lib/api.ts` | 変更 | 送信先を `/api/chat` に変更、キーの直書きを削除 |
| `docker-compose.yml` | 変更 | frontend サービスに `API_URL` と `X_API_KEY` を追加 |
| `.env.example` | 変更 | Frontend セクションに `API_URL` を追記 |

backend のコードには一切触れていない。

### 環境変数の整理

| 変数 | 読まれる場所 | 用途 |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ブラウザ | 既存。`checkHealth` が使う |
| `API_URL` | Next.js サーバー | 新規。中継先の backend |
| `X_API_KEY` | Next.js サーバー / backend | 新規。両者で同じ値を共有 |

**`NEXT_PUBLIC_` という接頭辞が重要。** Next.js はこの接頭辞が付いた環境変数だけをブラウザ向けのコードに埋め込む。付いていない `API_URL` と `X_API_KEY` はサーバー側でしか読めない。

だから `X_API_KEY` には絶対に `NEXT_PUBLIC_` を付けてはいけない。付けた瞬間、せっかくサーバーに移したキーがまたブラウザに配られてしまう。

### docker で `API_URL` だけ値が違う理由

`docker-compose.yml` の frontend サービスはこうなっている。

```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://localhost:8000   # ブラウザ用
  - API_URL=http://backend:8000                 # サーバー用 ← localhost ではない
  - X_API_KEY=${X_API_KEY}
```

同じ backend を指しているのに書き方が違うのは、**「誰から見た住所か」が違うから**。

```
ブラウザ（ホストPC上）から見た backend
  → localhost:8000
    （compose の ports: "8000:8000" でホストのポートに繋がっている）

Route Handler（frontendコンテナの中）から見た backend
  → backend:8000
    （Docker ネットワーク内ではサービス名が名前解決される）
```

コンテナ内の `localhost` は**そのコンテナ自身**を指す。frontend コンテナの中で `localhost:8000` に接続しようとすると、frontend コンテナ自身の8000番を見にいって「誰もいない」となり接続が失敗する。

`X_API_KEY=${X_API_KEY}` は「リポジトリ直下の `.env` から読んで渡す」という意味。既存の `GOOGLE_API_KEY` と同じ書き方。

### 動かす前の準備

**docker の場合** — リポジトリ直下に `.env` を作る。

```
X_API_KEY=<openssl rand -hex 32 で生成した値>
```

これで backend コンテナと frontend コンテナの両方に同じ値が渡る。

**ローカル起動（`npm run dev`）の場合** — `frontend/.env.local` を作る。

```
API_URL=http://localhost:8000
X_API_KEY=<backendと同じ値>
```

こちらはコンテナではないので `localhost` でよい。

---

## 第2部：route.ts のコード解説

全体はこれだけ。

```ts
const BACKEND_URL = process.env.API_URL ?? 'http://localhost:8000'

export async function POST(req: Request) {
  const body = await req.text()

  const res = await fetch(`${BACKEND_URL}/api/v1/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.X_API_KEY ?? '',
    },
    body,
  })

  return new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

やっていることは「受け取る → キーを足す → 転送する → 返ってきたものをそのまま返す」の4段階だけ。順に見ていく。

### 1行目：接続先の決定

```ts
const BACKEND_URL = process.env.API_URL ?? 'http://localhost:8000'
```

`api.ts` の1行目とまったく同じ形。

- `process.env.API_URL` — 環境変数を読む。C の `getenv("API_URL")` に相当
- `??` — 左が `null`/`undefined` なら右を使う

```c
char* env = getenv("API_URL");
char* BACKEND_URL = (env != NULL) ? env : "http://localhost:8000";
```

環境変数が未設定でも `localhost:8000` で動くようにしてある。

`api.ts` 側の `API_BASE` は `NEXT_PUBLIC_API_URL` を読んでいるが、こちらは `API_URL`。**別の変数を読んでいる**点に注意。ブラウザ用とサーバー用で見るべき住所が違う（docker の節で説明した通り）ため、意図的に分けている。

### 3行目：関数名が `POST` である意味

```ts
export async function POST(req: Request) {
```

Route Handler では、**エクスポートする関数名がそのまま HTTP メソッドに対応する**。

```ts
export async function GET(req: Request)     // GET /api/chat を処理
export async function POST(req: Request)    // POST /api/chat を処理
export async function DELETE(req: Request)  // DELETE /api/chat を処理
```

`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` が使える。定義していないメソッドで来たら Next.js が自動で `405 Method Not Allowed` を返す。

ルーティング表を書く必要はない。「ファイルの場所で URL が決まり、関数名でメソッドが決まる」という規約になっている。

引数 `req` の型 `Request` はブラウザにもある Web 標準の型で、import 不要。`fetch` の戻り値が `Response` だったのと対になっていて、こちらは「届いたリクエスト」を表す。

`async` が付いているのは中で `await` を使うから（`api.ts` の解説と同じ理由）。

### 4行目：リクエストボディを読む

```ts
const body = await req.text()
```

ブラウザが送ってきた JSON を**文字列のまま**取り出す。

ここで `req.json()`（オブジェクトに変換）を使っていないのは意図的。この Route Handler は中身に興味がなく、そのまま backend に横流しするだけなので、

```
req.json()  → 文字列をオブジェクトに変換 → 送るときまた文字列に戻す（二度手間・情報が変わる可能性）
req.text()  → 文字列のまま受けて、文字列のまま送る（そのまま素通し）
```

`text()` の方が素直で速い。将来「message が空なら弾く」のようなバリデーションを入れたくなったら、そのときに `json()` に変えればよい。

`await` が付くのは、ボディがネットワーク越しに少しずつ届くもので、読み終わるまで待つ必要があるため。

### 6〜14行目：backend へ転送

```ts
const res = await fetch(`${BACKEND_URL}/api/v1/chat/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.X_API_KEY ?? '',
  },
  body,
})
```

**この `fetch` は元々 `api.ts` にあったものとほぼ同じ。** 違うのは「実行される場所」だけで、ブラウザからサーバーに引っ越してきた。同じ `fetch` という関数がブラウザでも Node.js でも使える。

`'x-api-key'` はハイフン。今回の修正点そのもの。

`process.env.X_API_KEY ?? ''` — 環境変数からキーを読む。**この行がサーバーでしか実行されないことが、この設計全体の肝**。ブラウザに配られるコードにはこの文字列は含まれない。

`body,` は `body: body,` の省略形（プロパティ名と変数名が同じときに省略できる）。上で `req.text()` した文字列をそのまま渡している。

未設定時に `''`（空文字）を渡しているので、キーを設定し忘れると backend 側で 401 になる。「キーなしで素通し」にはならない。

### 16〜19行目：レスポンスを返す

```ts
return new Response(await res.text(), {
  status: res.status,
  headers: { 'Content-Type': 'application/json' },
})
```

backend から返ってきたものを、ブラウザ向けに詰め直して返す。

- `await res.text()` — backend のレスポンス本文を文字列で取得。ここでも中身を解釈せず素通し
- `status: res.status` — **ステータスコードを引き継ぐのが重要**。backend が 401 や 429（レート制限）を返したとき、ここで握りつぶして 200 にしてしまうと、`api.ts` の `if (!res.ok)` が反応せずエラーが表示されない
- `headers` — 中身が JSON であることをブラウザに伝える

`new Response(...)` はこれも Web 標準。`fetch` が受け取っていた `Response` オブジェクトを、今度は自分で作って返している。

```
api.ts では:      const res = await fetch(...)   ← Response を受け取る側
route.ts では:    return new Response(...)       ← Response を作る側
```

### 全体の流れ

```
ブラウザ（chat-layout.tsx → api.ts）
  │  POST /api/chat
  │  body: {"message":"こんにちは","session_id":null}
  ↓
Next.jsサーバー（route.ts）
  │  ① req.text() でボディを文字列として受け取る
  │  ② x-api-key を headers に足す      ← ここが今回の要
  │  ③ backend に転送
  ↓
backend（FastAPI）
  │  verify_api_key でキーを検証 → OK
  │  Gemini に投げて応答を作る
  ↓
Next.jsサーバー（route.ts）
  │  ④ 本文とステータスをそのままブラウザに返す
  ↓
ブラウザ
     res.json() で受け取って画面に表示
```

Route Handler は「キーを足す」以外は何もしていない。あえて薄く作ってあり、ロジックは backend に集約されたままになっている。

---

## 補足：`api.ts` 側の変化

```ts
// 変更前
const res = await fetch(`${API_BASE}/api/v1/chat/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x_api_key': "7NPZ..."
  },
  ...

// 変更後
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  ...
```

URL が `/api/chat` と**スラッシュ始まりの相対パス**になった。これは「今表示しているページと同じオリジン」を意味する。ブラウザが `http://localhost:3000` を開いているなら `http://localhost:3000/api/chat` に解決される。

ホスト名を書かなくてよくなったので、`API_BASE` を使う必要もなくなった。本番環境にデプロイしてドメインが変わっても、この行は書き換え不要になる。

なお `checkHealth` は `API_BASE` を使ったまま残してある。backend の `/health` には認証が掛かっていない（`health.py` のルーターに `verify_api_key` が付いていない）ので、中継する必要がないため。将来 health にも認証を広げるなら、こちらも Route Handler 経由にする必要がある。

---

## 補足：作業ブランチについて

この作業は当初 `main` から切ったブランチで進めていたが、途中で `backend_certification` を親にして切り直した。理由は2つ。

- main の backend には `verify_api_key` が無いため、**認証が効いているかを検証できない**。401 → 200 の確認には backend 側の実装が必要
- `.env.example` の `X_API_KEY` などの行を両ブランチが二重に追加する形になり、マージ時の衝突リスクがあった。親にすればその行は最初から存在するので `API_URL` を足すだけで済む

結果として `.env.example` の差分は12行から4行に減った。

---

## 検証結果

docker compose で実際にリクエストを飛ばして確認した。`GOOGLE_API_KEY` は未設定なので backend は Gemini を呼ばず `（テスト応答）...` というスタブを返す。認証の確認にはこれで十分。

| # | 内容 | 結果 |
|---|---|---|
| ① | backend 直叩き・キーなし | 401 |
| ② | backend 直叩き・誤ったキー | 401 |
| ③ | backend 直叩き・正しいキー | 200 |
| ④ | backend 直叩き・`x_api_key`（アンダースコア）・**値は正しい** | **401** |
| ⑤ | `localhost:3000/api/chat` 経由（キーを付けずに送信） | 200 |
| ⑥ | 空メッセージを Route Handler 経由で送信 | 400 |
| ⑦ | ブラウザに配信される JS 内の API キー | 検出なし |

**④が今回の核心。** 値が正しくてもハイフンでなければ 401 になることが実測できた。これが元の実装が動かなかった原因そのもの。

⑤はブラウザと同じくキーを一切付けずに送って 200 が返っている。Route Handler がサーバー側でキーを付与できている証拠。

⑥は `status: res.status` が効いていることの確認。backend が返した 400 がそのままブラウザまで届いている。

⑦は「検索が空振りしただけ」ではないことを対照実験で担保した。同じファイル（配信された JS チャンク）から `sendChatMessages`・`/api/chat`・`localhost:8000` は検出されるのに、キーの値と `x-api-key` という文字列は 0 件だった。自分たちのコードは確かにバンドルに含まれているが、キーだけが含まれていない状態。

### 検証時にハマった点

`docker-compose.yml` は `container_name` を固定しているため、同じリポジトリを複数の場所にクローンしていると**コンテナ名が衝突して起動できない**。今回は別クローン（`/Users/sora/superhero/checktimeout`）の停止済みコンテナとぶつかった。そちらに触れずに検証するため、コンテナ名だけ上書きするオーバーライドファイルを使って別プロジェクト名で起動した。

```
docker compose -p mainverify -f docker-compose.yml -f <override>.yml up -d
```

---

## 残っている課題

- `route.ts` と、このドキュメント自体が新規ファイルなので `git add` が必要
- 直書きされていたキーはコミット前だったので Git 履歴には残っていない。ただ一度平文で出回っているため、本番用には別の値を生成すること
- `checkHealth` はブラウザから backend を直接叩いたままなので、CORS の設定は引き続き必要
