# Next.js の認証について（調査資料 / チーム共有用）

> テーマ：**「ログインした人のみ Gemini と会話できる」機能を、Next.js の認証で実装できるか。できれば Google ログイン。**
> 目的：技術的な可否・方法を整理し、**今後の方向性**をチームで合意すること。

---

## 0. 3行まとめ

- **技術的には実装できる。** **Auth.js v5（旧 NextAuth）または Better Auth + Google** で「ログインしないとチャット不可」は実現可能（※2026年時点でAuth.jsはメンテナンスモード入り。新規は Better Auth も要検討 → 4章）。
- ただし本アプリは **DV相談アプリ**。技術判断より **「そもそもログイン必須にしてよいか」という設計判断のほうが重い**（→ 5章）。
- 進め方の推奨：**まず目的とDV安全性を合意 → BFF方式でPoC**。いきなり全体実装はしない。

---

## 1. まず「Next.js の認証」とは何か（前提の共有）

「Next.js の認証」と一口に言っても、実は **3つのレイヤー** に分かれます。ここを混同すると議論がかみ合いません。

| レイヤー | 何をするか | 今回の関心 |
|---|---|---|
| **認証 (Authentication)** | 「誰か」を確かめる（＝ログイン。Googleでサインイン等） | ◎ ここが本題 |
| **セッション管理 (Session)** | ログイン状態をリクエスト間で保持する（Cookie等） | ○ 付随して必要 |
| **認可 (Authorization)** | 「その人が操作してよいか」を判定（未ログインを弾く等） | ◎ 「ログイン者のみ」の肝 |

「ログインした人のみ Gemini と会話できる」＝ **認証（Google） + 認可（未ログインはチャットAPIを叩けない）** の組み合わせで実現します。

### Next.js での認証の選択肢

Next.js 自体は認証ライブラリを内蔵していません。方式は主に3つ：

1. **ライブラリを使う（推奨）** … Auth.js v5 / Clerk / Better Auth など。security-critical な部分を自作しない。
2. **自前実装** … Cookie・JWT・パスワードハッシュを全部自分で書く。学習にはなるが本番リスク大・非推奨。
3. **外部SaaSに丸投げ** … Clerk / Auth0 / Supabase Auth。速いが外部依存・コスト・データ所在の検討が必要。

今回は **1のAuth.js v5** を軸に説明します（後述の比較参照）。

---

## 2. 今のプロジェクト構成と、認証を入れる場所

認証を語る前に、**このプロジェクトの構成**を押さえる必要があります。ここが設計の一番のポイントです。

```
┌─────────────┐         ┌──────────────┐        ┌─────────┐
│  ブラウザ    │ ──────▶ │ Next.js 16   │        │ FastAPI │ ──▶ Gemini
│ (被害者)     │         │ (フロント)    │        │ (:8000) │
└─────────────┘         └──────────────┘        └─────────┘
                         React 19 / App Router    別コンテナ・別プロセス
                         認証ライブラリ：なし        認証：なし（無防備）
```

| 層 | 中身 | ファイル | 現状の認証 |
|---|---|---|---|
| フロント | Next.js 16.2.7 / App Router | `frontend/package.json` | **なし** |
| バックエンド | FastAPI → Gemini | `backend/app/api/v1/routes/chat.py` | **なし** |
| セッション | `sessionStorage` に匿名UUID | `frontend/src/lib/session.ts` | 匿名 |

### ⚠️ ここが最重要の落とし穴

**「Next.js にログインを付ける」だけでは、バックエンドは守られません。**

Gemini を呼んでいるのは **別プロセスの FastAPI**（`:8000`）。フロントに鍵をかけても、`curl` で直接 `POST :8000/api/v1/chat/messages` を叩けば **誰でも Gemini を使えてしまう**。

→ 「ログインした人のみ Gemini と会話できる」を本当に満たすには、**フロントの認証状態を、バックエンドのGemini呼び出しまで届ける**必要がある。これが3章のテーマ。

