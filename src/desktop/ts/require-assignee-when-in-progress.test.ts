import { describe, expect, it } from 'vitest';
import { validateAssigneeRequired } from './require-assignee-when-in-progress';

type SavedFields = kintone.types.SavedFields;

const buildRecord = (overrides: Partial<SavedFields>): SavedFields => overrides as SavedFields;

const ASSIGNEE = { code: 'user1', name: 'ユーザー1' };
const ERROR_MESSAGE = 'ステータスが進行中以降の場合、対応者を設定してください。';

describe('validateAssigneeRequired', () => {
  it.each([
    ['未処理', [], false],
    ['進行中', [], true],
    ['受入テスト中', [], true],
    ['完了', [], true],
    ['進行中', [ASSIGNEE], false],
  ] as const)(
    'ステータス=%s, 対応者数=%i のときエラー付与=%s',
    (status, assignees, shouldError) => {
      const record = buildRecord({
        ステータス: { type: 'STATUS', value: status },
        対応者: { type: 'USER_SELECT', value: [...assignees] },
      });

      validateAssigneeRequired({ record });

      expect(record.対応者.error).toBe(shouldError ? ERROR_MESSAGE : undefined);
    },
  );

  it('event自体を返す', () => {
    const record = buildRecord({
      ステータス: { type: 'STATUS', value: '未処理' },
      対応者: { type: 'USER_SELECT', value: [] },
    });
    const event = { record };

    expect(validateAssigneeRequired(event)).toBe(event);
  });
});
