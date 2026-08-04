
# `/docs/commo-line-spec.md`

# LINE連携機能仕様

## 1. 概要

有明乳業のLINE公式アカウントと管理システムを連携する。

LINEユーザー情報、顧客との紐付け、LINE注文、メッセージ履歴、通知、セグメント、配信履歴、LINE分析を管理する。

本仕様は別PCに存在する `commo.` の仕様を参考に、現在のプロジェクト内へ新規実装する。

---

## 2. 主な機能

* LINEログイン
* LIFF
* LINE userId取得
* LINEプロフィール取得
* LINEユーザー保存
* LINEユーザーと顧客の紐付け
* LINE Webhook受信
* follow保存
* unfollow保存
* message保存
* postback保存
* LINE注文
* 注文ステータス連携
* 注文受付通知
* 配送予定通知
* 配送完了通知
* LINEメッセージ履歴
* 未対応メッセージ
* 対応済み管理
* セグメント
* 一斉配信
* 配信履歴
* LINE分析
* LINE設定

---

## 3. 関連画面案

```text
/line
/line/users
/line/users/[lineUserId]
/line/messages
/line/orders
/line/segments
/line/broadcasts
/line/analytics
/line/settings
```

---

## 4. 顧客との紐付け

LINEユーザーと顧客は直接同一データとして扱わず、IDで紐付ける。

```ts
type LineUser = {
  id: string;
  companyId: string;
  lineUserId: string;
  customerId?: string | null;
  displayName?: string;
  pictureUrl?: string;
  email?: string;
  phone?: string;
  followed: boolean;
  blocked: boolean;
  tags: string[];
  lastInteractionAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
```

紐付け方法：

* 顧客番号
* 電話番号
* 氏名
* LINE上での本人確認
* 管理画面からの手動紐付け

自動候補は表示してよいが、自動確定は行わない。

---

## 5. LINE注文

LINE注文は専用コレクションへ分離せず、通常注文と同じ `orders` へ保存する。

```ts
type OrderChannel = "admin" | "phone" | "line" | "shopify";
```

LINE注文時に保存する情報：

* companyId
* officeId
* customerId
* lineUserId
* orderChannel
* 商品
* 数量
* 金額
* 配送希望日
* 配送先
* 備考
* 注文日時
* 注文ステータス

注文ステータス：

* received
* checking
* confirmed
* preparing
* delivering
* completed
* cancelled

---

## 6. Webhook

Webhookで受け取るイベント：

* follow
* unfollow
* message
* postback
* accountLink
* memberJoined
* memberLeft

基本フロー：

1. LINEからWebhookを受信する
2. 署名を検証する
3. raw eventを保存する
4. イベント種別を判定する
5. lineUsersを更新する
6. lineMessagesなどへ保存する
7. 必要に応じて注文処理を行う
8. 成功レスポンスを返す

注意：

* 同じWebhookが再送される可能性を考慮する
* webhookEventId等で重複処理を防止する
* 署名不正時は処理しない
* Webhook処理は短時間で返す
* 重い処理はCloud Runやジョブへ分離する

---

## 7. 通知

対応する通知：

* 注文受付
* 注文確定
* 配送予定
* 配送完了
* 不在
* 再配達
* 商品案内
* 解約防止案内

通知しない条件：

* LINE userIdなし
* ブロック中
* 通知設定OFF
* メッセージ本文なし
* LINE接続設定なし
* アクセストークンなし

通知結果：

```ts
type LineSendResult = {
  status: "sent" | "skipped" | "failed";
  messageId?: string;
  reason?: string;
};
```

---

## 8. メッセージ管理

* 受信メッセージ保存
* 送信メッセージ保存
* 顧客別表示
* LINEユーザー別表示
* 未対応表示
* 対応済み設定
* 対応担当者設定
* 社内メモ
* テンプレート返信
* 送信失敗表示

---

## 9. セグメント・配信

セグメント条件例：

* 営業所
* 配送エリア
* 契約状態
* 購入商品
* 最終購入日
* 購入回数
* 解約リスク
* LINE反応状況
* タグ
* 年代
* ポイント残高

配信時に保存する情報：

* 配信対象条件
* 対象人数
* 送信数
* 成功数
* 失敗数
* 除外数
* メッセージ内容
* 実行者
* 実行日時

初期段階では予約配信やA/Bテストは必須としない。

---

## 10. セキュリティ

* Webhook署名を検証する
* LINEチャネルシークレットを公開しない
* LINEアクセストークンをクライアント側へ渡さない
* Secret Managerまたはサーバー環境変数を利用する
* APIログへ秘密情報を出力しない
* 管理画面APIではFirebase ID Tokenを検証する
* companyIdを必ず検証する
* 配信APIにはレート制限を設定する
* 顧客紐付け操作を監査ログへ保存する
