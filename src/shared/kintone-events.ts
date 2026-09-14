// @kintone/dts-genのkintone.events.on()はhandlerの引数を`any`としか
// 型付けしないため、イベントごとに実際に使うプロパティのみの最小限の型を補う。
type SavedFields = kintone.types.SavedFields;
// $id/$revisionは保存済みレコードにのみ存在するため、保存後のレコードを
// 扱うイベント(一覧表示・詳細表示・保存成功後)ではSavedSavedFieldsを使う。
type SavedSavedFields = kintone.types.SavedSavedFields;

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
