❯ `interface Props { initialMessage?: string onOpenCategories: () => void }` これよくわからないです。interface型みたいな感じですか？

● はい、C言語の構造体に近いです。

  ---
  interface = 「オブジェクトの型定義」

  ```ts
  interface Props {
    initialMessage?: string
    onOpenCategories: () => void
  }
  ```

  「`Props` という型は、こういうプロパティを持つオブジェクトです」という定義です。

  ---
  C言語の構造体と比較

  ```c
  // C言語
  typedef struct {
      char* initialMessage;        // 省略可能
      void (*onOpenCategories)();  // 関数ポインタ
  } Props;
  ```

  ```ts
  // TypeScript
  interface Props {
    initialMessage?: string      // ? = 省略可能
    onOpenCategories: () => void // 引数なし・戻り値なしの関数
  }
  ```

  やっていることはほぼ同じです。

  ---
  `type` との違い

  以前見た `type` と `interface` はほぼ同じ用途です。

  ```ts
  // どちらも「オブジェクトの型定義」
  type Props = { initialMessage?: string }
  interface Props { initialMessage?: string }
  ```

  細かい違いはありますが、今の段階では「同じもの」と思ってOKです。

  ---
  どこで使われているか

  ```ts
  export function ChatLayout({ initialMessage, onOpenCategories }: Props) {
  //                                                              ^^^^^^^
  //                          この引数が Props 型であることを宣言
  ```

  `ChatLayout` 関数の引数が `Props` 型であることを示しています。C言語で言えば：

  ```c
  void ChatLayout(Props props) {
      props.initialMessage;
      props.onOpenCategories();
  }
  ```

  ---

❯ ChatLayout の中で props が呼ばれている様子が見えないんですが、、、

● 引数の時点で分解されているからです

  `ChatLayout` の定義を見ると：

  ```ts
  export function ChatLayout({ initialMessage, onOpenCategories }: Props) {
  //                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                         Props オブジェクトを受け取りつつ、即座に分解している
  ```

  `props` という名前で受け取らず、**最初から中身を取り出して**います。

  ---
  C言語で例えると

  ```c
  // こう書く代わりに…
  void ChatLayout(Props props) {
      use(props.initialMessage);
      props.onOpenCategories();
  }

  // こう書いているイメージ
  void ChatLayout(Props props) {
      char* initialMessage = props.initialMessage;
      void (*onOpenCategories)() = props.onOpenCategories;
      // ↓ あとは直接使える
      use(initialMessage);
      onOpenCategories();
  }
  ```

  ---
  分割代入（復習）

  以前 `useState` で見た分割代入と同じ仕組みです。

  ```ts
  // useState の分割代入
  const [screen, setScreen] = useState(...)

  // props の分割代入
  function ChatLayout({ initialMessage, onOpenCategories }: Props) {
  ```

  オブジェクトの場合は `{}` で分解します。

  ---
  なので関数の中では直接使える

  ```ts
  export function ChatLayout({ initialMessage, onOpenCategories }: Props) {
    // props.initialMessage ではなく
    // initialMessage として直接使える
  }
  ```

  `props.xxx` と書く必要がなく、`xxx` だけで使えます。

  ---

❯ そしたら `function ChatLayout({ initialMessage, onOpenCategories }: Props)` とはせずに、普通に `function ChatLayout(initialMessage, onOpenCategories)` として（interface Propsの宣言も消して）しまったほうが効率がよさそうなんですが、なんでこんな面倒なことをするんですか？

● いい疑問です。理由は主に2つです。

  ---
  理由1：TypeScriptの型チェックのため

  ```ts
  // 型なし（あなたの案）
  function ChatLayout(initialMessage, onOpenCategories) {
    // initialMessage に数値を渡してもエラーにならない
  }

  // 型あり（現在のコード）
  function ChatLayout({ initialMessage, onOpenCategories }: Props) {
    // initialMessage は string しか渡せない
    // onOpenCategories は () => void しか渡せない
    // 違う型を渡すとビルド時にエラーになる
  }
  ```

  間違った値を渡したときに**コンパイルエラーで気づける**のが最大の理由です。

  ---
  理由2：引数が増えたとき順番を気にしなくていい

  ```ts
  // 引数が多い場合（あなたの案）
  function ChatLayout(initialMessage, onOpenCategories, onBack, title, loading) {
    // 呼ぶ側で順番を間違えると気づきにくい
  }

  // オブジェクトで渡す場合（現在のコード）
  <ChatLayout
    initialMessage={initialMessage}
    onOpenCategories={() => setScreen('category')}
  />
  // 順番関係なく、名前で指定できる
  ```

  C言語で引数が多い関数を呼ぶとき、順番を間違えて苦労した経験はありませんか？オブジェクトにまとめることでその問題がなくなります。

  ---
  まとめ

  ```
  引数バラバラ  → 型チェックなし・順番間違いのリスクあり
  Props にまとめる → 型チェックあり・名前で指定できる
  ```

  面倒に見えますが、コードが大きくなるほど恩恵が大きい書き方です。

  ---

