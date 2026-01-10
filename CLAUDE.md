# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## プロジェクト概要

Chromium AI APIを使用したブラウザ内翻訳アプリケーションです。Next.js 16で構築され、Chrome 138以降およびOpera 122以降で動作します。すべての処理がブラウザ内で完結し、サーバーにデータを送信しません。

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

## セットアップ

### 依存関係のインストール

```bash
bun install
```

### pre-commitのインストール（推奨）

コミット時にgitleaksが自動実行され、機密情報の混入を防ぎます。

```bash
# macOSの場合
brew install pre-commit

# またはpipを使用
pip install pre-commit

# pre-commitフックをインストール
pre-commit install
```

## アーキテクチャ

### ブラウザAPI依存の重要な注意点

このアプリケーションは2つのChromium AI APIに完全依存しています。

1. **LanguageDetector API**: 入力テキストの言語を自動検出
2. **Translator API**: 検出された言語から任意の言語へ翻訳

**クリティカルな制約**: これらのAPIはブラウザ専用です。
Next.jsのSSR環境では存在しないため、次のパターンを使用します。

### SSRエラー回避パターン

ブラウザAPIを使用するコンポーネントは、`dynamic` importで`ssr: false`を指定してクライアント側でのみレンダリングします。

**body.tsx (ラッパーコンポーネント)**:

```typescript
import dynamic from "next/dynamic";

const Translation = dynamic(
  () => import("@/components/translation/translation"),
  { ssr: false },
);
```

**translation.tsx (ブラウザAPIを使用するコンポーネント)**:

```typescript
"use client";

export default function Translation(): JSX.Element {
  const [isSupportedBrowser, setIsSupportedBrowser] = useState<boolean>(false);

  // APIの存在チェック（useEffect内で実行）
  useEffect(() => {
    if ("LanguageDetector" in self && "Translator" in self) {
      (async () => {
        const availability = await LanguageDetector.availability();
        setIsSupportedBrowser(availability !== "unavailable");
      })();
    }
  }, []);

  if (!isSupportedBrowser) {
    return <div>非対応ブラウザです。</div>;
  }
  // ...
}
```

このパターンにより、次の利点があります。

- `ssr: false`でSSR時にコンポーネントがスキップされる
- クライアント側でのみ`self`や`window`にアクセスできる
- `useEffect`でレンダリング中の副作用を防ぐ

### コンポーネント構成

```text
Translation (状態管理の中心)
  │
  ├─ InputForm
  │   └─ 役割: テキスト入力と言語検出
  │   └─ API: LanguageDetector.detect()
  │   └─ 出力: sourceLocales[], sourceLocale
  │
  └─ LanguageForm
      └─ 役割: 言語選択と翻訳実行
      └─ API: Translator.create(), translate()
      └─ 出力: outputText
      └─ 子: LanguageSelector (翻訳元/翻訳先)
```

状態は最上位の`Translation`で管理され、propsで下位に伝播します。

### 言語コード処理

`src/app/lib.ts`に言語コード関連のユーティリティがあります。

```typescript
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

処理フローは次の通りです。

1. `iso-639-1`パッケージから全言語コード取得
2. `canConvertToDisplayName`でフィルタリング
3. `Intl.DisplayNames`で表示可能な言語のみ使用

これにより、`aa`のような表示できない言語コードが除外されます。

## 重要な実装ルール

### 1. React Hooksの呼び出し順序

すべてのhooks（`useState`、`useEffect`）は条件分岐より前に配置する必要があります。

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

**理由**: Reactはhooksの呼び出し順序で内部状態を追跡します。条件分岐でhooksの数が変わるとエラーが発生します。

### 2. useEffect内でのsetState呼び出しを避ける

派生状態（他の状態から計算できる値）は、状態ではなく計算値として定義します。

❌ **間違った例**:

```typescript
const [loading, setLoading] = useState(false);
const [inputText, setInputText] = useState("");
const [buttonDisabled, setButtonDisabled] = useState(true);

