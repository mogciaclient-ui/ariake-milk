
# `/docs/firestore-design.md`

# Firestore設計

## 1. 設計方針

* `companyId` をデータ境界の基本とする
* 営業所に所属するデータは `officeId` を持つ
* 顧客関連データは `customerId` を持つ
* 操作者を追跡するデータは `createdBy`、`updatedBy` を持つ
* 過去実績を後から書き換えない
* Firestore Rulesだけに依存せず、サーバー側でも権限を検証する
* 大量データはページネーションを前提とする
* 変更履歴は監査ログへ保存する
* 日時はFirestore Timestampで保存する
* 表示用名称だけでデータを紐付けない
* 削除は原則として論理削除を検討する

---

## 2. 共通フィールド

主要コレクションでは可能な限り以下を使用する。

```ts
type CommonFields = {
  companyId: string;
  officeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
};
```

---

## 3. 主要コレクション

### companies

会社情報。

主なフィールド：

* name
* status
* plan
* timezone
* aiUsageLimits
* createdAt
* updatedAt

---

### offices

営業所情報。

主なフィールド：

* companyId
* name
* code
* address
* phone
* deliveryAreas
* status

推奨インデックス：

* companyId + status
* companyId + code

---

### users

ユーザー情報。

Firebase AuthenticationのuidをドキュメントIDとして利用する案を優先する。

主なフィールド：

* companyId
* officeId
* email
* displayName
* role
* status
* assignedCustomerIds
* assignedRouteIds
* lastLoginAt

権限：

* 本人は一部項目を閲覧可能
* 本部・管理者は全社ユーザーを管理可能
* 事務は所属営業所ユーザーを限定的に閲覧可能

---

### customers

顧客情報。

主なフィールド：

* companyId
* officeId
* customerNumber
* name
* nameKana
* phone
* email
* postalCode
* address
* deliveryAddress
* latitude
* longitude
* assignedSalesUserId
* assignedDeliveryUserId
* contractStatus
* status
* notes

推奨インデックス：

* companyId + officeId + status
* companyId + customerNumber
* companyId + phone
* companyId + assignedSalesUserId
* companyId + contractStatus

---

### contracts

契約情報。

主なフィールド：

* companyId
* officeId
* customerId
* status
* startDate
* endDate
* productItems
* deliveryFrequency
* deliveryDays
* pausePeriods
* notes

---

### contractDeliveryRules

契約上の配送ルール。

主なフィールド：

* companyId
* officeId
* customerId
* contractId
* weekday
* frequency
* quantity
* validFrom
* validTo
* holidayRule
* allowCombinedDelivery

契約ルールと実際の配送実績を分離する。

---

### deliverySchedules

日付単位の配送予定。

主なフィールド：

* companyId
* officeId
* deliveryDate
* routeId
* assignedUserId
* status
* taskCount

---

### deliveryTasks

顧客単位の配送タスク。

主なフィールド：

* companyId
* officeId
* scheduleId
* routeId
* customerId
* assignedUserId
* deliveryDate
* sequence
* products
* addressSnapshot
* customerNameSnapshot
* status
* startedAt
* completedAt
* deliveryMemo
* photoPaths
* retryCount

過去の配送実績を維持するため、顧客名や住所など必要な項目はスナップショット保存を検討する。

---

### deliveryRoutes

配送ルート。

主なフィールド：

* companyId
* officeId
* name
* assignedUserId
* deliveryDate
* taskIds
* status

---

### orders

注文情報。

主なフィールド：

* companyId
* officeId
* customerId
* lineUserId
* orderNumber
* orderChannel
* orderStatus
* orderedAt
* requestedDeliveryDate
* deliveryAddress
* subtotal
* total
* notes

---

### orderItems

注文商品。

サブコレクションまたは配列のどちらにするか、商品数と更新方法を確認して決定する。

主なフィールド：

* orderId
* productId
* productNameSnapshot
* unitPrice
* quantity
* amount

---

### products

商品情報。

主なフィールド：

* companyId
* productCode
* name
* categoryId
* description
* price
* imagePath
* status
* approvalStatus
* salesPeriod

---

### productApprovals

商品承認履歴。

主なフィールド：

* companyId
* officeId
* productId
* requestType
* beforeData
* afterData
* status
* requestedBy
* reviewedBy
* reviewedAt
* comment

---

### salesActivities

営業活動。

