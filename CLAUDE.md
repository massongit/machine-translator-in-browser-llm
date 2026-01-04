# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Chromium AI APIを使用したブラウザ内翻訳アプリケーションです。Next.js 14で構築され、Chrome 138以降およびOpera 122以降で動作します。すべての処理がブラウザ内で完結し、サーバーにデータを送信しません。

## 開発環境

### セットアップ

1. **依存関係のインストール**:

   ```bash
   bun install
   ```

2. **pre-commitのインストール**:

   [pre-commit](https://pre-commit.com/) の手順に従って `pre-commit` をインストールしてください。

   ```bash
   # macOSの場合
   brew install pre-commit

   # またはpipを使用
   pip install pre-commit

   # pre-commitフックをインストール
   pre-commit install
   ```

   **重要**: これにより、`.pre-commit-config.yaml`の設定に基づいて、コミット時に自動的に以下のチェックが実行されます：
   - **gitleaks**: クレデンシャル（APIキー、トークンなど）が含まれていないかを検査

   設定ファイル:
   - `.pre-commit-config.yaml`: pre-commitの設定（gitleaks v8.30.0を使用）
   - `.gitleaks.toml`: gitleaksのルール設定（デフォルト設定を使用）

## 開発コマンド

```bash
# 開発サーバーを起動（http://localhost:3000）
bun dev

# プロダクション用にビルド
bun run build

# プロダクションサーバーを起動
bun start

# Lintでコード品質をチェック
bun run lint

# Prettierでコードを自動整形
bun run fix
```

## アーキテクチャの理解

### 使用しているブラウザAPI

このアプリケーションは2つのChromium AI APIに完全依存しています：

1. **LanguageDetector API**: 入力テキストの言語を自動検出
2. **Translator API**: 検出された言語から任意の言語へ翻訳

**クリティカルな注意事項**: これらのAPIはブラウザ専用です。Next.jsのSSR（サーバーサイドレンダリング）環境では存在しないため、必ず`useEffect`フック内でのみチェックしてください。コンポーネントの初期化時やレンダリング中に直接アクセスすると、SSRエラーが発生します。

### コンポーネントアーキテクチャ

アプリケーションは状態を最上位で管理し、propsで下位に伝播させる設計です：

```
Translation (状態管理の中心)
  │
  ├─ InputForm
  │   └─ 役割: テキスト入力と言語検出
  │   └─ 状態: inputText を管理
  │   └─ 副作用: LanguageDetector API を呼び出し
  │   └─ 出力: sourceLocales[] と sourceLocale を設定
  │
  └─ LanguageForm
      └─ 役割: 言語選択と翻訳実行
      └─ 状態: targetLanguage と loading を管理
      └─ 副作用: Translator API を呼び出し
      └─ 出力: outputText を設定
      └─ 子コンポーネント:
          ├─ LanguageSelector (翻訳元言語)
          └─ LanguageSelector (翻訳先言語)
```

**状態フロー**:

- `inputText`: ユーザー入力テキスト
- `sourceLocales`: 検出された候補言語の配列
- `sourceLocale`: 現在選択中の翻訳元言語
- `outputText`: 翻訳結果
- 各種setter関数: 状態を更新するための関数

### 言語コードの扱い方

`src/app/lib.ts`に言語コード処理のユーティリティがあります：

```typescript
// デフォルトロケールは日本語
export const defaultLocale: string = "ja";

// ISO 639-1コードを日本語の言語名に変換
export function localeToDisplayName(locale: string): string | undefined {
  const displayNames = new Intl.DisplayNames(defaultLocale, {
    type: "language",
  });
  return displayNames.of(locale);
}

// 表示可能な言語コードかどうかをチェック
export function canConvertToDisplayName(locale: string) {
  return locale !== "und" && localeToDisplayName(locale) !== locale;
}
```

**重要な処理フロー**:

1. `iso-639-1`パッケージから全言語コード取得
2. `canConvertToDisplayName`でフィルタリング
3. `Intl.DisplayNames`で正しく表示できる言語のみ使用

これにより、`aa`のような表示できない言語コードが除外されます。

### ブラウザ対応設定

package.jsonに明示的なブラウザサポート定義があります：

```json
{
  "browserslist": ["chrome >= 138", "opera >= 122", "not dead"]
}
```

**この設定の効果**:

- Tailwind CSSが対応ブラウザ向けに最適化されたCSSを生成
- PostCSSが不要なベンダープレフィックスを削除
- Next.jsのトランスパイル設定が最適化

### スタイリング規約

このプロジェクトは一貫したTailwindパターンを使用します：

**レイアウト**:

- `flex`と`flex-col`でFlexboxレイアウト
- `gap-2`で要素間のスペーシング
- `items-center`で垂直方向の中央揃え

**フォーム要素**:

```tsx
// 入力フィールドとセレクトの標準スタイル
className = "border rounded px-2 py-1 focus:outline-none focus:ring-2";

// ボタンの標準スタイル
className =
  "border rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";
```

**言語設定**:

- HTMLの`lang`属性は`"ja"`
- UIテキストはすべて日本語

### ディレクトリ構造

```
src/app/
├── lib.ts                           # 共有ユーティリティ（言語コード処理）
├── page.tsx                         # ルートページ
├── layout.tsx                       # ルートレイアウト
├── globals.css                      # グローバルスタイル
└── components/
    ├── body.tsx                     # メインコンテンツラッパー
    └── translation/
        ├── translation.tsx          # 状態管理コンポーネント
        ├── inputForm.tsx            # 入力フォームと言語検出
        └── languageForm/
            ├── languageForm.tsx     # 翻訳フォーム
            └── languageSelector.tsx # 言語選択ドロップダウン（再利用可能）
```

## 重要な実装パターン

### 1. React Hooksの呼び出し順序

**ルール**: すべてのhooks（`useState`、`useEffect`）は条件分岐より前に配置する

❌ **間違った例**:

```typescript
function MyComponent() {
  if (someCondition) {
    return null;
  }
  const [state, setState] = useState(); // エラー！
}
```

✅ **正しい例**:

```typescript
function MyComponent() {
  const [state, setState] = useState(); // フックを先に

  if (someCondition) {
    return null;
  }
}
```

**理由**: Reactはhooksの呼び出し順序で内部状態を追跡します。条件分岐でhooksの数が変わると、"missing static flags"エラーが発生します。

### 2. パスエイリアス

**ルール**: インポートは`@/`エイリアスを使用（`./src/`にマッピング）

```typescript
// ✅ 推奨
import { defaultLocale } from "@/app/lib";

// ❌ 非推奨
import { defaultLocale } from "../../../lib";
```

## SSRエラーを回避する方法

### ブラウザAPI チェックパターン

ブラウザAPIは必ず`useEffect`内でチェックしてください。このプロジェクトでは**2段階のチェック**を行います：

```typescript
export default function Translation(): JSX.Element {
  // 状態定義は最初に
  const [isSupportedBrowser, setIsSupportedBrowser] = useState<boolean>();

  // ブラウザAPIのチェックはuseEffect内でのみ
  useEffect(() => {
    // ステップ1: APIの存在チェック
    if (["LanguageDetector", "Translator"].some((v) => !(v in self))) {
      setIsSupportedBrowser(false);
      return;
    }

    // ステップ2: LanguageDetectorの実際の利用可能性をチェック
    (async () => {
      const languageDetectorAvailability: Availability =
        await LanguageDetector.availability();
      setIsSupportedBrowser(languageDetectorAvailability !== "unavailable");
    })();
  }, []);

  // ローディング状態の表示
  if (isSupportedBrowser === undefined) {
    return <div>読み込み中......</div>;
  }

  // 非対応ブラウザの表示
  if (!isSupportedBrowser) {
    return <div>非対応ブラウザです。</div>;
  }

  // 通常のレンダリング
  return (
    <div className="m-auto flex flex-col gap-2">
      {/* コンポーネント内容 */}
    </div>
  );
}
```

**2段階チェックの理由**:

1. **APIの存在チェック** (`in self`): APIがブラウザに実装されているか確認
2. **availability()チェック**: APIが実装されていても、実際に利用可能かを確認
   - これにより、APIが使えない環境で適切に「非対応ブラウザです。」を表示

**なぜuseEffect内なのか**:

- `useEffect`はクライアント側でのみ実行される
- SSR時にはスキップされる
- ブラウザAPIの存在をサーバー側でチェックしようとするとエラーになる

### API呼び出しのパターン

LanguageDetectorとTranslator APIの呼び出し例：

```typescript
// 言語検出
const languageDetector = await LanguageDetector.create();
const languageDetections = await languageDetector.detect(inputText);
const detectedLanguages = languageDetections
  .map(({ detectedLanguage }) => detectedLanguage)
  .filter((dl): dl is string => typeof dl === "string")
  .filter(canConvertToDisplayName);

// 翻訳
const translator = await Translator.create({
  sourceLanguage,
  targetLanguage,
});
const result = await translator.translate(inputText);
```

## 技術スタック

| 技術                   | バージョン | 用途                                  |
| ---------------------- | ---------- | ------------------------------------- |
| Next.js                | 14         | Reactフレームワーク（App Router使用） |
| TypeScript             | 5          | 型安全な開発                          |
| React                  | 18         | UIライブラリ                          |
| Bun                    | latest     | パッケージマネージャー・ランタイム    |
| Tailwind CSS           | 3.4        | ユーティリティファーストCSS           |
| iso-639-1              | 3.1        | 言語コード処理                        |
| react-spinners         | 0.17       | ローディング表示（BarLoader）         |
| @types/dom-chromium-ai | 0.0.11     | Chromium AI APIの型定義               |
