// @kintone/dts-genはSTATUS/CATEGORYタイプのフィールドの型を生成しないため、
// 宣言マージでkintone.types.SavedFieldsに手動で補完する。
declare namespace kintone.fieldTypes {
  interface Status {
    type?: 'STATUS';
    value: string;
  }

  interface Category {
    type?: 'CATEGORY';
    value: string[];
  }
}

declare namespace kintone.types {
  interface SavedFields {
    ステータス: kintone.fieldTypes.Status;
    // アプリ設定でカテゴリー機能自体が無効化されているため、レコードには含まれない場合がある
    カテゴリー?: kintone.fieldTypes.Category;
  }
}