---

## 3. 実装アプローチ：バックエンド（Gemini）をどう守るか

分離構成なので、**2つの方式**があります。ここがチームの方向性決定の中心です。

### 方式A：BFF（Backend for Frontend）方式 ★推奨

フロントは FastAPI を直接叩かず、**Next.js のサーバー側（Route Handler）を経由**する。

```
ブラウザ ──▶ Next.js Route Handler ──▶ FastAPI ──▶ Gemini
              [ここで auth() 検証]     (サーバー間の内部通信)
              未ログインなら 401
```

- Next.js の `/app/api/chat/route.ts` の中で `auth()` を呼び、**未ログインは即401**。
- ログイン済みのときだけ、サーバー間通信で FastAPI に中継する。
- **メリット**
  - トークンがブラウザに露出しない（サーバー内で完結）。
  - FastAPI を外部に公開しなくてよくなる（内部ネットワーク化できる）。CORSも実質不要に。
  - **フロントの改修が小さい**：既存の `frontend/src/lib/api.ts` の向き先を `:8000` → `/api/chat` に変えるだけ。
- **デメリット**：Next.js 側に中継コードが増える。

### 方式B：JWT をバックエンドで検証する方式

Auth.js が発行した JWT をフロントから `Authorization` ヘッダで送り、**FastAPI 側でトークンを検証**する（`fastapi-nextauth-jwt` 等のライブラリあり）。

- **メリット**：バックエンドが独立して認可を判断できる。別チーム・別クライアントからFastAPIを叩く構成に向く。
- **デメリット**：フロント⇔バックで鍵・トークン仕様を共有する結合が増える。実装点が多い。

### 今回の推奨 → 方式A（BFF）

理由：フロント・バックエンドが **1チーム/1リポジトリ**、改修範囲が最小、トークン漏洩リスクが低い。マイクロサービス的に外部公開する予定がないなら A で十分。

### 補足：「Bは危険」ではない — 正確な理解

> よくある誤解：「Bだと個人情報が流出する」→ **言い過ぎ。** Bも正しく作れば安全で、世界中で普通に使われている正規の方式。

- **「トークンがブラウザに露出する」＝ "漏れる" ではなく "漏れうる経路が一つ増える"**（相対的なリスク）。
  Bが危ないのは「B自体」ではなく、**もしアプリに別の穴（XSS等）が空いたとき、その穴からトークンまで盗まれうる**という二段構えの話。穴が無ければ漏れない。
- **盗まれうるのはトークン（＝身分証明の合言葉）**で、本名や住所そのものではない。
  ただしトークンを盗まれる＝**なりすまし**が可能になり、結果として**本人しか見られない相談内容（会話履歴）を見られる**。DV相談アプリでは「会話内容を見られる」こと自体が最悪なので、**結果は深刻**。

| | 方式A | 方式B |
|---|---|---|
| トークンがブラウザに置かれる | 置かれない | 置かれる |
| 正常に動いている限り | 安全 | 安全 |
| 別の穴（XSS等）が空いた場合 | 盗む対象が無い | トークンを盗まれ→なりすましされうる |

**Aを推す理由は「Bが危険だから」ではなく「Aはリスク経路を一つ最初から減らせるから、この案件では得」**。
DV相談アプリは「見られること」の被害が特大なので、リスクを減らせるAが無難、という判断。

---

## 4. 技術スタックの選定（Auth.js v5 か Better Auth か）

> ⚠️ **2026年の重要な前提変化**：Auth.js（NextAuth）は **Better Auth に統合され、現在メンテナンスモード**（セキュリティパッチのみ・新機能なし・v5はbetaのまま）。
> **Auth.js の作者本人が「新規プロジェクトは Better Auth を推奨」と公式に案内**している（→ 一次出典は11章）。
> つまり「新規で認証を入れる」本件では、**Auth.js v5 と Better Auth のどちらを選ぶかが最初の分岐点**になった。

