declare namespace kintone.types {
  interface SavedFields {
    完了予定日: kintone.fieldTypes.Date;
    親: kintone.fieldTypes.SingleLineText;
    開始予定日: kintone.fieldTypes.Date;
    詳細: kintone.fieldTypes.RichText;
    優先度: kintone.fieldTypes.DropDown;
    起票者: kintone.fieldTypes.DropDown;
    種別: kintone.fieldTypes.DropDown;
    マイルストーンid: kintone.fieldTypes.Number;
    ルックアップ: kintone.fieldTypes.SingleLineText;
    件名: kintone.fieldTypes.SingleLineText;

    非公開: kintone.fieldTypes.CheckBox;
    対応者: kintone.fieldTypes.UserSelect;
    承認者: kintone.fieldTypes.UserSelect;
    添付ファイル: kintone.fieldTypes.File;
    対応状況: {
      type: "SUBTABLE";
      value: Array<{
        id: string;
        value: {
          コメント: kintone.fieldTypes.RichText;
          日付_0: kintone.fieldTypes.Date;

          担当者: kintone.fieldTypes.UserSelect;
          添付ファイル_0: kintone.fieldTypes.File;
        };
      }>;
    };
  }
  interface SavedSavedFields extends SavedFields {
    $id: kintone.fieldTypes.Id;
    $revision: kintone.fieldTypes.Revision;
    更新者: kintone.fieldTypes.Modifier;
    作成者: kintone.fieldTypes.Creator;
    チケットNo: kintone.fieldTypes.RecordNumber;
    更新日時: kintone.fieldTypes.UpdatedTime;
    作成日時: kintone.fieldTypes.CreatedTime;
  }
}
