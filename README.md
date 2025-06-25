# Quotable Minds - あなたを導く偉人の言葉

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hiroHGxx/QuotableMinds)

インタラクティブな診断コンテンツで、あなたの価値観に合う歴史上の偉人とその名言を発見しましょう。

## 🌟 特徴

- **5問の診断**: 価値観や思考性を分析する質問
- **6名の偉人**: 多様なジャンルから選出された歴史上の人物
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **SNSシェア**: Twitter/Xで結果をシェア
- **LLM連携対応**: パーソナライズされた解説（Vercel版）

## 🚀 デモ

- **GitHub Pages**: [https://hirohgxx.github.io/QuotableMinds/](https://hirohgxx.github.io/QuotableMinds/)
- **Vercel (テスト環境)**: デプロイ後にURL更新

## 🏗️ 技術スタック

### フロントエンド
- HTML5, CSS3, Vanilla JavaScript
- Tailwind CSS (CDN)
- Google Fonts (Playfair Display, Inter)

### バックエンド (Vercel版)
- Vercel Serverless Functions
- Node.js API Routes
- OpenAI GPT API (将来実装)

## 📦 セットアップ

### 静的サイト版（GitHub Pages）
```bash
git clone https://github.com/hiroHGxx/QuotableMinds.git
cd QuotableMinds
# index.html をブラウザで開く
```

### Vercel版（LLM連携対応）
```bash
# リポジトリをクローン
git clone https://github.com/hiroHGxx/QuotableMinds.git
cd QuotableMinds

# 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集してAPIキーを設定

# Vercel CLI をインストール（初回のみ）
npm install -g vercel

# ローカル開発サーバーを起動
vercel dev
```

## 🔧 環境変数

Vercel版では以下の環境変数が必要です：

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=development
```

## 📁 プロジェクト構造

```
QuotableMinds/
├── index.html              # メインアプリケーション
├── PRD.md                 # プロダクト要求仕様書
├── diagnosis-data.json    # 診断データ（偉人・質問）
├── api/                   # Vercel API Routes
│   ├── test.js           # テスト用エンドポイント
│   └── personalized-analysis.js  # LLM連携API
├── vercel.json           # Vercel設定
├── package.json          # プロジェクト設定
└── .env.local.example    # 環境変数テンプレート
```

## 🌐 API エンドポイント

### GET /api/test
```bash
curl https://your-project.vercel.app/api/test
```

### POST /api/personalized-analysis
```bash
curl -X POST https://your-project.vercel.app/api/personalized-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "personality": {...},
    "answers": [...],
    "userMessage": "optional message"
  }'
```

## 🚀 デプロイ

### Vercel (推奨)
1. [Vercel](https://vercel.com) でアカウント作成
2. GitHub リポジトリをインポート
3. 環境変数を設定
4. デプロイ

### その他のプラットフォーム
- **Netlify**: `netlify.toml` 追加で対応可能
- **GitHub Pages**: 静的サイトとして動作
- **Cloudflare Pages**: Workers で API 対応

## 🔮 将来の機能拡張

- [ ] LLM によるパーソナライズ解説
- [ ] 多言語対応（英語版）
- [ ] ユーザー履歴保存
- [ ] ソーシャル機能
- [ ] 追加の偉人・質問

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューを歓迎します！

---

**Quotable Minds** - あなたらしい道を見つけよう 🌟