❯ 理由２については `<ChatLayout initialMessage={initialMessage} onOpenCategories={...} />` としてもいいし、`<ChatLayout onOpenCategories={...} initialMessage={initialMessage} />` としてもいいみたいな感じですか？

● そのとおりです。どちらも同じ意味になります。

  ```tsx
  <ChatLayout
    initialMessage={initialMessage}
    onOpenCategories={() => setScreen('category')}
  />

  // ↕ 順番を入れ替えても全く同じ

  <ChatLayout
    onOpenCategories={() => setScreen('category')}
    initialMessage={initialMessage}
  />
  ```

  名前で指定しているので、順番は関係ありません。

  ---
  C言語で例えると

  ```c
  // C言語：順番が命
  ChatLayout(initialMessage, onOpenCategories);  // OK
  ChatLayout(onOpenCategories, initialMessage);  // 中身が逆になってバグ
  ```

  ```tsx
  // JSX：名前で指定するので順番自由
  <ChatLayout initialMessage={...} onOpenCategories={...} />
  <ChatLayout onOpenCategories={...} initialMessage={...} />  // 同じ
  ```

  C言語の関数呼び出しと比べると、この違いは大きいです。

  ---

❯ さっきの理由1：TypeScriptの型チェックのためについてなんですが、これは `function ChatLayout(initialMessage?:string, onOpenCategories: () => void)` としてはいけないんでしょうか？

● いけないわけではないですが、引数が増えるほど不便になります。

  ---
  型チェックだけなら同じことができます

  ```ts
  // これでも型チェックはできる
  function ChatLayout(initialMessage?: string, onOpenCategories: () => void) {

  // 現在のコード
  function ChatLayout({ initialMessage, onOpenCategories }: Props) {
  ```

  型チェックの観点だけでは、どちらも同じ効果です。

  ---
  ただし呼ぶ側で順番が固定される

  ```ts
  // 引数バラバラの場合：順番通りに渡さないといけない
  <ChatLayout
    initialMessage={initialMessage}
    onOpenCategories={() => setScreen('category')}
  />
  // ↑ この順番しか書けない
  ```

  ```ts
  // Props にまとめた場合：順番自由
  <ChatLayout
    onOpenCategories={() => setScreen('category')}
    initialMessage={initialMessage}
  />
  // ↑ 順番入れ替えてもOK
  ```

  ---
  引数が省略されたとき問題が起きる

  ```ts
  // initialMessage を省略して呼ぶ場合
  function ChatLayout(initialMessage?: string, onOpenCategories: () => void)

  // 省略すると第1引数がずれる
  ChatLayout(onOpenCategories)  // initialMessage に関数が入ってしまう
  ```

  `?` で省略可能にすると、後ろの引数がずれるリスクがあります。Props にまとめればこの問題は起きません。

  ---
  まとめ

  ```
  引数バラバラ + 型注釈  → 型チェックはできるが順番問題が残る
  Props にまとめる       → 型チェック + 順番自由 + 省略しても安全
  ```

  ---

❯ `type DisplayMessage = ChatMessage & { timestamp: Date read?: boolean }` `ChatMessage & {}` ってなんですか？

