// @kintone/dts-genのkintone.events.on()はhandlerの引数を`any`としか
// 型付けしないため、イベントごとに実際に使うプロパティのみの最小限の型を補う。
type SavedFields = kintone.types.SavedFields;

export interface RecordIndexShowEvent {
  records: SavedFields[];
}

export interface RecordSubmitEvent {
  record: SavedFields;
}

export interface RecordSubmitSuccessEvent {
  record: SavedFields;
  recordId: number;
}

export interface RecordShowEvent {
  record: SavedFields;
}
