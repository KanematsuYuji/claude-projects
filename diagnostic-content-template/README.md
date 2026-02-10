# 診断コンテンツ テンプレート

JSONファイルを差し替えるだけで、質問数・選択肢数・結果数を自由にカスタマイズできる汎用診断コンテンツモジュールです。

## ディレクトリ構成

```
diagnostic-content-template/
├── src/
│   └── diagnostic.js      # コアエンジン（単一ファイル、依存なし）
├── data/
│   ├── personality-diagnosis.json   # サンプル: 4択性格診断
│   └── yesno-diagnosis.json         # サンプル: Yes/No 2択診断
└── demo/
    ├── index.html           # デモページ（複数診断の表示例）
    └── embed-example.html   # 最小限の埋め込み例
```

## 使い方

### 基本（3ステップ）

```html
<!-- 1. コンテナを配置 -->
<div id="my-diagnosis"></div>

<!-- 2. スクリプトを読み込み -->
<script src="src/diagnostic.js"></script>

<!-- 3. JSONを指定して起動 -->
<script>
  DiagnosticModule.loadFromJSON('#my-diagnosis', 'data/personality-diagnosis.json');
</script>
```

### インラインデータで起動

```javascript
const data = { meta: {...}, settings: {...}, questions: [...], results: [...] };
const diag = new DiagnosticModule('#container', data);
diag.start();
```

### 結果コールバック

```javascript
const instance = await DiagnosticModule.loadFromJSON('#el', 'data/sample.json');
instance.onResult((result, scores, answers) => {
  console.log(result.title);   // 診断結果のタイトル
  console.log(scores);         // 各結果IDごとの合計スコア
  console.log(answers);        // ユーザーの回答履歴
});
```

## JSONデータ仕様

```jsonc
{
  "meta": {
    "id": "unique-id",
    "title": "診断タイトル",
    "description": "説明文",
    "version": "1.0.0"
  },
  "settings": {
    "scoringMode": "highest",   // "highest" | "range" (後述)
    "choiceStyle": "grid",       // "grid" | "horizontal"
    "showProgress": true,        // プログレスバー表示
    "showQuestionNumber": true,  // 質問番号表示
    "animation": "fade",         // "fade" | "slide" | "none"
    "resultShareEnabled": false  // Web Share API によるシェアボタン
  },
  "questions": [
    {
      "id": "q1",
      "text": "質問文",
      "image": "",              // 質問画像URL（任意）
      "choices": [
        {
          "id": "q1a",
          "text": "選択肢テキスト",
          "scores": { "resultId": 3 }  // highest モード: 結果IDごとの加算値
          // "score": 3               // range モード: 単一の加算値
        }
      ]
    }
  ],
  "results": [
    {
      "id": "resultId",
      "title": "結果タイトル",
      "description": "結果の説明文",
      "image": "",              // 結果画像URL（任意）
      "url": "",                // 結果ページURL（設定時は別ページへ遷移）
      "tags": ["タグ1", "タグ2"],
      "range": [1, 5]           // range モードのみ: [最小値, 最大値]
    }
  ]
}
```

### スコアリングモード

#### `highest`（デフォルト）— カテゴリ別最高スコア方式

各選択肢が複数の結果IDにスコアを加算し、最終的に最高スコアの結果を表示します。

```jsonc
// 選択肢
{ "id": "q1a", "text": "友人と外出する", "scores": { "A": 3, "B": 0, "C": 1 } }

// 結果（range 不要）
{ "id": "A", "title": "社交派タイプ", ... }
```

#### `range` — 合計スコアの範囲判定方式

各選択肢が単一のスコア値（`score`）を持ち、全回答の合計スコアがどの範囲に入るかで結果を判定します。

```jsonc
// settings
{ "scoringMode": "range" }

// 選択肢（score は単一の数値）
{ "id": "q1a", "text": "ぐっすり眠れる",   "score": 1 }
{ "id": "q1b", "text": "まあまあ眠れる",   "score": 2 }
{ "id": "q1c", "text": "あまり眠れない",   "score": 3 }
{ "id": "q1d", "text": "ほとんど眠れない", "score": 4 }

// 結果（range: [最小値, 最大値] で範囲を指定）
{ "id": "A", "title": "ストレスほぼなし", "range": [5, 8],   ... }
{ "id": "B", "title": "ストレス軽度",     "range": [9, 12],  ... }
{ "id": "C", "title": "ストレスやや高め", "range": [13, 16], ... }
{ "id": "D", "title": "ストレス高い",     "range": [17, 20], ... }
```

### カスタマイズのポイント

| やりたいこと | 方法 |
|---|---|
| 質問数を変更 | `questions` 配列の要素を増減 |
| 2択 / 3択 / 4択 | 各質問の `choices` 配列の要素数を変更 |
| スコア方式を変更 | `settings.scoringMode` を `"highest"` or `"range"` に設定 |
| 結果パターンを増やす | `results` 配列に追加し、`scores` のキーまたは `range` を合わせる |
| 質問に画像を表示 | `questions[].image` に画像URLを設定 |
| 結果に画像を表示 | `results[].image` に画像URLを設定 |
| 結果を別ページで表示 | `results[].url` にURLを設定（遷移先で結果を表示） |
| スタイルを変更 | `.dmod-*` プレフィックスのCSSを上書き |

## デモの実行

ローカルサーバーで起動してください（fetch APIのため file:// では動作しません）。

```bash
# Python
python3 -m http.server 8080 --directory diagnostic-content-template

# Node.js (npx)
npx serve diagnostic-content-template
```

ブラウザで `http://localhost:8080/demo/` を開きます。

## 特徴

- **依存ライブラリなし** — バニラJS単一ファイル
- **スコープドCSS** — `.dmod-` プレフィックスで既存CSSと競合しない
- **レスポンシブ対応** — モバイルでも自動調整
- **アニメーション** — fade / slide を設定で切り替え
- **コールバックAPI** — 結果取得後に任意の処理を実行可能
