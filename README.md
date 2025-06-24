# Personality Assessment App

BIG5+HEXACO因子による人材選考支援システム

## プロジェクト情報

**プロジェクトパス:** `/Users/sugiharayousuke/MyProjects/personality-app/`

**開発環境:** macOS (Docker Compose)

**最終更新:** 2025年6月25日

## システム構成

```
personality-app/
├── frontend/           # React フロントエンド
│   ├── src/
│   │   ├── App.js     # メインアプリケーション
│   │   ├── App.css    # スタイル定義
│   │   └── index.js   # エントリーポイント
│   ├── Dockerfile     # フロントエンド用Docker設定
│   └── package.json   # 依存関係
├── backend/            # Express バックエンド
│   ├── data/
│   │   └── big5_hexaco_questions.json  # 設問データ
│   ├── server.js      # APIサーバー
│   ├── Dockerfile     # バックエンド用Docker設定
│   └── package.json   # 依存関係
├── database/
│   └── init.sql       # PostgreSQL初期化スクリプト
├── docker-compose.yml # Docker Compose設定
└── README.md          # このファイル
```

## 完成済み機能 ✅

- **ランダム10問出題システム** - 30問からランダムに10問を選択
- **左右選択肢ランダム入れ替え** - 選択肢の位置をランダム化
- **進捗表示システム** - カウンター（1/10）とドット表示
- **戻る機能** - 前の問題に戻って回答変更可能
- **スコア計算エンジン** - BIG5+HEXACO因子の統計的分析
- **ChatGPTプロンプト生成** - 診断結果から分析用プロンプトを自動生成
- **もう一度機能** - 新しい問題セットで再診断

## 技術スタック

- **Frontend:** React 18 + Axios + CSS3
- **Backend:** Node.js + Express + PostgreSQL
- **Database:** PostgreSQL 15
- **コンテナ:** Docker + Docker Compose
- **開発ツール:** Playwright (E2Eテスト)

## 起動方法

```bash
# プロジェクトディレクトリに移動
cd /Users/sugiharayousuke/MyProjects/personality-app

# Docker Composeで起動（推奨）
docker-compose up --build

# バックグラウンド実行
docker-compose up -d --build

# ログ確認
docker-compose logs -f

# 停止
docker-compose down
```

## アクセス情報

- **フロントエンド:** http://localhost:3001
- **バックエンドAPI:** http://localhost:5001
- **PostgreSQL:** localhost:5432

> **注意:** ポート競合回避のため、デフォルトから変更済み

## データベース設定

- **Database:** personality_app
- **User:** admin  
- **Password:** password123
- **Tables:** 
  - `responses` - 回答データ
  - `results` - 診断結果

## API エンドポイント

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/questions` | 設問データ取得 |
| POST | `/api/responses` | 回答データ保存 |
| GET | `/api/health` | ヘルスチェック |

## 設問データ

- **総設問数:** 30問
- **出題数:** 10問（ランダム選択）
- **因子構成:** BIG5+HEXACO各因子10回出現
- **回答形式:** 二択（どちらなら許容できるか）

## 診断アルゴリズム

1. **因子カウント** - 選択された因子を集計
2. **統計計算** - 平均値・標準偏差を算出
3. **プロンプト生成** - ChatGPT分析用の構造化プロンプト作成

## 開発ステータス

**🟢 本番Ready:** 基本機能完成・テスト済み

**📋 追加検討機能:**
- 結果データのローカル保存
- 管理画面（診断履歴）
- ChatGPT直接連携
- UIアニメーション
- 回答時間計測
- 因子別詳細説明

## トラブルシューティング

**ポート競合エラー:**
```bash
# 使用中ポート確認
lsof -i :3001
lsof -i :5001

# Docker完全クリーン
docker-compose down -v
docker system prune -f
```

**データベース接続エラー:**
```bash
# コンテナ状態確認
docker-compose ps

# ログ確認
docker-compose logs postgres
```