| ライブラリ | 特徴 | 今回の適性 |
|---|---|---|
| **Better Auth** | 型安全・自前ホスト。**2026年に活発開発中で公式が新規に推奨** | ◎ 将来性で本命。ただし日本語情報は少なめ |
| **Auth.js v5（NextAuth）** | 無料・自前ホスト。日本語の入門記事が豊富。**ただしメンテナンスモード（新機能なし・betaのまま）** | ○ 学習しやすいが将来性に難 |
| **Clerk** | UI込みで最速。管理画面が充実 | △ 外部SaaS依存・課金・データ所在の検討 |
| **自前実装** | 完全制御 | ✕ セキュリティリスク・非推奨 |

DV相談アプリという **データの外部依存を最小化したい** 性質からは、**自前ホストできる Better Auth または Auth.js v5** が候補。両者のトレードオフは：

- **将来性・公式推奨を重視 → Better Auth**（新規はこちらが2026年の標準。ただし日本語情報が少なく学習コストは上がる）
- **学習のしやすさ・情報量を重視 → Auth.js v5**（記事が多く着手は速いが、メンテナンスモードのライブラリに新規で乗るリスクを許容する必要）

> **判断の目安**：長く使う本番なら **Better Auth**。まず動くものを早く検証したいPoC段階なら Auth.js v5 で素振り、という二段構えも可。**ここは5章と同じくチームで握るべき論点**。
>
> ※以下の実装手順（7章）は **Auth.js v5 前提**で書いてある。Better Auth を選ぶ場合はAPI名（`auth()` 等）や設定ファイルが変わるため、公式ドキュメントに読み替えること。

### ✅ 今回の決定：Auth.js v5（`next-auth@beta`）で進める

上のトレードオフを踏まえ、**日本語の情報量・学習のしやすさを優先し、今回は Auth.js v5 を採用**する（Better Auth は将来の乗り換え候補として認識しておく）。

**「betaでも実用上は大丈夫」と言える根拠（＋出典）：**

