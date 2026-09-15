// PUT /k/v1/recordsは複数レコードの更新をアトミックに行う
// (1件でもrevision不一致等で失敗すると全件がキャンセルされ、
// 部分的な更新は発生しない)。この性質を前提に、呼び出し側は
// 失敗時の補償処理を考える必要がない。
export interface BulkRecordUpdateItem {
  id: number;
  revision: string | undefined;
  record: Record<string, { value: unknown }>;
}

export const executeBulkRecordUpdate = (app: number, records: BulkRecordUpdateItem[]) =>
  kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', { app, records });