● `&` = 型を合体させる演算子です

  ---
  `ChatMessage` の中身（api.ts で定義）

  ```ts
  type ChatMessage = {
    role: 'user' | 'assistant'
    content: string
  }
  ```

  ---
  `&` で別の型を追加する

  ```ts
  type DisplayMessage = ChatMessage & {
    timestamp: Date
    read?: boolean
  }
  ```

  「`ChatMessage` の全プロパティ **＋** `timestamp` と `read` も持つ型」という意味です。

  展開して書くと同じ意味になります：

  ```ts
  type DisplayMessage = {
    role: 'user' | 'assistant'  // ChatMessage から
    content: string              // ChatMessage から
    timestamp: Date              // 追加
    read?: boolean               // 追加
  }
  ```

  ---
  C言語で例えると

  ```c
  // C言語では構造体の継承はないので、手で全部書くしかない
  typedef struct {
      char* role;
      char* content;
      time_t timestamp;  // 追加
      int    read;       // 追加
  } DisplayMessage;
  ```

  `&` を使うと「既存の型を再利用しつつ拡張できる」のがTypeScriptの便利なところです。

  ---
  なぜ分けているのか

  ```
  ChatMessage    → APIとの通信で使う型（api.ts で定義）
  DisplayMessage → 画面表示で使う型（timestamp・read を追加）
  ```

  APIから受け取るデータと、画面に表示するデータで必要なプロパティが違うため、`ChatMessage` を基にして `DisplayMessage` を作っています。

  ---

❯ なぜ分けているのか、といいつつ、現在 chat-layout.tsx 以外のファイル（api.ts を含む）では ChatMessage が使われている痕跡が見えないのですが、これでも定義を分ける必要があるんでしょうか？

● 鋭い指摘です。現状では `ChatMessage` は `chat-layout.tsx` の中でしか使われていません。

  実際に検索すると：

  ```
  api.ts          → export type ChatMessage の定義のみ
  chat-layout.tsx → import して DisplayMessage の基にしているだけ
  ```

  ---
  正直に言うと「現時点では分ける必要はない」です

  ```ts
  // chat-layout.tsx にまとめて書いても動く
  type DisplayMessage = {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    read?: boolean
  }
  ```

  これで同じ結果になります。

  ---
  それでも分けている理由（設計の意図）

  **「APIとのやり取りの形」はAPIファイルで定義する**という設計方針によるものです。

  将来的に他のファイルでもAPIのデータを扱う場合、`api.ts` から `ChatMessage` を import するだけで済みます。今は1か所しか使っていなくても、拡張を見越して分けています。

  ---
  まとめ

  ```
  現時点の必要性  → なくても動く
  設計の意図      → 「API の型は api.ts で管理する」という方針
  ```

  「今は不要だが、将来のために分けている」という判断です。こういった設計上の選択は正解が1つではなく、チームや状況によって変わります。

  ---

❯ `const [messages, setMessages] = useState<DisplayMessage[]>([makeInitialMessage()])` `([makeInitialMessage()])` とは、makeInitialMessage() の戻り値が初期値になるということですか？

● そうです、正確に理解しています。

  ---
  分解すると

  ```ts
  useState<DisplayMessage[]>([makeInitialMessage()])
  //       ^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^
  //       型：DisplayMessageの配列  初期値
  ```

  ---
  初期値の部分を詳しく見ると

  ```ts
  [makeInitialMessage()]
  // ^^^^^^^^^^^^^^^^^^
  // makeInitialMessage() を呼んだ戻り値を
  // [] で配列に入れている
  ```

  `makeInitialMessage()` を呼ぶと `DisplayMessage` が1つ返ってくるので、それを配列に入れて初期値にしています。

  ---
  つまり初期状態は

  ```ts
  [
    {
      role: 'assistant',
      content: 'こんにちは。ここは、あなたの気持ちに寄り添う場所です。...',
      timestamp: new Date(),
    }
  ]
  ```

  メッセージが1件だけ入った配列が最初の状態です。

  ---
  C言語で例えると

  ```c
  DisplayMessage initial[1];
  initial[0] = makeInitialMessage();  // 関数の戻り値を配列の初期値に

  // useState に渡すイメージ
  State messages = createState(initial);
  ```

  チャット画面を開いた瞬間にAIの最初のメッセージが表示されているのは、この初期値があるためです。

  ---

❯ ではこの場合、`useState<DisplayMessage[]>([makeInitialMessage()])` を実行した時には DisplayMessage[0] には DisplayMessage 型、つまり `type DisplayMessage = { role: 'user' | 'assistant' content: string timestamp: Date read?: boolean }` が入っているということですか？