1. **メンテナンスモードでも、セキュリティ修正は継続すると公式が明言している。**
   > "If you're using Auth.js/NextAuth.js today, you can continue doing so without disruption—we'll keep addressing security patches and urgent issues as they come up."
   — [Auth.js is now part of Better Auth（Better Auth公式ブログ, 2025-09-22）](https://better-auth.com/blog/authjs-joins-better-auth)
   > "We won't be doing any new feature work at Auth.js, but any critical bugs or security issues will still be patched for a while."
   — メンテナーの回答（[GitHub Discussion #9511, NextAuth公式リポジトリ](https://github.com/nextauthjs/next-auth/discussions/9511)）

2. **v5 は2023年から長期間、多数の本番アプリで使われてきた実績がある**（beta表記は「API調整中」の意味合いで、放置・不安定という意味ではない）。
   — [I tested every major auth library for Next.js in 2026（LogRocket）](https://blog.logrocket.com/best-auth-library-nextjs-2026/)

**⚠️ 正直な但し書き（誇張しないため）：**
- **公式が「production-ready」と明言した一次出典は存在しない**。上記1はあくまで「セキュリティは当面パッチする」であって「本番保証」ではない。
- 「安全」は**公式保証ではなく、①セキュリティ修正継続の明言＋②長年の実績、という積み上げ**での判断。
- **新機能は増えない**ので、将来的に新しい要件が出たら Better Auth への移行を検討する前提で採用する。

> まとめ：**今回はAuth.js v5で進めてOK。ただし「メンテナンスモードのbeta」であることは理解した上で、セキュリティ修正が続く点を根拠に採用する**、という位置づけ。

### Auth.js v5 + Google の要点（Next.js 16 特有の注意）

チームがハマりやすい点を先出しします：

- **v5 は v4 から大幅に変わった。** 設定は `auth.ts` に集約。`getServerSession` は廃止で `auth()` に統一。**ネットのv4記事はそのまま使えない**。
- **Next.js 16 で `middleware.ts` → `proxy.ts` にリネームされた。** Auth.js 公式ドキュメントはまだ `middleware.ts` 前提なので、**読み替えが必要**。
- 本番は **`AUTH_SECRET` 必須**（`npx auth secret` で生成）。無いと起動時エラー。
- Google Cloud 側で **リダイレクトURI**（`https://<ドメイン>/api/auth/callback/google`）の登録が必須。ローカルは `http://localhost:3000/...`。

導入の流れ（概念のみ・実装はしない）：
`next-auth@beta` 導入 → `auth.ts`（Googleプロバイダ設定）→ `app/api/auth/[...nextauth]/route.ts` → `proxy.ts` でチャット画面を保護 → サーバーコンポーネントで `auth()` からログインユーザーを取得。

---

## 5. ⚠️ DV相談アプリとしての最重要論点（技術より先に決めること）

**ここが本資料で一番伝えたい部分です。**

このリポジトリの設計思想は `delete.md` や `frontend/src/app/layout.tsx`（`noindex` / `no-referrer`）が示す通り、
**「加害者に見られない・痕跡を残さない・すぐ消せる」が最優先**。
ログイン必須化は、この根幹と **正面から衝突しうる**。

### 衝突する具体ポイント

- **Googleログイン ＝ 足がつくリスク（最重要）**
  ログインすると、被害者のGoogleアカウントの「アクティビティ」やブラウザのアカウント表示に **相談アプリの利用が残る**。加害者が端末・アカウントを監視しているケースでは **致命的** になりうる。
- **「すぐ閉じる／自動タイムアウト」との相性**
  せっかく会話履歴を消しても、**ログイン状態がCookieに残る**と再訪でバレる。ログアウト連動の設計が必要（`delete.md` の対策を認証込みで再検証すべき）。
- **利用ハードルの上昇**
  緊急時に「まずログイン」は離脱要因。**匿名で使える現状の価値**と天秤にかける必要がある。

### チームで先に握るべき問い（意思決定リスト）

1. **なぜログインが必要なのか？**
   （会話履歴の永続化？／不正利用・コスト対策？／有料化？／管理者向け機能？）
   → 目的次第では「Google必須」以外の解（匿名のまま継続 / 管理画面だけ認証）もありうる。
2. **必須にするか、任意にするか。**
   例：通常は匿名で使え、「履歴を残したい人だけログイン」等のオプトイン。
3. **Googleで痕跡が残る件をどう受容/緩和するか。**
   ゲスト利用を残す／ログアウトを目立たせる／プライバシー説明を出す 等。

> **結論の出し方**：まず1の「目的」を言語化する。目的が「Gemini呼び出しの不正利用防止」だけなら、Googleログイン必須よりも軽い手段（レート制限・BFF化・簡易トークン）で足りる可能性もある。

---

## 6. 今後の方向性（推奨ロードマップ）

**いきなり全体実装はしない。** 段階を踏む。

### Step 0：合意形成（実装前・最優先）
- 5章の「意思決定リスト」をチームで議論し、**ログインの目的と必須/任意を確定**。
- DV安全性（痕跡・すぐ閉じ）との折り合いを合意。

### Step 1：技術PoC（別ブランチ）
- Auth.js v5 + Google を **最小構成**で導入し、`/api/auth/signin` でGoogleログインできるところまで確認。
- Next.js 16 の `proxy.ts` 対応を実地で潰す。

### Step 2：バックエンド保護（方式A / BFF）
- `/app/api/chat/route.ts` を作り、`auth()` で未ログイン401 → FastAPI中継。
- `frontend/src/lib/api.ts` の向き先を `/api/chat` に差し替え。
- FastAPI を外部非公開（内部ネットワーク）にできるか検討。

### Step 3：DV安全性の再検証
- 「ログアウト × すぐ閉じる × 自動タイムアウト × BFCache復活」の組み合わせを実機確認。
- `delete.md` のチェック項目を **認証あり**の状態で再テスト。

---

## 7. 実装する場合のやることリスト（手順）

> 6章のロードマップを、実際に手を動かす順に具体化したもの。**方式A（BFF）** 前提。
> 各ステップは「終わったらチェック（`[ ]`→`[x]`）」して進める。**上から順番に**やるのが重要。

### フェーズ0：準備（コードを書く前）
1. `[ ]` **5章の意思決定を確定**（ログインの目的／必須か任意か／DV安全性の折り合い）。ここが未決だと手戻りする。
2. `[ ]` **作業ブランチを切る**（例：`feature/auth`）。`main` では作業しない。
3. `[ ]` **Google Cloud で OAuth クライアントIDを作成**。
   - 承認済みリダイレクトURI に `http://localhost:3000/api/auth/callback/google` を登録（ローカル用）。
   - 発行された **クライアントID / クライアントシークレット** を控える。

### フェーズ1：フロントにログインを付ける（Auth.js v5 + Google）
4. `[ ]` `frontend/` で **`npm i next-auth@beta`**。
5. `[ ]` **`AUTH_SECRET` を生成**（`npx auth secret`）し、`frontend/.env.local` に記入。
   - あわせて `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` も記入。`.env.local` は **git管理外**であることを確認（`.gitignore`）。
6. `[ ]` **`frontend/src/auth.ts`** を作成（Googleプロバイダを設定し、`handlers` / `auth` / `signIn` / `signOut` をexport）。
7. `[ ]` **`frontend/src/app/api/auth/[...nextauth]/route.ts`** を作成（`auth.ts` の `handlers` をexport）。
8. `[ ]` **動作確認**：`npm run dev` → `http://localhost:3000/api/auth/signin` でGoogleログイン画面が出て、ログインできること。
   - ✅ ここまでで「Googleログインが動く」状態。**まだGeminiは守られていない**点に注意。

### フェーズ2：ルート保護（未ログインを弾く）
9. `[ ]` **`frontend/src/proxy.ts`** を作成（※`src/` 構成なので `src/` 直下。Next.js 16。記事の `middleware.ts` は読み替え）。チャット画面を未ログイン時にログインへリダイレクト。
10. `[ ]` **動作確認**：ログアウト状態でチャット画面URLへ直接アクセス→ログインに飛ばされること。

### フェーズ3：バックエンド（Gemini）を守る ★ここが本丸
11. `[ ]` **`frontend/src/app/api/chat/route.ts`（BFF）** を作成。
    - 冒頭で `auth()` を呼び、**未ログインなら 401 を返す**。
    - ログイン済みのときだけ、サーバー側から FastAPI（`http://backend:8000/...`）へ中継する。
12. `[ ]` **`frontend/src/lib/api.ts` の向き先を差し替え**：`:8000` 直叩き → `/api/chat`（自分のBFF経由）。
13. `[ ]` **動作確認**：
    - ログイン済み → チャットが今まで通り動く。
    - 未ログインで `/api/chat` を叩く → 401。
    - ✅ ここで初めて「ログインした人のみGeminiと会話できる」が成立。
14. `[ ]`（任意・強く推奨）**FastAPI を外部非公開に**。`docker-compose.yml` の backend の `ports: - "8000:8000"` を外し、Next.jsコンテナからのみ到達可能にする。

### フェーズ4：DV安全性の再検証（この案件では必須）
15. `[ ]` **ログアウト連動**：「すぐ閉じる／自動タイムアウト」実行時にセッションCookieも消えるか確認（`safe-exit.ts` と認証の整合）。
16. `[ ]` **組み合わせ実機テスト**：「ログアウト × すぐ閉じる × 自動タイムアウト × BFCache（戻る）復活」を Chrome / Safari で確認。
17. `[ ]` **`delete.md` のチェック項目を認証ありで再テスト**（戻るでアプリ・会話が復活しないこと）。

### フェーズ5：本番前
18. `[ ]` Google Cloud に **本番ドメインのリダイレクトURI** を追加登録。
19. `[ ]` 本番環境変数（`AUTH_SECRET` / `AUTH_GOOGLE_*`）を設定。`AUTH_SECRET` はローカルと別値に。
20. `[ ]` レビュー（`/code-review` 等）→ `main` へPR。

> **各フェーズの「✅」で必ず動作確認**してから次へ。特にフェーズ1と3の間を飛ばすと「ログインは付いたがGeminiは無防備」という状態に気づけない。

---

## 8. 実装時の問題点・ハマりどころ（必読）

> 「動くものはできたのに、このアプリとしては危ない」状態を避けるための注意点一覧。
> 特に **A群（クイックイグジットとの衝突）** はこの案件固有で、見落とすと致命的。

### A群：既存のクイックイグジット機能との衝突 ★最重要

現状の `safeExit()`（[safe-exit.ts](frontend/src/lib/safe-exit.ts)）は `location.replace` で **画面を安全ページに置き換え・履歴エントリを上書き** するだけの設計（sessionStorage も Cookie も明示的には消さない）。
Auth.js のログイン状態（Cookie／サーバー）は **その外側** にあり `safeExit()` から触れられないため、「すぐ閉じる」しても確実に残る。

- **A-1. ログインCookieが残る（最重要）**
  「すぐ閉じる／自動タイムアウト」で画面と履歴は消えても、Auth.js の**暗号化セッションCookieは残る**。
  → 再度アプリを開くと**ログイン済みでチャットに直行**。今の匿名sessionStorageより状態が“しつこい”（ブラウザを閉じても残りうる）。**「痕跡を残さない」思想と正面衝突**。
  → 対策：`safeExit()` に**ログアウト（Cookie失効）を組み込む**。

- **A-2. `safeExit()` は一瞬で動く必要があるのに、`signOut()` は非同期**
  クイックイグジットは即 `location.replace` する設計。Auth.js標準の `signOut()` はエンドポイントを叩く非同期処理で、待つと**脱出が遅れる**。
  → 対策：`replace` の前に**Cookieをクライアント側で同期的に失効**させる等の工夫が要る（地味だが重要な設計ポイント）。

- **A-3. 会話履歴がユーザーに紐づくと消えない**
  現状の会話履歴はバックエンドのメモリに**セッションUUIDで一時保持**（[chat.py](backend/app/api/v1/routes/chat.py) の `chat_histories`）。
  ログインで**ユーザーIDに履歴を永続保存**すると、すぐ閉じても**サーバーに会話が残り**、再ログインで**過去の相談が復活**する。
  → 対策：履歴はユーザーに永続で紐づけない。紐づけるなら「すぐ閉じる時にサーバー側も消す」まで設計する。

- **A-4. OAuthの往復で履歴エントリが増え、「戻る」で復活しうる**
  `delete.md` が突き止めた過去のバグは「**余分な履歴エントリが戻るでの復活を招く**」こと。
  Googleログインは `アプリ→accounts.google.com→/api/auth/callback→アプリ` と往復して**履歴が増える**ため、同じ罠を再発させうる。
  → 対策：認証導入後に**「戻る」挙動を Chrome / Safari で再テスト**（`delete.md` のチェック項目を認証ありで再実施）。

- **A-5. セッションCookieがしつこい**
  既定だと一定期間ログインが持続する。
  → 対策：**「ブラウザを閉じたら消える」短命セッション**に寄せて、しつこさを下げる。

### B群：構成（フロント／バックエンド分離）に起因

- **B-1. バックエンド（Gemini）が無防備なまま完成扱いになる**
  入門記事は「フロントにログインが付いた＝完成」で終わる。だが Gemini は**別プロセスのFastAPI**（`:8000`）。
  フェーズ3（BFF）を飛ばすと、`curl` で直接叩けば**誰でもGeminiを使える**まま。
  → 対策：フェーズ1の直後にフェーズ3を必ず実施。可能なら `docker-compose.yml` の `ports: - "8000:8000"` を外し**外部非公開**に。

### C群：Next.js 16 / Auth.js v5 特有

- **C-1. `middleware.ts` → `proxy.ts` の読み替え**
  世の記事はほぼ全て `middleware.ts` 前提。本プロジェクトは **Next.js 16 なのでそのままでは動かない**。
- **C-2. v4 の記事が混在**
  Auth.js は v5 で破壊的変更。`getServerSession` 等は使えない。**v5（`auth()`）の記事を選ぶ**。
- **C-3. `AUTH_SECRET` 未設定で起動エラー**
  本番は必須（`npx auth secret` で生成）。ローカルと本番で**別値**にする。

### D群：Google / OAuth 設定

- **D-1. リダイレクトURI不一致（初心者が一番詰まる）**
  Google Cloud に `http://localhost:3000/api/auth/callback/google`（ローカル）と**本番ドメイン**の両方を登録。1文字でも違うと弾かれる。
- **D-2. Googleアカウントに痕跡が残る（アプリでは消せない）**
  ログインするとGoogleの「アクティビティ」に**サインイン記録が残る**。これはクイックイグジットでも**消せない**（アプリ外）。加害者がアカウントを監視するケースでは要注意（→ 5章の意思決定に直結）。

### E群：シークレット管理

- **E-1. `.env.local` の取り扱い**
  `AUTH_SECRET` / `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` を**gitに絶対コミットしない**（`.gitignore` 確認）。漏れると誰でもなりすませる。

> **総括**：バグより怖いのは「安全なつもりで痕跡が残る」こと。
> **A群（クイックイグジット連動）を満たさない限り、このアプリに認証を載せてはいけない** くらいの優先度で扱う。

---

## 9. 用語ミニ辞典（チーム共有用）

- **Auth.js / NextAuth**：Next.js向けの認証ライブラリ。v5で大幅刷新。**2026年時点でBetter Authに統合されメンテナンスモード**（新機能なし）。
- **Better Auth**：型安全な認証ライブラリ。Auth.jsを吸収し、**2026年は公式が新規プロジェクトに推奨**。
- **OAuth / Googleログイン**：パスワードを預からず「Googleで認証してもらう」仕組み。
- **セッション / Cookie**：ログイン状態を保持する仕組み。Auth.js は暗号化JWTをCookieに入れる方式が既定。
- **BFF (Backend for Frontend)**：フロント専用の中継サーバー層。ここで認証を効かせ、本体API（FastAPI）を守る。
- **JWT**：署名付きのトークン。改ざん検知でき、サーバー間で身元を渡せる。
- **`proxy.ts`**：Next.js 16 でリクエストを横取りして処理する仕組み（旧 `middleware.ts`）。ルート保護に使う。

---

## 10. 登場するファイル・関数の一覧（実在 / 新規作成 / ライブラリ提供）

> この資料に出てくるファイル名・関数名を「今あるもの／これから作るもの／ライブラリが用意するもの」で仕分けたもの。
> **②を「もう在る」と勘違いしない**ためのチェック用。

### ① 既に存在するもの（実物と一致）

| 参照 | 実体 |
|---|---|
| `frontend/package.json` | ✓ |
| [backend/app/api/v1/routes/chat.py](backend/app/api/v1/routes/chat.py) / `chat_histories` | ✓ |
| [frontend/src/lib/session.ts](frontend/src/lib/session.ts) / `getSessionId` `storeSessionId` | ✓ |
| [frontend/src/lib/safe-exit.ts](frontend/src/lib/safe-exit.ts) / `safeExit()` | ✓ |
| [frontend/src/lib/api.ts](frontend/src/lib/api.ts) | ✓ |
| [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx) | ✓ |
| `docker-compose.yml` / `ports: - "8000:8000"` / service名 `backend` | ✓ |
| `POST :8000/api/v1/chat/messages` | ✓（実在のエンドポイント） |

### ② まだ存在しない ＝ これから作るもの（7章で「作成」と明記）

- `frontend/src/auth.ts` … 未作成（フェーズ1・手順6）
- `frontend/src/app/api/auth/[...nextauth]/route.ts` … 未作成（手順7）
- `frontend/src/proxy.ts` … 未作成（手順9）
- `frontend/src/app/api/chat/route.ts`（BFF）… 未作成（手順11）
- `frontend/.env.local` … 未作成（手順5）
- `/api/chat` … 未作成（上記 `route.ts` を作ると生える）

### ③ 自分で書かず、ライブラリ（next-auth）が用意するもの

「関数名」として出てくるが**自作しない**もの。ここは誤解しやすい：

- `auth()` / `handlers` / `signIn()` / `signOut()` … `next-auth@beta` を入れて `auth.ts` から export される
- `/api/auth/signin` … Auth.js が自動で用意するURL
- `getServerSession` … v4の**旧**API（「使わない」という文脈での言及）
- `fastapi-nextauth-jwt` … 方式B用の外部ライブラリ

---

## 11. 参考リンク

### ライブラリ選定の一次出典（4章の根拠）
- [Auth.js is now part of Better Auth — GitHub Discussion #13252（NextAuth公式リポジトリ・作者balazsorban44）](https://github.com/nextauthjs/next-auth/discussions/13252)：**「新規に始めるなら Better Auth を勧める」**と作者本人が明言（2025-09-26）。
- [Auth.js is now part of Better Auth — better-auth.com（公式ブログ）](https://better-auth.com/blog/authjs-joins-better-auth)：**「新規プロジェクトは Better Auth を強く推奨」「既存はセキュリティパッチ継続」**（2025-09-22）。
- [V5 ready for production use? — GitHub Discussion #9511（公式リポジトリ）](https://github.com/nextauthjs/next-auth/discussions/9511)：メンテナーが**メンテナンスモード入り（新機能なし・重大バグ/セキュリティのみ対応）**と回答。※公式が「production-ready」と**明言した一次出典は存在しない**点に注意。

### 実装ハンズオン（※すべて Auth.js v5 前提）
- [Auth.js とは何か（v5・初心者向け）— Zenn/b13o](https://zenn.dev/b13o/articles/about-authjs)（**まず最初に読む概念編**。「Auth.jsとは何か・なぜ自作しないか」をCSRF・セッション・JWTの基礎とともに解説。※実装例はGitHubなのでGoogleの手順は下記で補う。認可・FastAPI連携は範囲外）
- [NextAuth.js（Auth.js v5）でGoogleログイン — ma-vericks](https://ma-vericks.com/blog/next-auth-js/)（**Step 1のハンズオン向け**。Auth.js v5 + Google を最小構成で動かす入門。※Next.js 14前提なので `middleware.ts` は本プロジェクトでは `proxy.ts` に読み替え、FastAPI連携は別途 3章参照）
- [Auth.js v5 with Next.js 16: Complete Guide (2026) — DEV](https://dev.to/huangyongshan46a11y/authjs-v5-with-nextjs-16-the-complete-authentication-guide-2026-2lg)
- [How to Add Auth.js (NextAuth v5) in Next.js 16 — DevStacked](https://devstacked.tech/blog/how-to-add-nextauth-in-nextjs-16)
- [Migrating to v5 — Auth.js 公式](https://authjs.dev/getting-started/migrating-to-v5)
- [Combining Next.js and NextAuth with a FastAPI backend](https://tom.catshoek.dev/posts/nextauth-fastapi/)
- [fastapi-nextauth-jwt — PyPI（方式B用ライブラリ）](https://pypi.org/project/fastapi-nextauth-jwt/)
- [I tested every major auth library for Next.js in 2026 — LogRocket](https://blog.logrocket.com/best-auth-library-nextjs-2026/)
