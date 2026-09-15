import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeStatusAction, isRevisionConflictError } from './status-action';

beforeEach(() => {
  vi.mocked(kintone.api).mockImplementation(() => Promise.resolve({}));
});

describe('executeStatusAction', () => {
  it('PUT /k/v1/record/statusにアクション名とrevisionを渡して実行する', () => {
    executeStatusAction({ app: 76, id: 42, action: '割り当てる', assignee: 'user1', revision: '3' });

    expect(kintone.api.url).toHaveBeenCalledWith('/k/v1/record/status', true);
    expect(kintone.api).toHaveBeenCalledWith('/k/v1/record/status', 'PUT', {
      app: 76,
      id: 42,
      action: '割り当てる',
      assignee: 'user1',
      revision: '3',
    });
  });
});

describe('isRevisionConflictError', () => {
  it.each([
    ['GAIA_CO02エラー', { code: 'GAIA_CO02' }, true],
    ['別のエラーコード', { code: 'GAIA_IL03' }, false],
    ['codeプロパティなし', {}, false],
    ['null', null, false],
    ['Errorインスタンス以外の値', 'some error', false],
  ])('%s => %s', (_label, error, expected) => {
    expect(isRevisionConflictError(error)).toBe(expected);
  });
});
