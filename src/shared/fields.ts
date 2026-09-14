export const FIELD_CODES = {
  TICKET_NO: 'チケットNo',
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
