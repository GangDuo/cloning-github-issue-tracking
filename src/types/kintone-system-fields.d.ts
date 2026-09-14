// @kintone/dts-genはSTATUSタイプのフィールドの型を生成しないため、
// 宣言マージでkintone.types.SavedFieldsに手動で補完する。
declare namespace kintone.fieldTypes {
  interface Status {
    type?: 'STATUS';
    value: string;
  }
}

declare namespace kintone.types {
  interface SavedFields {
    ステータス: kintone.fieldTypes.Status;
  }
}
