// @kintone/dts-genのkintone.events.on()はhandlerの引数を`any`としか
// 型付けしないため、イベントごとに実際に使うプロパティのみの最小限の型を補う。
export type SavedFields = kintone.types.SavedFields;
// $id/$revisionは保存済みレコードにのみ存在するため、保存後のレコードを
// 扱うイベント(一覧表示・詳細表示・保存成功後)ではSavedSavedFieldsを使う。
export type SavedSavedFields = kintone.types.SavedSavedFields;

// カレンダー表示のapp.record.index.show/mobile.app.record.index.showでは
// recordsが日付文字列をキーとするオブジェクトになるが、本プロジェクトは
// カレンダー表示を利用しない(行DOM要素とのindex対応が成立しないため)。
// そのため型は配列のみを表し、実行時ガードはsetRowClassesByStatus
// (set-row-class-by-status.ts)側で行う。
export interface RecordIndexShowEvent {
  records: SavedSavedFields[];
}

// 保存前バリデーション(新規作成時は$id/$revisionが未確定のためSavedFields)
export interface RecordSubmitEvent {
  record: SavedFields;
}

export interface RecordSubmitSuccessEvent {
  record: SavedSavedFields;
  recordId: number;
}

export interface RecordShowEvent {
  record: SavedSavedFields;
}
