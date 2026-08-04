

# `/docs/selmo-meeting-analysis-spec.md`

# 商談・テレアポAI分析機能仕様

## 1. 概要

営業担当者が商談またはテレアポの音声ファイル、もしくは文字起こしテキストを登録し、AIによって会話内容を分析する機能。

音声の場合は文字起こしと話者分離を行い、会話ログを生成する。

その後、AIが要約、顧客温度感、検討度、営業評価、改善点、改善フレーズ、マニュアル準拠状況を生成する。

本仕様は別PCに存在する `selmo.` の仕様を参考に、現在のプロジェクト内へ新規実装する。

---

## 2. 利用ユーザー

* 営業スタッフ
* 本部管理者
* システム管理者

---

## 3. 関連画面案

```text
/sales/meetings
/sales/meetings/upload
/sales/meetings/[meetingId]
/sales/meetings/[meetingId]/analysis
/sales/analysis
/admin/meetings/[meetingId]
```

---

## 4. 入力方法

### 音声入力

対応形式：

* mp3
* m4a
* wav

### テキスト入力

* 既存の文字起こしログを貼り付ける
* 20文字以上を必須とする

---

## 5. できること

* 商談・テレアポを区別する
* 顧客と紐付ける
* 担当営業と紐付ける
* 商材と紐付ける
* 音声ファイルをStorageへ保存する
* 音声を文字起こしする
* 話者ごとの会話ログへ整理する
* AI要約を作成する
* 顧客温度感を判定する
* 検討度を0〜100で算出する
* 営業評価を表示する
* 改善点を表示する
* 改善フレーズを表示する
* マニュアル準拠状況を表示する
* 顧客タイムラインへ表示する
* 営業担当者分析へ反映する
* AI利用量を保存する
* 処理状況とエラーを保存する

---

## 6. 処理フロー

1. ユーザーが音声またはテキスト入力を選択する
2. 顧客、商材、目的、日時、結果などを入力する
3. 権限・利用上限・入力条件を確認する
4. meetingsへ基本データを作成する
5. 音声の場合はStorageへアップロードする
6. 文字起こし処理を開始する
7. 必要に応じてCloud Runへ処理を依頼する
8. 文字起こしセグメントを保存する
9. 会話ログを話者別に整理する
10. AI分析を実行する
11. 分析結果をmeetingsへ保存する
12. 顧客タイムラインへ関連付ける
13. 営業担当者分析へ反映する
14. 結果画面で表示する

---

## 7. 入力データ

```ts
type SalesDomain = "meeting" | "teleapo";

type MeetingStatus = "won" | "considering" | "lost";

type MeetingInput = {
  companyId: string;
  officeId: string;
  userId: string;
  customerId?: string | null;
  salesDomain: SalesDomain;
  customerName: string;
  productId?: string | null;
  productName: string;
  customerType: "new" | "existing";
  meetingPurpose: string;
  recordedAt: Date;
  location?: string;
  memo?: string;
  status: MeetingStatus;
  audioFile?: File;
  audioDurationSec?: number;
  transcriptText?: string;
};
```

---

## 8. バリデーション

| 項目       | 条件       | エラー時    |
| -------- | -------- | ------- |
| ログイン     | 未ログイン    | ログインへ戻す |
| 権限       | 利用権限なし   | 登録不可    |
| 音声       | 音声入力で未選択 | エラー     |
| テキスト     | 20文字未満   | エラー     |
| 音声形式     | 対応外      | エラー     |
| 音声時間     | 取得不可     | エラー     |
| 音声時間     | 会社上限超過   | エラー     |
| 実施日時     | 未入力・不正   | エラー     |
| 月間上限     | 到達       | 登録不可    |
| OpenAI設定 | 未設定      | AI処理不可  |

---

## 9. 処理ステータス

```ts
type MeetingProcessingStatus =
  | "draft"
  | "uploading"
  | "uploaded"
  | "queued"
  | "transcribing"
  | "separating_speakers"
  | "analyzing"
  | "completed"
  | "failed";
```

---

## 10. データ構造案

```ts
type TranscriptSegment = {
  startSec: number;
  endSec: number;
  text: string;
  speaker?: string | null;
};

type ConversationLog = {
  id: string;
  speaker:
    | "sales"
    | "customer"
    | "participant"
    | "speaker_1"
    | "speaker_2"
    | "unknown";
  label: string;
  text: string;
  sourceSegmentIndexes: number[];
  confidence: "estimated" | "aligned";
};

type MeetingAnalysis = {
  overview: string;
  bullets: string[];
  customerTemperature: {
    level: "low" | "middle" | "high";
    score: number;
    label: string;
    reason: string;
  };
  consideration: {
    score: number;
    label: string;
    reason: string;
  };
  salesEvaluation: {
    key: string;
    label: string;
    score: number;
    reason: string;
  }[];
  strengths: string[];
  improvements: string[];
  improvementPhrases: string[];
  manualChecklistItems: {
    label: string;
    achieved: boolean;
    reason: string;
  }[];
};
```

---

## 11. 保存先

### Firestore

* meetings
* audioProcessingJobs
* aiUsageLogs
* systemErrorLogs
* salesActivityEvents
* customerTimeline
* salesRepAnalysisProfiles

### Storage

```text
companies/{companyId}/meetings/{meetingId}/original/{fileName}
companies/{companyId}/meetings/{meetingId}/converted/{fileName}
```

---

## 12. AI利用ルール

* AI結果を業務上の確定事項として自動反映しない
* 判定理由を保存する
* 使用モデルを保存する
* 実行日時を保存する
* 入力・出力tokenを保存する
* 推定コストを保存する
* 失敗時のログを保存する
* 再分析回数を保存する
* 同一入力の重複分析を防止する
* APIキーはSecret Managerまたはサーバー環境変数で管理する