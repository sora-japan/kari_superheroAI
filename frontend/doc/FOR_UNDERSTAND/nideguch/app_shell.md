 useEffectってなんですか

● useEffect = 「画面が表示されたタイミングで処理を走らせる仕組み」

  ---
  コードで見ると

  useEffect(() => {
    history.pushState(null, '', window.location.href)
    const handlePopState = () => history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  これは「AppShell が画面に表示された瞬間に、この処理を1回だけ実行する」という意味です。

  ---
  C言語で例えると

  int main() {
      // 起動直後に1回だけ実行する処理
      history_pushState(...);
      addEventListener("popstate", handlePopState);
  }

  main() の先頭に書く「起動時の初期化処理」に近いです。

  ---
  引数は2つ

  useEffect(
    () => { ... },  // 引数1: 実行したい処理（関数）
    []              // 引数2: 依存配列（[] = 最初の1回だけ）
  )

  [] が空なので「最初に1回だけ実行、以降は実行しない」という意味になります。

  ---
  return () => ... は後片付け

  return () => window.removeEventListener('popstate', handlePopState)

  「AppShell が画面から消えるときに、登録したイベントを解除する」処理です。

  C言語で言えば free() に近い、後片付けです。

  ---
  なぜ useEffect が必要か

  Reactのコンポーネントは何度でも再実行される可能性があります。そのため「最初の1回だけやり
  たい処理」を普通に書くと何度も実行されてしまいます。

  useEffect(..., []) と書くことで「最初の1回だけ」を保証できます。

  ---

❯ useEffect((a) => {b}, [c])という構造かなと思うんですが、いくつか質問があります。
  ・この時のaは名前を定義しておらず帰り値を持たない関数として定義されていると思うんですが
  、これって後から呼び出すことはないんですか？もしそうならなぜ() =>
  で関数が定義されているんですか？
  ・bに書かれた処理はuseEffect()を呼び出すごとに出てくるんですか？それとも{b}にくくられた
  処理だけがcの依存配列（この場合は最初の１回だけ<-？）に応じて出てくる、みたいな実行タイ
  ミングを操作できるということですか？

● いい質問です。2つとも答えます。

  ---
  質問1：a は後から呼び出さないのになぜ関数なのか

  後から呼び出しません。useEffect 自身が内部で呼び出します。

  useEffect(() => { ... }, [])
  //         ^^^^^^^^^^^^
  //         useEffect が「適切なタイミングで」自分で呼ぶ

  開発者は「この処理を渡す」だけで、「いつ呼ぶか」はuseEffectに任せています。

  C言語で例えると：

  // コールバック関数を登録するイメージ
  void on_mount(void (*callback)()) {
      callback();  // useEffect が内部でこれをやっている
  }

  on_mount([]() {
      history_pushState(...);
  });

  「関数を渡して、呼ぶタイミングを相手に委ねる」パターンです。

  ---
  質問2：実行タイミングを操作できるのか

  はい、[c] の中身によって実行タイミングを操作できます。

  useEffect(() => { ... }, [])        // 最初の1回だけ
  useEffect(() => { ... }, [screen])  // screen が変わるたびに実行
  useEffect(() => { ... })            // 毎回実行（依存配列なし）

  useEffect() を呼び出すたびに実行されるのではなく、[c] の条件に合致したときだけ {b}
  が実行されます。

  ---
  まとめ

  useEffect((a) => {b}, [c])

  a → 開発者は名前をつけない。useEffect が内部で呼ぶ
  b → c の条件を満たしたときだけ実行される
  c → 実行タイミングの制御。[] なら最初の1回だけ

  ❯   1. AppShell が画面に表示される
            ↓
    2. React が「表示されたな」と検知する
            ↓
    3. useEffect に渡された関数を React が呼び出す

  ---

  useEffectに渡した関数って() => だと思ったんですが、これを実行するんですか？
  () => で実行する中身が、{b}に列挙された各処理ということなんでしょうか？

● そうです、正確に理解しています。

  ---
  構造を分解すると

  useEffect(() => {
    history.pushState(null, '', window.location.href)
    const handlePopState = () => history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(  () => { ... }  ,  []  )
  //          ^^^^^^^^^^^^^^
  //          これが「渡した関数」
  //          React がこの関数を呼び出す
  //                    ↓
  //          { } の中の処理が順番に実行される

  ---
  実行の流れ

  React が () => { ... } を呼び出す
    ↓
  { } の中が上から順に実行される

    1. history.pushState(...)          ← 実行
    2. const handlePopState = () => ... ← 実行（関数を変数に入れる）
    3. window.addEventListener(...)    ← 実行
    4. return () => ...                ← 後片付け関数を登録

  ---
  まとめ

  () =>        渡す関数の「入れ物」
  { ... }      その関数の中身（処理の列）
  []           いつ実行するかの条件

  () => は「この { }
  の中をまとめて1つの関数として渡す」という記号、と理解してもらえればOKです。

  ---

  ❯ なぜ(message?: string)
  には?がついているのですか？また、この時のmessageとは何型の何なんですか？

● ? は「渡さなくてもいい」という意味

  (message?: string)
  //       ^
  //       これがあると「引数なしで呼んでもOK」になる

  ---
  ? がない場合との違い

  // ? なし → 必ず渡さないといけない
  const goToChat = (message: string) => { ... }
  goToChat()           // エラー
  goToChat("相談したい") // OK

  // ? あり → 渡さなくてもいい
  const goToChat = (message?: string) => { ... }
  goToChat()           // OK → message は undefined になる
  goToChat("相談したい") // OK → message は "相談したい" になる

  ---
  なぜ ? をつけているのか

  goToChat は2つの場面で呼ばれます。

  // welome-screen から：メッセージなしでチャット開始
  onStartChat={goToChat}         // → goToChat() と同じ

  // category-screen から：カテゴリを選んでチャット開始
  onStartChat={goToChat}         // → goToChat("選んだカテゴリ") と同じ

  メッセージありでもなしでも呼べる必要があるので ? をつけています。

  ---
  message の型

  (message?: string)

  message は string | undefined 型です。

  ? をつけると TypeScript が自動的に undefined も許容します。

  // この2つは同じ意味
  (message?: string)
  (message: string | undefined)

  ---

  ● 型注釈です。同じものです。

  ---
  (message?: string) の内訳

  (message?: string)
  //^^^^^^  ^^^^^^^
  // 変数名  型注釈

  ? は「省略可能」というオプション指定で、string が型注釈です。

  ---
  他の型注釈と並べると

  const screen: Screen = 'welcome'      // 変数の型注釈
  useState<string | undefined>()        // ジェネリクスの型注釈
  (message?: string)                    // 引数の型注釈

  全部「この値は何型か」をTypeScriptに教えるための記述です。書く場所が違うだけで、やってい
  ることは同じです。

  ---
  ? と型注釈の関係

  (message?: string)
  // ↕ 同じ意味
  (message: string | undefined)

  ? は | undefined を省略して書けるシンタックスシュガー（省略記法）です。型注釈の一部と考
  えてもらってOKです。

  ---

  ❯ {screen === 'welcome' && <WelcomeScreen />} つまりscreen === 'welcome'なら &&
  以降が返るというのは分かるんですが、
  偽の場合は'welcome'が返るのですか？それとも（C的な書き方で）screen ==
  'welcome'かどうかの判定が返るって感じですか
  === の意味がよくわかりません。

● === は「等しいか判定する演算子」です

  C言語の == と同じ意味です。

  screen === 'welcome'   // screen が 'welcome' と等しいか？
  // → true または false が返る

  ---
  == と === の違い（JavaScript特有）

  JavaScriptには == と === の2つがあります。

  1 ==  '1'   // true  （型が違っても等しいとみなす）
  1 === '1'   // false （型も含めて完全に等しいか判定）

  C言語の == に近いのは === のほうです。基本的に === を使います。

  ---
  偽の場合に何が返るか

  screen === 'welcome'

  これは true か false しか返しません。'welcome' が返るわけではないです。

  // screen が 'chat' のとき
  screen === 'welcome'   // → false

  ---
  && 全体で何が返るか

  false && <WelcomeScreen />

  JavaScriptの && は「左が偽なら左の値をそのまま返す」という性質があります。

  false && <WelcomeScreen />   // → false が返る
  true  && <WelcomeScreen />   // → <WelcomeScreen /> が返る

  Reactは false を受け取ったとき何も表示しないという仕様なので、結果的に非表示になります。

  ---
  まとめ

  screen === 'welcome'          → true / false を返す判定
  true  && <WelcomeScreen />   → <WelcomeScreen /> が表示される
  false && <WelcomeScreen />   → false → React が何も表示しない

  ---

❯ `<div className="h-full flex flex-col">` h-full flex flex-col という名前のクラスを作っているのですか？

● 違います。**Tailwind CSS** というライブラリが提供するクラス名を**使っている**だけです。

  ---
  className とは

  ```tsx
  <div className="h-full flex flex-col">
  ```

  HTMLの `class` 属性と同じです。CSSのクラスを指定しています。

  ```html
  <!-- HTMLで書くと -->
  <div class="h-full flex flex-col">
  ```

  ---
  Tailwind CSS とは

  `h-full`、`flex`、`flex-col` はTailwind CSSがあらかじめ用意しているクラス名です。自分で定義する必要はありません。

  ```
  h-full    → height: 100%  （高さを親要素いっぱいに）
  flex      → display: flex （横並びレイアウトの有効化）
  flex-col  → flex-direction: column （縦方向に並べる）
  ```

  クラス名を書くだけで、対応するCSSが自動的に適用されます。

  ---
  C言語で例えると

  自分で関数を書かず、ライブラリの関数を呼ぶイメージです。

  ```c
  #include <math.h>

  // sqrt() は自分で定義していないが使える
  double result = sqrt(4.0);
  ```

  ```tsx
  // "flex" は自分で定義していないが使える
  <div className="flex">
  ```

  ---
  まとめ

  ```
  className="h-full flex flex-col"
  //         ^^^^^^ ^^^^ ^^^^^^^^
  //         全部 Tailwind が用意したクラス名
  //         自分では定義していない・する必要もない
  ```

  「クラス名を書くだけでスタイルが当たる」ライブラリです。

  ---

❯ `<SafetyModal />` ってなんですか

● 別ファイルで定義されたコンポーネントを呼び出しています。

  ```tsx
  import { SafetyModal } from '@/components/safety-modal'
  //                          ^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                          このファイルから SafetyModal を持ってきている
  ```

  `<SafetyModal />` は `safety-modal.tsx` で定義されたコンポーネントを「ここに表示する」という意味です。

  ---
  C言語で例えると

  ```c
  // 別ファイルで定義された関数を呼ぶのと同じ
  #include "safety_modal.h"

  SafetyModal();  // 呼び出す
  ```

  ---
  `<SafetyModal />` の `/>` の意味

  ```tsx
  <SafetyModal />   // 子要素なし（自己閉じタグ）
  <div>...</div>    // 子要素あり（開きタグと閉じタグ）
  ```

  中に子要素を持たないコンポーネントは `/>` で閉じます。HTMLの `<br />` や `<img />` と同じ形式です。

  ---
  props を渡していないことの意味

  ```tsx
  <SafetyModal />
  ```

  引数（props）を何も渡していないので、`SafetyModal` は外から値をもらわずに動きます。

  ---
  app-shell.tsx での位置

  ```tsx
  <div className="h-full flex flex-col">
    <SafetyModal />              ← 常に表示（条件なし）
    {screen === 'welcome' && ... ← 条件付き表示
    {screen === 'category' && ...
    {screen === 'chat' && ...
  ```

  `SafetyModal` だけ `{screen === ...}` の条件がなく、**どの画面でも常に表示**されています。安全確認モーダルなので、どの画面状態でも出せるようにしているためです。
