import { describe, expect, it } from 'vitest';
import {
  isApproverEmpty,
  isAssigneeEmpty,
  isAssigneeRequiredStatus,
  isPrivate,
  isStatusNotStarted,
} from './record-helpers';
import type { SavedFields } from './kintone-events';
import { buildSavedFields } from '../../test/record-builders';

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
    expect(isAssigneeEmpty(buildSavedFields(overrides))).toBe(expected);
  });
});

describe('isStatusNotStarted', () => {
  it.each([
    ['未処理', '未処理', true],
    ['進行中', '進行中', false],
    ['完了', '完了', false],
  ] as const)('ステータスが%sのとき%s', (_label, statusValue, expected) => {
    const record = buildSavedFields({ ステータス: { type: 'STATUS', value: statusValue } });
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
    const record = buildSavedFields({ ステータス: { type: 'STATUS', value: statusValue } });
    expect(isAssigneeRequiredStatus(record)).toBe(expected);
  });
});

describe('isApproverEmpty', () => {
  const cases: Array<[string, Partial<SavedFields>, boolean]> = [
    ['承認者フィールド自体が未定義', {}, true],
    ['承認者が空配列', { 承認者: { type: 'USER_SELECT', value: [] } }, true],
    [
      '承認者が設定済み',
      { 承認者: { type: 'USER_SELECT', value: [{ code: 'user1', name: 'ユーザー1' }] } },
      false,
    ],
  ];

  it.each(cases)('%s => %s', (_label, overrides, expected) => {
    expect(isApproverEmpty(buildSavedFields(overrides))).toBe(expected);
  });
});

describe('isPrivate', () => {
  const cases: Array<[string, Partial<SavedFields>, boolean]> = [
    ['非公開フィールド自体が未定義', {}, false],
    ['非公開チェックなし', { 非公開: { type: 'CHECK_BOX', value: [] } }, false],
    ['非公開チェックあり', { 非公開: { type: 'CHECK_BOX', value: ['非公開'] } }, true],
  ];

  it.each(cases)('%s => %s', (_label, overrides, expected) => {
    expect(isPrivate(buildSavedFields(overrides))).toBe(expected);
  });
});