● そうです、正確です。

  ---
  初期状態のイメージ

  ```ts
  messages = [
    {                                    // DisplayMessage[0]
      role: 'assistant',                 // role
      content: 'こんにちは。ここは...',  // content
      timestamp: new Date(),             // timestamp
      // read は ? なので省略されている
    }
  ]
  ```

  `makeInitialMessage()` の定義を見ると：

  ```ts
  const makeInitialMessage = (): DisplayMessage => ({
    role: 'assistant',
    content: 'こんにちは。ここは、あなたの気持ちに寄り添う場所です。...',
    timestamp: new Date(),
  })
  ```

  `read` は省略可能（`?`）なので入っていません。それ以外の3つが入った状態です。

  ---
  C言語で例えると

  ```c
  DisplayMessage messages[1];

  messages[0].role      = "assistant";
  messages[0].content   = "こんにちは...";
  messages[0].timestamp = time(NULL);
  // messages[0].read は未設定
  ```

  ---
  その後メッセージが増えると

  ```ts
  messages = [
    { role: 'assistant', content: 'こんにちは...', timestamp: ... },  // [0] 初期メッセージ
    { role: 'user',      content: '相談したい',    timestamp: ... },  // [1] ユーザーの入力
    { role: 'assistant', content: 'どうぞ...',     timestamp: ... },  // [2] AIの返信
  ]
  ```

  会話が進むにつれて配列に要素が追加されていきます。

  ---

❯ この read は必要ですか？

● 使われています。**既読マーク（✓✓）** のために使っています。

  ---
  どこで使われているか

  `chat-layout.tsx` の2か所に出てきます。

  **① ユーザーのメッセージを既読にする**

  ```ts
  { ...prev[prev.length - 1], read: true }  // 69行目
  ```

  AIの返信が届いたタイミングで、直前のユーザーメッセージに `read: true` をセットしています。

  **② 画面に✓✓を表示する**

  ```ts
  {isUser && message.read && (
    <span className="text-[10px] text-blue-400">✓✓</span>  // 330行目
  )}
  ```

  `read` が `true` のユーザーメッセージにだけ ✓✓ を表示しています。

  ---
  流れで見ると

  ```
  ユーザーがメッセージ送信
    ↓
  read なし（未読）の状態で表示
    ↓
  AIから返信が届く
    ↓
  read: true をセット → ✓✓ が表示される
  ```

  LINEの既読マークと同じ仕組みです。

  ---
  `?` がついている理由

  ```ts
  read?: boolean
  ```

  AIのメッセージには `read` は不要（AIの発言に既読マークはつかない）なので、省略可能にしています。

  ---

❯ `const [input, setInput] = useState('')` `useState('')` ってなんですか？

● `useState('')` = 空文字列を初期値にした state

  ---
  今まで見てきた `useState` と並べると

  ```ts
  useState<Screen>('welcome')        // 初期値: 'welcome'
  useState<string | undefined>()     // 初期値: undefined
  useState<DisplayMessage[]>([...])  // 初期値: メッセージの配列
  useState('')                       // 初期値: '' （空文字列）
  ```

  `''` は「何も入っていない文字列」です。

  ---
  型注釈がない理由

  ```ts
  useState('')
  // useState<string>('') と同じ意味
  ```

  `''` を渡すと TypeScript が「これは string だ」と自動で推論するので、`<string>` を省略できます。

  ---
  `input` は何に使われているか

  チャット画面の**テキスト入力欄の中身**です。

  ```ts
  <textarea
    value={input}                               // 入力欄の表示内容
    onChange={(e) => setInput(e.target.value)}  // 文字を打つたびに更新
  />
  ```

  ユーザーが文字を打つたびに `setInput` で更新され、送信したら `setInput('')` で空に戻します。

  ---
  C言語で例えると

  ```c
  char input[256] = "";  // 最初は空文字列

  // 文字が打たれるたびに更新
  strcpy(input, new_value);

  // 送信したら空に戻す
  strcpy(input, "");
  ```

  ---

❯ `const bottomRef = useRef<HTMLDivElement>(null)` useRef ってなんですか？

