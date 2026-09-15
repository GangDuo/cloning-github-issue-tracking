// プロセス管理下のステータスは値を直接PUTできず、PUT /k/v1/record/statusに
// アクション名を指定して実行する必要がある。assign-action-on-save.tsの
// 実装を汎用化し、レコード更新処理全般で使う共通処理としてここに切り出す。
export interface StatusActionRequest {
  app: number;
  id: number;
  action: string;
  assignee?: string;
  revision: string | undefined;
}

export const executeStatusAction = (request: StatusActionRequest) =>
  kintone.api(kintone.api.url('/k/v1/record/status', true), 'PUT', request);

// kintoneのレコード競合エラーコード(GAIA_CO02)を判定する。呼び出し側は
// この判定結果で「先祖返り防止のため元に戻して再取得する」処理に分岐する。
export const isRevisionConflictError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as { code?: string }).code === 'GAIA_CO02';
