export const FIELD_CODES = {
  TICKET_NO: 'チケットNo',
  STATUS: 'ステータス',
  ASSIGNEE: '対応者',
  APPROVER: '承認者',
  PRIVATE: '非公開',
  TITLE: '件名',
  DESCRIPTION: '詳細',
  PRIORITY: '優先度',
  DISPLAY_ORDER: '表示順',
  TYPE: '種別',
  CATEGORY: 'カテゴリ',
  MILESTONE_ID: 'マイルストーンid',
  PARENT: '親',
} as const;

export const STATUS_VALUES = {
  NOT_STARTED: '未処理',
  IN_PROGRESS: '進行中',
  ACCEPTANCE_TESTING: '受入テスト中',
  COMPLETED: '完了',
} as const;

export const PRIORITY_VALUES = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
} as const;

export const PRIVATE_VALUE = '非公開';
export const ASSIGN_ACTION_NAME = '割り当てる';
