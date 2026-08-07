<div align="center">

# かり — DV被害者向け 相談チャットAI

**「誰にも相談できない」を、誰にも知られずに相談できるようにする。**

DV（ドメスティック・バイオレンス）被害者が、加害者と同じ家・同じ端末にいても安全に使えることを最優先に設計した、生成AIチャット相談サービスです。

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-Gemini_2.5_Flash-1C3C3C?logo=googlegemini&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## 目次

- [プロジェクト概要](#プロジェクト概要)
- [開発背景と課題設定](#開発背景と課題設定)
- [画面イメージ](#画面イメージ)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [システム構成](#システム構成)
- [技術的にこだわった点](#技術的にこだわった点)
- [ディレクトリ構成](#ディレクトリ構成)
- [セットアップ・起動方法](#セットアップ起動方法)
- [API仕様](#api仕様)
- [開発体制と担当範囲](#開発体制と担当範囲)
- [今後の課題](#今後の課題)

---

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| プロダクト名 | スーパーヒーロー（super_hero） |
| 種別 | チーム開発（5名） |
| 開発期間 | 2026年6月 〜 2026年8月（約2ヶ月） |
| 想定ユーザー | DV被害の当事者、および「これはDVなのか」と迷っている段階の人 |
| プラットフォーム | Webアプリケーション |
| リポジトリ構成 | モノレポ（frontend / backend / Docker構成を1リポジトリで管理） |

---

## 開発背景と課題設定

DV相談には、一般的なチャットサービスにはない固有の制約があります。

**課題1：相談したこと自体が危険になる**
被害者は加害者と生活空間・端末を共有しているケースが多く、閲覧履歴・ブラウザバック・タブの残留といった「使った痕跡」がそのままリスクになります。UIの使いやすさより先に、**痕跡を残さないこと**を設計要件の中心に据えました。

**課題2：相談窓口のハードルが高い**
電話相談は「声を出せる状況」でなければ使えず、開設時間の制約もあります。テキストで、24時間、匿名で、まず話を聴いてもらえる入口が必要だと考えました。

**課題3：AIが断定してはいけない領域である**
DVは法的・医療的判断が絡みます。AIが「それは違法です」「離婚すべきです」と断定することは、当事者を誤った判断に導く危険があります。**AIの役割を「傾聴と情報提供」に限定し、判断は専門機関へ確実に接続する**ことをプロンプト設計と免責表示の両面で担保しました。

この3点を、機能追加ではなく**アーキテクチャとUX設計そのもの**で解決することを開発の主眼としています。

---

## 画面イメージ

> スクリーンショットは `docs/screenshots/` に配置してください。

| 初期画面 | チャット画面 | DVチェックリスト |
|---|---|---|
| ![初期画面](docs/screenshots/welcome.png) | ![チャット画面](docs/screenshots/chat.png) | ![チェックリスト](docs/screenshots/checklist.png) |
| キャラクター・匿名モード表示・退出タイマー | AI応答・緊急連絡先・フッターアクション | 3分類24項目の自己チェック |

---

## 主な機能

### 安全機能（本プロダクトの中核）

| 機能 | 実装内容 |
|---|---|
| **すぐ閉じる（クイック退出）** | 全画面に常設。押下すると `location.replace()` で天気検索ページへ遷移し、**履歴エントリを上書きするためブラウザバックでも戻れない** |
| **自動退出タイマー** | 無操作から15分でクイック退出と同じ処理を自動実行。操作のたびにリセットされ、残り1分で警告表示に切り替わる |
| **BFCache対策** | Safari等で「戻る／進む」によりページがキャッシュ復元された場合、`pageshow` の `persisted` を検知して即座に安全なページへ脱出 |
| **匿名モード** | ユーザー識別はセッション単位のUUIDのみ。会員登録・個人情報の入力を一切要求しない |
| **localStorage不使用** | 同意状態・セッションIDはすべて `sessionStorage`。タブを閉じた時点で端末上から消える |
| **検索エンジン非登録** | `robots: noindex, nofollow` と `referrer: no-referrer` を指定し、遷移先に参照元を渡さない |
| **初回安全ガイド** | 初回アクセス時にシークレットモードの使い方・履歴削除方法を案内。Escキーや外側クリックでは閉じられず、明示的な確認を必須化 |
| **緊急連絡先の常設** | ヘッダーに警察（110）とワンストップ支援センター（#8891）への発信リンクを固定表示 |

### 相談機能

- **AIチャット相談** — Gemini 2.5 Flash による対話。会話履歴を保持した文脈のあるやりとりが可能
- **よくある相談（カテゴリ選択）** — 「生活費を渡してもらえない」「スマホをチェックされる」など8カテゴリ。**何を書けばいいか分からない状態でも相談を始められる**導線
- **DVチェックリスト** — 身体的／精神的／性的の3分類・計24項目。各分類には該当し得る刑法上の位置づけを併記。チェック結果がそのままAIへの相談メッセージとして送信され、自己認識から相談への移行を滑らかにする
- **「簡単に言うと？」** — AI応答が80文字を超えた場合にのみ表示される要約リクエストボタン。**精神的に余裕がない状態でも読める分量に落とせる**
- **免責表示** — 全画面下部に、AI回答が法的・医療的助言ではない旨を常時表示

---

## 技術スタック

### フロントエンド

| 分類 | 技術 | 選定理由 |
|---|---|---|
| フレームワーク | Next.js 16（App Router） | Route Handlerによりサーバーサイド処理を同一プロジェクトで完結でき、APIキーをブラウザに露出させないBFF層を追加コストなしで構築できるため |
| 言語 | TypeScript 5 | APIレスポンス型をフロント・バックエンド間で明示し、契約の齟齬をビルド時に検出するため |
| UI | React 19 | — |
| スタイリング | Tailwind CSS v4 | CSS変数によるデザイントークンと組み合わせ、配色をグローバルに一元管理 |
| UIコンポーネント | Radix UI（Dialog） | モーダルのフォーカストラップ・ARIA属性を標準準拠で担保するため |
| アイコン | Lucide React | — |

### バックエンド

| 分類 | 技術 | 選定理由 |
|---|---|---|
| フレームワーク | FastAPI 0.115 | Pydanticによる入出力バリデーションとOpenAPI自動生成により、フロントとのAPI仕様共有コストを削減 |
| 言語 | Python 3.12 | — |
| ASGIサーバー | Uvicorn | — |
| 設定管理 | pydantic-settings | 環境変数の型検証とデフォルト値を一箇所に集約 |
| LLM連携 | LangChain + Gemini 2.5 Flash | メッセージ抽象（System/Human/AI）により会話履歴の組み立てが宣言的に書け、`with_retry` でAPI不安定時の再試行を実装コストなしで確保 |

### インフラ・開発環境

- Docker / Docker Compose（frontend・backend・専用ネットワークを一括起動）
- Git / GitHub（`main ← develop ← feature/*` のブランチ戦略、Pull Requestベースのレビュー）

---

## システム構成

```
┌─────────────┐
│  ブラウザ    │  sessionStorage: session_id のみ保持
└──────┬──────┘  ※ APIキーは一切保持しない
       │  POST /api/chat
       ▼
┌─────────────────────────────┐
│  Next.js（App Router）       │
│  ├ React クライアント         │
│  └ Route Handler（BFF層）    │  ← ここで x-api-key を付与
└──────┬──────────────────────┘
       │  POST /api/v1/chat/messages
       │  header: x-api-key
       ▼
┌─────────────────────────────┐
│  FastAPI                     │
│  ├ verify_api_key（認証）     │
│  ├ check_rate_limit（流量制御）│
│  ├ chat_histories（会話保持）  │
│  └ 定期スイープ（TTL失効削除） │
└──────┬──────────────────────┘
       │  LangChain
       ▼
┌─────────────────────────────┐
│  Gemini 2.5 Flash            │
└─────────────────────────────┘
```

### リクエストの流れ

1. ブラウザは自ドメインの `/api/chat` にのみリクエストする（バックエンドを直接叩かない）
2. Next.js の Route Handler がサーバー側環境変数から `X_API_KEY` を読み、ヘッダーに付与して中継する
3. FastAPI が `secrets.compare_digest` でキーを検証（タイミング攻撃対策）
4. `session_id` 単位でレート制限を判定
5. 会話履歴にユーザー発言を追加し、システムプロンプトと結合してLLMへ送信
6. 応答を履歴に追記して返却。最終アクセス時刻を更新
7. バックグラウンドタスクがTTLを超えたセッションを履歴ごと破棄

---

## 技術的にこだわった点

### 1. APIキーをブラウザに一切露出させないBFF構成

**課題:** 当初はブラウザから直接FastAPIを呼び出していたため、認証キーを `NEXT_PUBLIC_` 環境変数に置く必要があり、DevToolsから誰でも読み取れる状態でした。

**対応:** Next.js の Route Handler をBFF層として挟み、ブラウザ → 自ドメイン → バックエンド、という2段構成に変更しました。

```ts
// frontend/src/app/api/chat/route.ts
export async function POST(req: Request) {
  const res = await fetch(`${BACKEND_URL}/api/v1/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.X_API_KEY ?? '',  // サーバー側でのみ解決される
    },
    body: await req.text(),
  })
  return new Response(await res.text(), { status: res.status, ... })
}
```

Docker Compose 上ではブラウザ向けURL（`localhost:8000`）とコンテナ間URL（`backend:8000`）が異なるため、`NEXT_PUBLIC_API_URL` と `API_URL` を分離して定義しています。**「どこで実行されるコードか」によって到達可能なネットワークが違う**という点を意識した設計です。

### 2. 「戻れないこと」を保証する退出処理

単純な `location.href` による遷移では履歴が積まれ、ブラウザバックで会話画面に戻れてしまいます。これは本プロダクトでは致命的な欠陥です。

- `location.replace()` を使い、現在の履歴エントリを**上書き**する
- 上記が成立する前提として、アプリ側で `pushState` による履歴エントリを積まない設計を維持する
- それでも Safari のBFCacheでページが復元されるケースがあるため、`pageshow` イベントの `persisted` フラグを保険として監視し、復元を検知したら再度脱出する

```tsx
// frontend/src/components/app-shell.tsx
useEffect(() => {
  const handlePageShow = (e: PageTransitionEvent) => {
    if (e.persisted) safeExit()   // BFCacheからの復元を検知
  }
  window.addEventListener('pageshow', handlePageShow)
  return () => window.removeEventListener('pageshow', handlePageShow)
}, [])
```

ブラウザの履歴管理仕様とキャッシュ挙動の差異まで踏み込んで、**「戻れない」を仕様として担保**した点が本実装の要点です。

### 3. 二段構えのレート制限

LLM APIは従量課金であり、無認証・匿名で公開する以上、コスト面の防御が不可欠です。`session_id` 単位で2種類の制限を同時に適用しています。

- **短期（バースト対策）** — `deque` による滑走窓方式。直近1分間のリクエスト時刻のみを保持し、古い記録は先頭から破棄するため、メモリ使用量が一定に保たれる
- **長期（総量対策）** — セッション生存期間中の累計リクエスト数に上限を設定

```python
# backend/app/core/rate_limit.py
while recent and now - recent[0] > timedelta(minutes=1):
    recent.popleft()                      # 窓から外れた記録を破棄
if len(recent) >= settings.rate_limit_per_minute:
    raise HTTPException(status_code=429, detail="...")
```

制限値は環境変数で外出しし、運用中に再デプロイなしで調整できるようにしています。

### 4. TTLベースのセッション自動失効

会話履歴をサーバー上に無期限に保持することは、プライバシー要件に反します。FastAPI の `lifespan` を用いて、アプリ起動と同時にバックグラウンドの掃除タスクを走らせています。

```python
# backend/app/main.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(cleanup_expired_sessions())
    yield
    task.cancel()   # シャットダウン時に確実に停止
```

失効時には会話履歴・最終アクセス時刻・レート制限カウンタの3つを揃えて破棄します。**片方だけ残ると、レート制限カウンタがメモリリークの原因になる**ため、後始末を1関数に集約しました。

### 5. 「断定させない」ためのプロンプト設計

法的・医療的判断を伴う領域であることを踏まえ、システムプロンプトで以下を明示的に制約しています。

- 断定的な言い切りを避け、「〜の可能性があります」といった幅を持たせた表現を使う
- 弁護士・医師・専門カウンセラーではないため、法的・医学的な断定判断はしない
- 危険な状況では110番・#8891への接続を案内する
- 個人を特定する情報は求めない

さらにカテゴリ選択時には、選択されたカテゴリをシステムプロンプトへ動的に追記し、文脈を保持したまま応答精度を高めています。プロンプトによる制約に加え、UI下部の常時免責表示という**二重の防御**を設けています。

### 6. 型で守るAPI境界

フロント・バックエンド双方でレスポンス形状を型定義し、齟齬を早期に検出できるようにしています。またHTTPステータスコードを用途名付きの定数として定義し（`RATE_LIMITED: 429`、`UPSTREAM_TIMEOUT: 504` など）、数値リテラルの散在を防いでいます。エラーレスポンスは FastAPI の例外ハンドラで `{ "error": { "code", "message" } }` 形式に統一しました。

---

## ディレクトリ構成

```
kari_superheroAI/
├── frontend/                       # Next.js（App Router）
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # エントリポイント
│       │   ├── layout.tsx          # noindex / no-referrer 設定
│       │   ├── globals.css         # デザイントークン（CSS変数）
│       │   └── api/chat/route.ts   # BFF層：APIキーを付与して中継
│       ├── components/
│       │   ├── app-shell.tsx       # ルート。BFCache復帰の監視
│       │   ├── chat-layout.tsx     # チャットUI・タイマー・送信処理
│       │   ├── safety-modal.tsx    # 初回安全ガイド
│       │   ├── category-modal.tsx  # よくある相談（8カテゴリ）
│       │   └── checklist-modal.tsx # DVチェックリスト（24項目）
│       ├── lib/
│       │   ├── api.ts              # API通信
│       │   ├── safe-exit.ts        # 退出処理
│       │   ├── session.ts          # sessionStorage 経由のID管理
│       │   └── constants.ts        # カテゴリ・緊急連絡先・タイマー値
│       └── types/
│           └── http_status_code.ts # ステータスコード定数
│
├── backend/                        # FastAPI
│   └── app/
│       ├── main.py                 # アプリ生成・CORS・定期スイープ
│       ├── core/
│       │   ├── config.py           # 環境変数（pydantic-settings）
│       │   ├── security.py         # APIキー検証
│       │   └── rate_limit.py       # レート制限
│       └── api/v1/routes/
│           ├── chat.py             # チャット・プロンプト・履歴管理
│           ├── session.py          # セッション
│           └── health.py           # ヘルスチェック
│
├── .docker/                        # Dockerfile（frontend / backend）
├── docker-compose.yml
└── start-dev.sh                    # ローカル一括起動スクリプト
```

---

## セットアップ・起動方法

### 前提条件

- Docker / Docker Compose（推奨）
- またはローカル環境に Node.js 20+ / Python 3.12+

### 1. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集します。

```env
# バックエンド
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Gemini APIキー（未設定の場合はスタブ応答で動作確認可能）
GOOGLE_API_KEY=your_gemini_api_key_here

# フロント・バックエンド間の共有APIキー
# 生成例: openssl rand -hex 32
X_API_KEY=

# レート制限（session_id単位）
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_SESSION_MAX=30

# フロントエンド
NEXT_PUBLIC_API_URL=http://localhost:8000   # ブラウザから叩くURL
API_URL=http://localhost:8000               # BFFからバックエンドへの接続先
                                            # ※ Docker利用時は http://backend:8000
```

> `GOOGLE_API_KEY` が未設定でもスタブ応答が返るため、**APIキーなしでUI・通信フロー全体の動作確認が可能**です。

### 2. 起動

**Docker（推奨）**

```bash
docker compose up
```

**ローカル起動**

```bash
# バックエンド
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# フロントエンド（別ターミナル）
cd frontend
npm install
npm run dev
```

**一括起動スクリプト**

```bash
./start-dev.sh   # backend / frontend を同時起動し、Ctrl+C で両方停止
```

### 3. アクセス

| — | URL |
|---|---|
| フロントエンド | http://localhost:3000 |
| バックエンドAPI | http://localhost:8000 |
| API ドキュメント（Swagger UI） | http://localhost:8000/docs ※`DEBUG=true` 時のみ公開 |

---

## API仕様

全エンドポイント（`/health` を除く）で `x-api-key` ヘッダーによる認証が必要です。

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/v1/chat/messages` | チャット送信（テキスト／カテゴリ／クイックリプライに対応） |
| POST | `/api/v1/chat` | チャット送信（シンプル版） |
| GET | `/api/v1/health` | ヘルスチェック |

### リクエスト例

```http
POST /api/v1/chat/messages
Content-Type: application/json
x-api-key: <shared-key>
```

```json
{
  "message": "最近パートナーの言動が怖くて…",
  "category": null,
  "quickReply": null,
  "session_id": null
}
```

### レスポンス例

```json
{
  "messages": [
    { "role": "user", "message": "最近パートナーの言動が怖くて…" },
    { "role": "ai",   "message": "そう感じているのですね。よければ、もう少し聞かせてください。" }
  ],
  "session_id": "3f2c1a8e-..."
}
```

`session_id` を `null` で送ると新規発行され、以降のリクエストで同じIDを渡すことで会話文脈が維持されます。

### エラーレスポンス

エラーは全て以下の形式に統一されています。

```json
{ "error": { "code": 429, "message": "リクエストが多すぎます。しばらく待ってから再度お試しください。（上限: 10回/分）" } }
```

| コード | 発生条件 |
|---|---|
| 400 | `message` / `category` / `quickReply` がいずれも未指定 |
| 401 | APIキーが不正または未指定 |
| 429 | レート制限（1分あたり、またはセッション累計）に到達 |
| 500 | サーバー側でAPIキーが未設定 |

---

## デザイン

DV相談という文脈を踏まえ、刺激の少ないベージュ×セージグリーンを基調とし、緊急要素のみを赤で明示するカラー設計としました。全色をCSS変数（デザイントークン）として `globals.css` に集約しています。

| 変数名 | 用途 | カラー |
|---|---|---|
| `--color-bg-primary` | 背景 | `#F5EFE0` |
| `--color-accent` | アクセント（セージグリーン） | `#5B8C6E` |
| `--color-bubble-user` | ユーザー吹き出し | `#D4E6DA` |
| `--color-bubble-ai` | AI吹き出し | `#F0EBE0` |
| `--color-danger` | 緊急・退出ボタン | `#C0392B` |

---

## 開発体制と担当範囲

5名によるチーム開発です。`main ← develop ← feature/*` のブランチ戦略を採り、全ての変更を Pull Request 経由でレビューしてからマージする運用としました。

---

## 今後の課題

現状の実装で認識している制約と、その対応方針を記載します。

| 課題 | 現状 | 対応方針 |
|---|---|---|
| セッションストアの永続性 | 会話履歴をプロセス内のメモリに保持しているため、複数プロセス構成やコンテナ再起動に耐えられない | Redis等の外部ストアへ移行し、TTLをストア側の機能で管理する |
| レート制限のスコープ | `session_id` 単位のため、IDを再発行すれば回避可能 | IPアドレス等との併用、およびストア共有による多重化対応 |
| 相談窓口検索 | UI上のボタンのみ実装、機能未実装 | 地域情報から公的支援窓口を検索する機能を追加 |
| 音声入力 | UI上のボタンのみ実装、機能未実装 | Web Speech API による入力に対応（声を出せない状況を考慮し、あくまで補助手段として） |
| 自動テスト | 未整備 | pytest によるレート制限・認証・セッション失効のテスト、およびE2Eテストを追加 |
| ストリーミング応答 | 応答を一括で受信しているため、長文時の待ち時間が長い | Server-Sent Events による逐次表示に対応 |
