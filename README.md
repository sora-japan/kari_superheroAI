# かり — DV相談サポートチャット

DV（ドメスティック・バイオレンス）被害者が安心して相談できるチャットAIサービスです。
プライバシーを最優先に設計されており、クイック退出・匿名モード・セッションタイマーなどの安全機能を備えています。

---

## 画面構成

```
ウェルカム画面 ──→ カテゴリ選択画面 ──→ チャット画面
  （初回表示）      （よくある相談）     （AI相談）
```

| 画面 | 説明 |
|---|---|
| ウェルカム | キャラクター表示・クイックメッセージ選択・テキスト入力 |
| カテゴリ選択 | 8種類の相談カテゴリから選択またはテキスト入力 |
| チャット | AIとの対話・タイマー・フッターアクションボタン |

---

## 安全機能

- **クイック退出** — 全画面に配置。押すと即座にGoogle天気検索へ遷移し、ブラウザの「戻る」でも戻れない
- **匿名モード** — セッションストレージのみ使用。localStorageへの書き込みなし
- **セッションタイマー** — チャット開始から5分でクイック退出と同じ動作が自動実行される
- **履歴操作防止** — `history.pushState` で「戻る」ボタンを無効化
- **安全ヒントモーダル** — 初回アクセス時にシークレットモード・閲覧履歴削除の方法を案内

---

## 技術スタック

### フロントエンド
| 項目 | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| UIコンポーネント | Radix UI (Dialog) |
| アイコン | Lucide React |

### バックエンド
| 項目 | 技術 |
|---|---|
| フレームワーク | FastAPI |
| 言語 | Python 3.12 |
| サーバー | Uvicorn |
| AI | Anthropic Claude API（Step 2 で統合予定） |

### インフラ
- Docker / Docker Compose

---

## セットアップ

### 前提条件
- Docker & Docker Compose
- または Node.js 20+ / Python 3.12+

## 開発フロー

新しく機能を作る際には、developブランチから切って個人のブランチを作ってください

(例)

```
git checkout develop
git checkout -b feature/sample
```

修正完了したらdevelopブランチに向けてプルリクを作ってください
完了したらdevelopからmainに向けてプルリクを作って反映してください

```
main <- develop <- 作業ブランチ
```

### 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集：

```env
ANTHROPIC_API_KEY=sk-ant-...   # Anthropic APIキー
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 起動方法

### Docker（推奨）

```bash
docker compose up
```

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- API docs: http://localhost:8000/docs

### ローカル起動

```bash
# バックエンド
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# フロントエンド（別ターミナル）
cd frontend
npm install
npm run dev
```

または専用スクリプトで一括起動：

```bash
./start-dev.sh
```

---

## ファイル構成

```
kari_screen/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # エントリポイント
│       │   ├── layout.tsx        # HTMLレイアウト（robots:noindex等）
│       │   └── globals.css       # デザイントークン・カラーパレット
│       ├── components/
│       │   ├── app-shell.tsx     # 画面遷移ステート管理
│       │   ├── welcome-screen.tsx    # ウェルカム画面
│       │   ├── category-screen.tsx   # カテゴリ選択画面
│       │   ├── chat-layout.tsx       # チャット画面
│       │   ├── safety-modal.tsx      # 初回安全確認モーダル
│       │   └── quick-exit.tsx        # クイック退出（レガシー）
│       └── lib/
│           └── api.ts            # バックエンドAPI通信
└── backend/
    └── app/
        ├── main.py               # FastAPIアプリ
        ├── core/config.py        # 環境変数管理
        └── api/v1/routes/
            ├── chat.py           # チャットエンドポイント
            └── health.py         # ヘルスチェック
```

---

## APIエンドポイント

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/v1/chat` | メッセージ送信・AI応答取得 |
| GET | `/api/v1/health` | ヘルスチェック |

### チャットリクエスト例

```json
POST /api/v1/chat
{
  "message": "最近パートナーの言動が怖くて...",
  "session_id": "optional-session-id"
}
```

```json
{
  "reply": "そう感じているのですね。...",
  "session_id": "xxx-xxx"
}
```

---

## カラーパレット

| 変数名 | 用途 | カラーコード |
|---|---|---|
| `--color-bg-primary` | 背景 | `#F5EFE0` |
| `--color-accent` | アクセント（セージグリーン） | `#5B8C6E` |
| `--color-bubble-user` | ユーザー吹き出し | `#D4E6DA` |
| `--color-bubble-ai` | AI吹き出し | `#F0EBE0` |
| `--color-danger` | 緊急・クイック退出 | `#C0392B` |

---

## 今後の実装予定（TODO）

- [ ] Anthropic Claude API 統合（チャットAI本体）
- [ ] DVチェックリスト機能
- [ ] 相談窓口検索機能
- [ ] キャラクターイラスト差し込み
- [ ] 音声入力対応
- [ ] セッションタイマーのユーザー設定
