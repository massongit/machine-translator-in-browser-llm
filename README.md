# machine-translator-in-browser-llm

Chromium AI APIsを使用した、ブラウザ内で動作する言語検出・翻訳アプリケーションです。サーバーにデータを送信せず、完全にブラウザ内で処理を行います。

## 機能

- **言語自動検出**: 入力されたテキストの言語を自動的に検出
- **ブラウザ内翻訳**: 検出された言語から任意の言語へリアルタイムで翻訳
- **プライバシー重視**: すべての処理がブラウザ内で完結し、外部サーバーにデータを送信しません

## 動作要件

このアプリケーションは次のブラウザで動作します。

- **Chrome** バージョン138以降
- **Opera** バージョン122以降

### 注意事項

- 対応していないブラウザでアクセスした場合、「非対応ブラウザです」というメッセージが表示される

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **UIライブラリ**: React 18
- **スタイリング**: Tailwind CSS
- **パッケージマネージャー**: Bun
- **対応ブラウザ**: Chrome 138+, Opera 122+ (browserslist設定済み)
- **主な依存関係**:
  - `iso-639-1`: BCP 47言語コードの処理
  - `react-spinners`: ローディング表示
  - `@types/dom-chromium-ai`: Chromium AI APIの型定義

## セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. pre-commitのセットアップ（推奨）

セキュリティのため、[pre-commit](https://pre-commit.com/)をインストールしてください。コミット時にクレデンシャルが含まれていないか自動チェックされます。

```bash
# macOSの場合
brew install pre-commit

# またはpipを使用
pip install pre-commit

# pre-commitフックをインストール
pre-commit install
```

これにより、コミット時に自動的にgitleaksが実行され、APIキーやトークンなどの機密情報が含まれていないかチェックされます。

### 3. 開発サーバーの起動

```bash
bun dev
```

ブラウザで `http://localhost:3000` を開いてアプリケーションを確認できます。

## 使い方

1. 「翻訳したい文」欄にテキストを入力
2. 「言語推定」ボタンをクリックして言語を自動検出
3. 翻訳元の言語と翻訳先の言語を選択
4. 「翻訳」ボタンをクリックして翻訳する

## プロジェクト構成

```text
src/
├── app/
│   ├── components/
│   │   ├── body.tsx                     # ページボディコンポーネント
│   │   └── translation/
│   │       ├── translation.tsx          # メインコンポーネント（状態管理）
│   │       ├── inputForm.tsx            # 入力・言語検出フォーム
│   │       └── languageForm/
│   │           ├── languageForm.tsx     # 言語選択・翻訳フォーム
│   │           └── languageSelector.tsx # 言語セレクタ（再利用可能）
│   ├── lib.ts                           # ユーティリティ関数
│   ├── page.tsx                         # ルートページ
│   ├── layout.tsx                       # ルートレイアウト
│   └── globals.css                      # グローバルスタイル
```

## アーキテクチャ

### コンポーネント構成

- **Translation**: 最上位コンポーネント。すべての状態を管理し、子コンポーネントにpropsとして渡す
- **InputForm**: テキスト入力とLanguageDetector APIによる言語検出を担当
- **LanguageForm**: 言語選択とTranslator APIによる翻訳を担当
- **LanguageSelector**: 再利用可能な言語選択ドロップダウン

### 重要な実装パターン

- **SSRエラー回避**: ブラウザAPI（`LanguageDetector`、`Translator`）の存在チェックは `useEffect` 内でのみ実施
- **React Hooks規則**: すべてのフックは条件分岐より前に配置
- **型安全性**: TypeScriptの厳格モードで型チェックを実施
- **言語コードフィルタリング**: `Intl.DisplayNames` で表示可能な言語のみを選択肢に含める

## その他のコマンド

```bash
# プロダクションビルド
bun run build

# プロダクションサーバーの起動
bun start

# Lintチェック
bun run lint

# コードフォーマット
bun run fix
```

## 参考リンク

- [Translator API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Translator)
- [Language Detection API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/LanguageDetector)
- [Chromium AI APIs - Chrome for Developers](https://developer.chrome.com/docs/ai/built-in?hl=ja)
- [Next.js Documentation](https://nextjs.org/docs)
