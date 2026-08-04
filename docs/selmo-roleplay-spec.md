
# `/docs/selmo-roleplay-spec.md`

# AIロープレ機能仕様

## 1. 概要

営業担当者がAI顧客を相手に、商談またはテレアポの練習を行う機能。

営業担当者の音声を文字起こしし、AIが顧客役として返答する。ロープレ終了後、会話全体をAIが採点し、強み、改善点、改善フレーズ、評価基準の達成状況を表示する。

本仕様は別PCに存在する既存プロダクト `selmo.` の仕様を参考にしている。

このプロジェクトにはselmo.のソースコードが存在しないため、既存コードの移植ではなく、現在のプロジェクト内へ新規実装する。

---

## 2. 利用ユーザー

* 営業スタッフ
* 本部管理者
* システム管理者

---

## 3. 利用シーン

* 商談前の事前練習
* テレアポ前の切り返し練習
* 商談分析後の弱点克服
* 管理者から配信された課題の実施
* 新商品や新しい営業トークの練習

---

## 4. 関連画面案

```text
/sales/roleplay
/sales/roleplay/scenarios
/sales/roleplay/results
/sales/roleplay/results/[resultId]
/admin/roleplay
/admin/roleplay/scenarios
/admin/roleplay/results
/admin/roleplay/results/[resultId]
```

---

## 5. できること

* 商談とテレアポを分けて実施する
* シナリオを選択する
* シナリオを作成する
* AIでシナリオを生成する
* 商材を設定する
* 顧客属性を設定する
* 顧客役職を設定する
* 想定反論を設定する
* 難易度を設定する
* マイクで営業発話を録音する
* 音声を文字起こしする
* AI顧客が会話文脈に沿って返答する
* AI顧客の返答を音声で読み上げる
* 会話ログを保存する
* 終了後にAI採点する
* 強みを表示する
* 改善点を表示する
* 改善フレーズを表示する
* 評価基準達成状況を表示する
* 管理者がシナリオを全員へ公開する
* 管理者が特定ユーザーへ課題配信する
* ロープレ結果を一覧・詳細表示する

---

## 6. 制限

* マイク非対応ブラウザでは録音不可
* マイク許可がない場合は録音不可
* 1回の録音は2秒以上60秒以下
* 1セッションの録音合計は最大600秒
* 営業発話は最大12回
* 会話ログが2件未満の場合は採点不可
* 月間利用上限が0回の場合は利用不可
* 月間利用上限到達時は利用不可
* OpenAI APIキー未設定時は文字起こし・AI応答・評価不可
* AI応答に失敗した場合はfallback応答になる可能性がある
* AI評価結果の完全な正確性は保証しない

---

## 7. 処理フロー

1. ユーザーが商談またはテレアポを選択する
2. シナリオを選択する
3. 必要に応じてシナリオをAI生成する
4. ロープレセッションを開始する
5. 営業担当者が録音を開始する
6. 録音条件を確認する
7. 音声を文字起こしAPIへ送信する
8. 営業発話を会話ログへ追加する
9. 会話ログとシナリオをAI応答APIへ送信する
10. AI顧客の返答を表示する
11. AI顧客の返答を音声で読み上げる
12. 会話を繰り返す
13. ユーザーが「終了して採点」を押す
14. 会話全体をAI評価APIへ送信する
15. 評価結果を保存する
16. 結果画面へ遷移する

---

## 8. 判定ルール

| 判定            | 条件        | 処理         |
| ------------- | --------- | ---------- |
| ログイン          | 未ログイン     | ログインページへ戻す |
| 権限            | 利用権限なし    | エラー表示      |
| シナリオ          | 未選択       | 選択画面へ誘導    |
| 月間上限          | 0回または上限到達 | 利用停止       |
| MediaRecorder | 非対応       | エラー表示      |
| マイク           | 許可なし      | エラー表示      |
| 録音時間          | 2秒未満      | 文字起こししない   |
| 録音時間          | 60秒超過     | 自動停止       |
| セッション合計       | 600秒超過    | 採点へ誘導      |
| 営業発話          | 12回以上     | 採点へ誘導      |
| 会話ログ          | 2件未満      | 採点不可       |
| API利用上限       | 超過        | 429エラー     |
| OpenAI設定      | 未設定       | AI処理不可     |

---

## 9. 入力データ

```ts
type RoleplayType = "meeting" | "teleapo";

type RoleplayDifficulty = "easy" | "normal" | "hard";

type RoleplayMessage = {
  role: "sales" | "customer";
  content: string;
  createdAt: string;
};

type RoleplayScenario = {
  id: string;
  companyId: string;
  officeId?: string | null;
  roleplayType: RoleplayType;
  title: string;
  description: string;
  productId?: string | null;
  productName?: string;
  scenarioCategory?: "new" | "existing" | "";
  targetSegment?: string;
  customerRole: string;
  customerProfile: string;
  goal: string;
  objections: string[];
  evaluationCriteria: string[];
  difficulty: RoleplayDifficulty;
  visibility: "draft" | "all";
  createdBy: string;
};
```

---

## 10. 出力データ

```ts
type RoleplayResult = {
  id: string;
  companyId: string;
  officeId?: string | null;
  scenarioId: string;
  scenarioTitle: string;
  roleplayType: RoleplayType;
  productName?: string;
  userId: string;
  sessionId: string;
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  improvementPhrases: string[];
  evaluationCriteria: string[];
  manualChecklistItems?: {
    label: string;
    achieved: boolean;
    reason?: string;
  }[];
  messages: RoleplayMessage[];
  audioDurationSec: number;
  salesMessageCount: number;
  createdAt: Date;
};
```

---

## 11. API案

```text
POST /api/roleplay/transcribe
POST /api/roleplay/respond
POST /api/roleplay/evaluate
POST /api/roleplay/generate-scenario
```

各APIで以下を行う。

* Firebase ID Token検証
* companyId検証
* 利用権限確認
* 月間上限確認
* 入力バリデーション
* レート制限
* AI利用ログ保存
* エラーログ保存

---

## 12. 使用データ

### 参照

* users
* companies
* products
* roleplayScenarios
* roleplayAssignments
* analysisConfigs
* manuals
* meetings
* salesRepAnalysisProfiles

### 保存

* roleplayScenarios
* roleplayAssignments
* roleplayResults
* roleplayResultComments
* aiUsageLogs
* systemErrorLogs
* salesActivityEvents

---

## 13. コスト制御

* 文字起こし利用時間を記録する
* AI応答のinput/output tokenを記録する
* AI評価のinput/output tokenを記録する
* companyId・userId単位で利用量を集計する
* 月間上限を設定する
* 同一評価にはキャッシュを利用する
* API失敗時も失敗ログを保存する
* APIキーをクライアント側へ渡さない
