export const FIELD_CODES = {
  TICKET_NO: 'チケットNo',
  // 既知のバグ: set-row-class-by-status.tsが本来参照すべきはSTATUSだが、
  // 現状はこのCATEGORYを参照している(アプリ設定でカテゴリー機能自体は無効化済み)。
  // 修正は本タスクとは別ブランチ・別PRで対応する。
  CATEGORY: 'カテゴリー',
  STATUS: 'ステータス',
  ASSIGNEE: '対応者',
  PRIVATE: '非公開',
} as const;

export const STATUS_VALUES = {
  NOT_STARTED: '未処理',
  IN_PROGRESS: '進行中',
  ACCEPTANCE_TESTING: '受入テスト中',
  COMPLETED: '完了',
} as const;

export const PRIVATE_VALUE = '非公開';
export const ASSIGN_ACTION_NAME = '割り当てる';