useEffect(() => {
  setButtonDisabled(loading || inputText === "");
}, [loading, inputText]);
```

✅ **正しい例**:

```typescript
const [loading, setLoading] = useState(false);
const [inputText, setInputText] = useState("");
const buttonDisabled = loading || inputText === ""; // 計算値として定義
```

**理由**: `useEffect`内での同期的な`setState`呼び出しは、カスケード的なレンダリングを引き起こしパフォーマンスに悪影響を与えます。

### 3. パスエイリアス

インポートは`@/`エイリアスを使用します（`./src/`にマッピング）。

```typescript
// ✅ 推奨
import { defaultLocale } from "@/app/lib";

// ❌ 非推奨
import { defaultLocale } from "../../../lib";
```

### 4. ESLint設定

- **ESLint v9 Flat Config形式**を使用
- `n/no-missing-import`は無効化（Next.jsのパスエイリアスをサポートするため）
- package.jsonの`lint`スクリプトは`eslint .`を使用（`next lint`ではない）

## API呼び出しパターン

### 言語検出

```typescript
const languageDetector = await LanguageDetector.create();
const languageDetections = await languageDetector.detect(inputText);
const detectedLanguages = languageDetections
  .map(({ detectedLanguage }) => detectedLanguage)
  .filter((dl): dl is string => typeof dl === "string")
  .filter(canConvertToDisplayName);
```

### 翻訳

```typescript
try {
  const translator = await Translator.create({
    sourceLanguage,
    targetLanguage,
  });
  const result = await translator.translate(inputText);
  setOutputText(result);
} catch {
  // エラーハンドリング（対応していない言語ペアなど）
  alert(
    `${localeToDisplayName(sourceLanguage)}から${localeToDisplayName(targetLanguage)}への翻訳には対応していません。`,
  );
}
```

## スタイリング規約

Tailwind CSSの一貫したパターンを使用します。

**レイアウト**:

- `flex`と`flex-col`でFlexboxレイアウト
- `gap-2`で要素間のスペーシング
- `items-center`で垂直方向の中央揃え

**フォーム要素**:

```tsx
// 入力フィールドとセレクト
className = "border rounded px-2 py-1 focus:outline-none focus:ring-2";

// ボタン
className =
  "border rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";
```

**言語設定**:

- HTMLの`lang`属性は`"ja"`
- UIテキストはすべて日本語

## ブラウザ対応

package.jsonの`browserslist`設定は次の通りです。

```json
{
  "browserslist": ["chrome >= 138", "opera >= 122", "not dead"]
}
```

この設定により、Tailwind CSSとPostCSSが対応ブラウザ向けに最適化されたCSSを生成します。

## Tailwind CSS v4の設定

このプロジェクトはTailwind CSS v4を使用しています。v3からv4への主要な変更点は次の通りです。

### PostCSS設定（PostCSS.config.mjs）

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, // v3の "tailwindcss" から変更
  },
};
```

### グローバルCSS（src/app/globals.css）

```css
@import "tailwindcss"; /* v3の @tailwind ディレクティブから変更 */

:root {
  --background: #fff;
  --foreground: #171717;
}
```

### 設定ファイル

- `tailwind.config.ts`は不要（v4ではオプション）
- カスタムテーマは`globals.css`内の`:root`または`@theme`で定義

## 技術スタック

<!-- prettier-ignore-start -->
| 技術                     | バージョン  | 用途                           |
|------------------------|--------|------------------------------|
| Next.js                | 16     | Reactフレームワーク（App Router使用）   |
| TypeScript             | 5      | 型安全な開発                       |
| React                  | 19     | UIライブラリ                      |
| Bun                    | latest | パッケージマネージャー・ランタイム            |
| Tailwind CSS           | 4      | ユーティリティファーストCSS              |
| @tailwindcss/PostCSS   | 4      | Tailwind CSS v4 PostCSSプラグイン |
| iso-639-1              | 3.1    | 言語コード処理                      |
| react-spinners         | 0.17   | ローディング表示（BarLoader）          |
| @types/dom-chromium-ai | 0.0.11 | Chromium AI APIの型定義          |
<!-- prettier-ignore-end -->
