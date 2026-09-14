import { beforeEach, describe, expect, it, vi } from 'vitest';
import { advanceStatusIfAssignable } from './assign-action-on-save';
import { buildSavedSavedFields } from '../../../test/record-builders';

const ASSIGNEE = { code: 'user1', name: 'ユーザー1' };

beforeEach(() => {
  // kintone.d.tsのkintone.api()はグローバルPromiseとは別の独自Promiseクラスを
  // 返す型になっているため、mockResolvedValueではなくmockImplementationを使う。
  vi.mocked(kintone.api).mockImplementation(() => Promise.resolve({}));
});

describe('advanceStatusIfAssignable', () => {
  it('未処理×対応者ありのとき、割り当てるアクションをPUTで実行する', async () => {
    const record = buildSavedSavedFields({
      ステータス: { type: 'STATUS', value: '未処理' },
      対応者: { type: 'USER_SELECT', value: [ASSIGNEE] },
      $revision: { type: '__REVISION__', value: '3' },
    });

    advanceStatusIfAssignable({ record, recordId: 42 });

    // executeAssignActionは.then/.catchのみをawaitするfire-and-forgetなので、
    // マイクロタスクの処理を1周待ってから呼び出し内容を検証する。
    await Promise.resolve();

    expect(kintone.api.url).toHaveBeenCalledWith('/k/v1/record/status', true);
    expect(kintone.api).toHaveBeenCalledWith('/k/v1/record/status', 'PUT', {
      app: 76,
      id: 42,
      action: '割り当てる',
      assignee: 'user1',
      revision: '3',
    });
  });

  it('ステータスが未処理以外のときは呼び出さない', () => {
    const record = buildSavedSavedFields({
      ステータス: { type: 'STATUS', value: '進行中' },
      対応者: { type: 'USER_SELECT', value: [ASSIGNEE] },
    });

    advanceStatusIfAssignable({ record, recordId: 1 });

    expect(kintone.api).not.toHaveBeenCalled();
  });

  it('対応者が未設定のときは呼び出さない', () => {
    const record = buildSavedSavedFields({
      ステータス: { type: 'STATUS', value: '未処理' },
      対応者: { type: 'USER_SELECT', value: [] },
    });

    advanceStatusIfAssignable({ record, recordId: 1 });

    expect(kintone.api).not.toHaveBeenCalled();
  });

  it('ハンドラは同期的にeventを返す(fire-and-forget)', () => {
    const record = buildSavedSavedFields({
      ステータス: { type: 'STATUS', value: '未処理' },
      対応者: { type: 'USER_SELECT', value: [ASSIGNEE] },
    });
    const event = { record, recordId: 1 };

    expect(advanceStatusIfAssignable(event)).toBe(event);
  });

  it('API呼び出しが失敗した場合、console.errorに記録する', async () => {
    vi.mocked(kintone.api).mockRejectedValue(new Error('network error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const record = buildSavedSavedFields({
      ステータス: { type: 'STATUS', value: '未処理' },
      対応者: { type: 'USER_SELECT', value: [ASSIGNEE] },
    });

    advanceStatusIfAssignable({ record, recordId: 1 });
    await Promise.resolve().then(() => Promise.resolve());

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'アクション「割り当てる」の自動実行に失敗しました',
      expect.any(Error),
    );
  });
});
