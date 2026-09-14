import { describe, expect, it } from 'vitest';
import { isAssigneeEmpty, isAssigneeRequiredStatus, isStatusNotStarted } from './record-helpers';

type SavedFields = kintone.types.SavedFields;

const buildRecord = (overrides: Partial<SavedFields>): SavedFields => overrides as SavedFields;

describe('isAssigneeEmpty', () => {
  const cases: Array<[string, Partial<SavedFields>, boolean]> = [
    ['対応者フィールド自体が未定義', {}, true],
    ['対応者が空配列', { 対応者: { type: 'USER_SELECT', value: [] } }, true],
    [
      '対応者が設定済み',
      { 対応者: { type: 'USER_SELECT', value: [{ code: 'user1', name: 'ユーザー1' }] } },
      false,
    ],
  ];

  it.each(cases)('%s => %s', (_label, overrides, expected) => {
    expect(isAssigneeEmpty(buildRecord(overrides))).toBe(expected);
  });
});

describe('isStatusNotStarted', () => {
  it.each([
    ['未処理', '未処理', true],
    ['進行中', '進行中', false],
    ['完了', '完了', false],
  ] as const)('ステータスが%sのとき%s', (_label, statusValue, expected) => {
    const record = buildRecord({ ステータス: { type: 'STATUS', value: statusValue } });
    expect(isStatusNotStarted(record)).toBe(expected);
  });
});

describe('isAssigneeRequiredStatus', () => {
  it.each([
    ['未処理', '未処理', false],
    ['進行中', '進行中', true],
    ['受入テスト中', '受入テスト中', true],
    ['完了', '完了', true],
  ] as const)('ステータスが%sのとき%s', (_label, statusValue, expected) => {
    const record = buildRecord({ ステータス: { type: 'STATUS', value: statusValue } });
    expect(isAssigneeRequiredStatus(record)).toBe(expected);
  });
});