● useRef = 「再描画を起こさずに値を保持する」仕組み

  ---
  `useState` との違い

  ```ts
  const [loading, setLoading] = useState(false)  // 変えると再描画される
  const bottomRef = useRef<HTMLDivElement>(null)  // 変えても再描画されない
  ```

  `useRef` で持った値を変えても画面の再描画が起きません。

  ---
  `useRef` の中身

  ```ts
  const bottomRef = useRef<HTMLDivElement>(null)
  //                       ^^^^^^^^^^^^^^  ^^^^
  //                       型              初期値
  ```

  `bottomRef.current` に値が入ります。

  ```ts
  bottomRef.current  // → 最初は null
  ```

  ---
  `bottomRef` の使われ方

  ```ts
  // JSX の中で div に紐付けている
  <div ref={bottomRef} />

  // useEffect の中でスクロールしている
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  ```

  「この `div` 要素そのものを JavaScript から操作したい」というときに `useRef` で要素を掴んでおきます。

  ---
  C言語で例えると

  ```c
  // DOM要素へのポインタを持っておくイメージ
  HTMLDivElement* bottomRef = NULL;

  // 要素が作られたら代入
  bottomRef = get_element("bottom-div");

  // スクロール操作
  scroll_into_view(bottomRef);
  ```

  要素へのポインタを保持しておいて、後から操作する、という感覚です。

  ---
  chat-layout.tsx での useRef 一覧

  ```ts
  const bottomRef      = useRef<HTMLDivElement>(null)     // チャット末尾のdiv
  const textareaRef    = useRef<HTMLTextAreaElement>(null) // 入力欄
  const initialSentRef = useRef(false)                    // 初回送信済みフラグ
  ```

  `bottomRef` と `textareaRef` はDOM要素の操作、`initialSentRef` は再描画不要な変数として使っています。

  ---

❯ `useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])` useRef、useEffect、useState の違いが分からなくなってきました。

● 整理します。3つは役割が全然違います。

  ---
  一言で言うと

  ```
  useState   → 「画面に表示する値」を管理する
  useRef     → 「画面に関係ない値・DOM要素」を保持する
  useEffect  → 「特定のタイミングで処理を実行する」
  ```

  ---
  useState：値が変わると再描画される

  ```ts
  const [loading, setLoading] = useState(false)
  ```

  - 値を変えると**画面が更新される**
  - 「画面に表示したい値」はこれを使う

  ```
  loading が true になる  → ローディング表示が出る
  loading が false になる → ローディング表示が消える
  ```

  ---
  useRef：値が変わっても再描画されない

  ```ts
  const bottomRef      = useRef<HTMLDivElement>(null)
  const initialSentRef = useRef(false)
  ```

  - 値を変えても**画面は更新されない**
  - 「DOM要素の操作」や「再描画不要な変数」に使う

  ```
  bottomRef.current      → div要素そのものを持っている
  initialSentRef.current → 初回送信済みかどうかのフラグ（画面に表示しない）
  ```

  ---
  useEffect：処理を実行するタイミングを制御する

  ```ts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  ```

  - 値を保持するのではなく**処理を実行する**
  - 第2引数で「いつ実行するか」を制御する

  ```
  [] なし    → 毎回実行
  []         → 最初の1回だけ
  [messages] → messages が変わるたびに実行
  ```

  ---
  C言語で例えると

  ```c
  // useState → グローバル変数（変えると画面更新）
  bool loading = false;

  // useRef → ポインタ（変えても画面更新なし）
  HTMLDiv* bottomRef = NULL;

  // useEffect → 特定条件で呼ばれるコールバック
  void on_messages_changed() {
      scroll_to_bottom(bottomRef);
  }
  ```

  ---
  このuseEffectの意味

  ```ts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  ```

  「`messages` が変わるたびに（新しいメッセージが届くたびに）、チャットの一番下までスクロールする」という処理です。

  ---

❯ `current?` のハテナってなんですか？

