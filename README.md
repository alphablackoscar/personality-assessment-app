# Personality Assessment App

BIG5+HEXACO因子による人材選考支援システム

## プロジェクト情報

**プロジェクトパス:** `/Users/sugiharayousuke/MyProjects/personality-app/`

**開発環境:** macOS (Docker Compose)

**最終更新:** 2025年6月25日

**GitHub:** https://github.com/alphablackoscar/personality-assessment-app

## ⚠️ 重要: 現在の開発状況

### 🚨 発見された問題

**現在2つの重要な仕様バグがあります（修正待ち）:**

1. **Issue #1: スコア計算ロジックの誤り**
   - 現在: 選ばれた因子のみカウント（プラス）
   - 正しい仕様: 選ばれた因子はマイナス、選ばれなかった因子はプラス
   - ブランチ: `fix/scoring-logic`

2. **Issue #2: 戻る機能の重複計算バグ**
   - 現在: 配列の最後を削除するだけで重複計算リスク
   - 正しい仕様: インデックスベースで固定長配列管理
   - ブランチ: `fix/back-button-logic`

### 🔧 開発継続方法

**次のチャットで作業する場合:**
```bash
cd /Users/sugiharayousuke/MyProjects/personality-app

# 問題1を修正する場合
git checkout fix/scoring-logic

# 問題2を修正する場合  
git checkout fix/back-button-logic

# 現在の状況確認
git status
git log --oneline
```

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
- **戻る機能** - 前の問題に戻って回答変更可能（⚠️バグあり）
- **スコア計算エンジン** - BIG5+HEXACO因子の統計的分析（⚠️仕様誤り）
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

1. **因子カウント** - 選択された因子を集計（⚠️現在バグあり）
2. **統計計算** - 平均値・標準偏差を算出
3. **プロンプト生成** - ChatGPT分析用の構造化プロンプト作成

## 開発ステータス

**🟡 修正必要:** 基本機能完成済みだが2つの重要バグあり

**🔴 緊急修正項目:**
1. スコア計算ロジック（Issue #1）
2. 戻る機能の重複バグ（Issue #2）

**📋 追加検討機能:**
- 結果データのローカル保存
- 管理画面（診断履歴）
- ChatGPT直接連携
- UIアニメーション
- 回答時間計測
- 因子別詳細説明

## 問題修正の詳細

### Issue #1: スコア計算ロジック修正

**現在のコード（App.js 65行目付近）:**
```javascript
allResponses.forEach(response => {
  factorCounts[response.selectedFactor]++; // バグ: 選ばれた因子のみプラス
});
```

**修正すべき仕様:**
```javascript
allResponses.forEach((response, index) => {
  const question = shuffledQuestions[index];
  const selectedFactor = response.selectedFactor;
  const weight = question.weight || 1;
  
  // 選ばれた因子: weight分マイナス
  factorCounts[selectedFactor] -= weight;
  
  // 選ばれなかった因子: プラス
  ['C', 'A', 'E', 'O', 'N', 'H'].forEach(factor => {
    if (factor !== selectedFactor) {
      factorCounts[factor] += weight;
    }
  });
});
```

### Issue #2: 戻る機能修正

**現在のコード（App.js 52行目付近）:**
```javascript
const handleBack = () => {
  if (currentQuestion > 0) {
    setCurrentQuestion(currentQuestion - 1);
    setResponses(responses.slice(0, -1)); // バグ: 重複計算リスク
    setSelectedOption(null);
  }
};
```

**修正すべき仕様:**
```javascript
// 状態管理を固定長配列に変更
const [responses, setResponses] = useState(new Array(10).fill(null));

const handleNext = () => {
  const newResponses = [...responses];
  newResponses[currentQuestion] = newResponse;
  setResponses(newResponses);
};

const handleBack = () => {
  setCurrentQuestion(currentQuestion - 1);
  setSelectedOption(null);
  // responsesは変更しない（インデックスベース管理）
};
```

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

**Git操作:**
```bash
# ブランチ確認
git branch -a

# Issue関連ブランチ切り替え
git checkout fix/scoring-logic
git checkout fix/back-button-logic

# 最新状況確認
git log --oneline
git status
```