主なフィールド：

* companyId
* officeId
* customerId
* userId
* activityType
* occurredAt
* location
* content
* result
* nextActionAt
* notes
* attachmentPaths

---

### meetings

商談・テレアポ。

詳細は `selmo-meeting-analysis-spec.md` を参照。

主なフィールド：

* companyId
* officeId
* customerId
* userId
* salesDomain
* productId
* recordedAt
* status
* audioFilePath
* processingStatus
* transcriptText
* transcriptSegments
* conversationLogs
* aiAnalysis

---

### roleplayScenarios

AIロープレシナリオ。

詳細は `selmo-roleplay-spec.md` を参照。

---

### roleplayAssignments

管理者から営業スタッフへの課題配信。

主なフィールド：

* companyId
* officeId
* scenarioId
* assignedToUserId
* assignedByUserId
* dueDate
* status
* completedResultId

---

### roleplayResults

AIロープレ結果。

主なフィールド：

* companyId
* officeId
* userId
* scenarioId
* score
* summary
* strengths
* improvements
* improvementPhrases
* messages
* createdAt

---

### lineUsers

LINEユーザー。

詳細は `commo-line-spec.md` を参照。

---

### lineMessages

LINEメッセージ履歴。

主なフィールド：

* companyId
* lineUserId
* customerId
* direction
* messageType
* content
* status
* handledBy
* handledAt
* sentAt
* receivedAt

---

### lineWebhookEvents

LINE Webhook raw event。

主なフィールド：

* companyId
* webhookEventId
* eventType
* lineUserId
* rawEvent
* processingStatus
* processedAt
* errorMessage

`webhookEventId`を使って重複処理を防止する。

---

### payments

入金情報。

主なフィールド：

* companyId
* officeId
* customerId
* paymentDate
* amount
* paymentMethod
* targetMonth
* notes

---

### billings

請求情報。

主なフィールド：

* companyId
* officeId
* customerId
* billingMonth
* amount
* billingDate
* dueDate
* status
* notes

---

### pointTransactions

ポイント履歴。

現在残高だけを直接変更せず、付与・利用・減算・失効を履歴として保存する。

主なフィールド：

* companyId
* officeId
* customerId
* transactionType
* points
* reason
* referenceType
* referenceId
* expiresAt

---

### incentives

インセンティブ情報。

主なフィールド：

* companyId
* officeId
* userId
* targetMonth
* salesAmount
* achievementCount
* rate
* calculatedAmount
* adjustmentAmount
* finalAmount
* status

---

### notifications

アプリ内通知。

主なフィールド：

* companyId
* officeId
* targetUserId
* type
* title
* body
* referenceType
* referenceId
* readAt

---

### aiUsageLogs

AI利用量・コスト。

主なフィールド：

* companyId
* officeId
* userId
* feature
* model
* requestId
* inputTokens
* outputTokens
* audioDurationSec
* estimatedCost
* status
* errorCode
* createdAt

---

### systemErrorLogs

システムエラー。

主なフィールド：

* companyId
* userId
* feature
* route
* errorCode
* message
* safeContext
* requestId
* occurredAt
* resolvedAt

秘密情報・音声全文・個人情報を無条件に保存しない。

---

### auditLogs

操作履歴。

主なフィールド：

* companyId
* officeId
* userId
* action
* targetCollection
* targetId
* beforeData
* afterData
* ipAddress
* userAgent
* createdAt

---

## 4. データ関係

```text
company
└── offices
    ├── users
    ├── customers
    ├── orders
    ├── deliveries
    └── salesActivities

customer
├── contracts
├── deliveryTasks
├── orders
├── payments
├── billings
├── pointTransactions
├── salesActivities
├── meetings
├── lineUsers
└── cancellations

user
├── office
├── salesActivities
├── meetings
├── roleplayResults
├── deliveryRoutes
└── incentives
```

---

## 5. 未決定事項

実装前に確認する項目：

* 現在の既存コレクション
* Firebase AuthのCustom Claims利用有無
* usersのドキュメントID
* 注文明細を配列にするかサブコレクションにするか
* 顧客タイムラインを実体保存するかクエリで構築するか
* AI分析結果をmeetings内に持つか別コレクションにするか
* 営業所をサブコレクションにするかトップレベルにするか
* 論理削除の共通ルール
* データ保持期間
* 監査ログの保存期間