● `?.` = 「nullじゃなければ実行する」という演算子です

  ---
  `?` がない場合との違い

  ```ts
  bottomRef.current.scrollIntoView(...)   // current が null だとエラーになる
  bottomRef.current?.scrollIntoView(...)  // current が null なら何もしない
  ```

  `?.` は「左がnull/undefinedなら、そこで止まって何もしない」という意味です。

  ---
  なぜ null になりうるのか

  ```ts
  const bottomRef = useRef<HTMLDivElement>(null)
  //                                       ^^^^
  //                                       初期値が null
  ```

  コンポーネントが最初に作られた瞬間、まだDOMの `div` 要素が存在しないので `null` です。要素が画面に表示されると `current` に実際の要素が入ります。

  ---
  C言語で例えると

  ```c
  // ?. がない場合
  bottomRef->scrollIntoView(...);  // NULLポインタ参照 → クラッシュ

  // ?. がある場合
  if (bottomRef != NULL) {
      bottomRef->scrollIntoView(...);
  }
  ```

  C言語でNULLポインタを参照するとクラッシュするのと同じ危険を、`?.` で安全に回避しています。

  ---
  `?.` はチェーンして使える

  ```ts
  a?.b?.c?.d()
  // a が null なら止まる
  // b が null なら止まる
  // c が null なら止まる
  // 全部あれば d() を実行
  ```

  ネストしたオブジェクトを安全にたどるときに便利です。

  ---

❯ タイムアウトのチェック用なのに、`useEffect(() => operation, [])` になっているので１回しか呼ばれないということですか？

● いい気づきです。ただ、1回しか呼ばれないのは**useEffect自体**であって、タイマーの処理は毎秒動き続けます。

  ---
  仕組みを分解すると

  ```ts
  useEffect(() => {
    const interval = setInterval(() => {
      // ← これが1秒ごとに繰り返し呼ばれる
      setSecondsLeft(...)
    }, 1000)        // ← 1000ms = 1秒ごと
  }, [])            // ← useEffect 自体は最初の1回だけ
  ```

  ---
  流れで見ると

  ```
  アプリ起動
    ↓
  useEffect が1回だけ実行される
    ↓
  setInterval を登録する（1秒ごとに処理を繰り返すタイマーを起動）
    ↓
  あとは setInterval が勝手に1秒ごとに動き続ける
  ```

  `useEffect` は「タイマーを起動する」だけで、繰り返しているのは `setInterval` です。

  ---
  C言語で例えると

  ```c
  // main関数（1回だけ実行）
  int main() {
      // タイマーを登録する（1回だけ）
      set_interval(check_timeout, 1000);
      // あとはタイマーが勝手に動く
  }

  // タイマーに登録した処理（1秒ごとに呼ばれる）
  void check_timeout() {
      if (seconds_left <= 1) {
          redirect(SAFE_URL);
      }
      seconds_left--;
  }
  ```

  ---
  `return () => clearInterval(interval)` の意味

  ```ts
  return () => clearInterval(interval)
  ```

  チャット画面が閉じられたときにタイマーを止める後片付けです。止めないと画面が消えた後もタイマーが動き続けてしまいます。

  ---

❯ `return () => clearInterval(interval)` の意味、free関数的な感じですかね

● そうです、まさにそのイメージです。

  ---
  C言語の free との対応

  ```c
  // C言語
  int* p = malloc(sizeof(int));  // 確保
  free(p);                        // 後片付け

  // JavaScript
  const interval = setInterval(...)  // タイマー起動（リソース確保）
  clearInterval(interval)            // タイマー停止（後片付け）
  ```

  `malloc` で確保したものを `free` で解放するように、`setInterval` で起動したタイマーを `clearInterval` で停止しています。

  ---
  useEffect の後片付けの仕組み

  ```ts
  useEffect(() => {
    const interval = setInterval(...)        // 起動
    return () => clearInterval(interval)     // 後片付け関数を返す
  }, [])
  ```

  `return` で返した関数を React が**コンポーネントが消えるとき**に自動で呼んでくれます。

  ```
  チャット画面が表示される → setInterval 起動
  チャット画面が消える    → React が clearInterval を呼ぶ
  ```

  `free` を自分で呼ぶ代わりに、「消えるときにこれを呼んでね」と React に渡しておく形です。

  ---

❯ `clearInterval(interval)` のように、引数で interval を呼ぶのはなぜですか？`const interval` が setInterval() 関数そのものをさしているからですか？

● そうです、正確です。

  ---
  `const interval` の中身

  ```ts
  const interval = setInterval(() => { ... }, 1000)
  ```

  `setInterval` は実行すると**タイマーのID（識別番号）を返します**。`interval` にはそのIDが入っています。

  ---
  C言語で例えると

  ```c
  // タイマーを起動すると識別番号が返ってくる
  int interval = set_interval(callback, 1000);
  //  ^^^^^^^^
  //  タイマーのID（番号）

  // 止めるときはIDを渡す
  clear_interval(interval);
  //             ^^^^^^^^
  //             「このIDのタイマーを止めて」
  ```

  ---
  なぜIDが必要か

  タイマーは複数同時に動かせます。どのタイマーを止めるか特定するためにIDが必要です。

  ```ts
  const timerA = setInterval(funcA, 1000)  // タイマーA → ID: 1
  const timerB = setInterval(funcB, 2000)  // タイマーB → ID: 2

  clearInterval(timerA)  // ID:1 のタイマーだけ止める
  // timerB はまだ動いている
  ```

  ---
  まとめ

  ```
  setInterval(...)         → タイマーを起動してIDを返す
  const interval           → そのIDを保存
  clearInterval(interval)  → 「このIDのタイマーを止めて」と渡す
  ```

  `interval` はタイマー関数そのものではなく、「どのタイマーか」を示すIDです。

  ---

❯ `prev` ってなんですか？

● prev = 「現在の state の値」です

  ---
  setSecondsLeft の2つの使い方

  ```ts
  // 使い方1：値を直接渡す
  setSecondsLeft(300)

  // 使い方2：関数を渡す（prev が使える）
  setSecondsLeft((prev) => {
    return prev - 1
  })
  ```

  関数を渡すと、React が**現在の値を `prev` に入れて呼んでくれます**。

  ---
  `prev` の名前の由来

  `previous`（前の）の略です。「前の値」という意味で慣習的に `prev` と書きます。別の名前でも動きます。

  ```ts
  setSecondsLeft((current) => current - 1)  // 同じ意味
  setSecondsLeft((x) => x - 1)             // 同じ意味
  ```

  ---
  なぜ直接書かずに prev を使うのか

  ```ts
  // 直接書く場合（問題が起きる可能性がある）
  setSecondsLeft(secondsLeft - 1)

  // prev を使う場合（安全）
  setSecondsLeft((prev) => prev - 1)
  ```

  Reactは複数の更新が重なったとき、`secondsLeft` の値が古いままになることがあります。`prev` を使うと**必ず最新の値**を受け取れるので安全です。

  ---
  C言語で例えると

  ```c
  // prev を使うイメージ
  int update_seconds(int prev) {
      if (prev <= 1) {
          redirect(SAFE_URL);
          return 0;
      }
      return prev - 1;
  }

  // React が内部でこう呼ぶ
  secondsLeft = update_seconds(secondsLeft);
  ```

  ---

❯ JSXでhtmlっぽい文章がかけるって話がよくあると思うんですが、これってReturnの中だけの話なんですか？

● はい、`return` の中だけです。

  ---
  JSX が書ける場所

  ```ts
  export function ChatLayout(...) {
    // ここは普通のJavaScript
    const [messages, setMessages] = useState(...)
    const handleSend = () => { ... }

    return (
      // ここだけ JSX が書ける
      <div className="...">
        <SafetyModal />
        {screen === 'welcome' && <WelcomeScreen />}
      </div>
    )
  }
  ```

  ---
  なぜ return の中だけなのか

  Reactのコンポーネントは「画面に表示するものを返す関数」です。

  ```ts
  // コンポーネント = 「表示するものを返す関数」
  function ChatLayout() {
    return <div>...</div>  // ← 表示するものを返している
  }
  ```

  JSXは「表示するもの（UIの構造）」を書くための記法なので、**返す値の部分**にしか書きません。

  ---
  return の外に書こうとするとどうなるか

  ```ts
  function ChatLayout() {
    <div>これはエラー</div>  // ← return の外には書けない

    return (
      <div>これはOK</div>
    )
  }
  ```

  構文エラーになります。

  ---
  ただし変数に入れることはできる

  ```ts
  function ChatLayout() {
    // 変数に JSX を入れることはできる
    const header = <header>...</header>

    return (
      <div>
        {header}  {/* 変数として埋め込む */}
      </div>
    )
  }
  ```

  厳密には「return の中だけ」ではなく「JSXの値として扱える場所ならどこでも」ですが、基本は return の中に書くと覚えてOKです。
