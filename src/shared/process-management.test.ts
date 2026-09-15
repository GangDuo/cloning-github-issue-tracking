import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchStatusTransitions } from './process-management';

const RESPONSE = {
  actions: [
    { name: '割り当てる', from: '未処理', to: '進行中', type: 'PRIMARY' },
    { name: '受入テストを依頼する', from: '進行中', to: '受入テスト中', type: 'PRIMARY' },
    { name: '修正しない', from: '進行中', to: '完了', type: 'PRIMARY' },
    { name: '完了する', from: '受入テスト中', to: '完了', type: 'PRIMARY' },
    { name: '差戻す', from: '受入テスト中', to: '進行中', type: 'PRIMARY' },
    { name: '取消す', from: '受入テスト中', to: '進行中', type: 'SECONDARY' },
  ],
};

beforeEach(() => {
  vi.mocked(kintone.api).mockImplementation(() => Promise.resolve(RESPONSE));
});

describe('fetchStatusTransitions', () => {
  it('GET /k/v1/app/statusを呼び出す', async () => {
    await fetchStatusTransitions(76);

    expect(kintone.api.url).toHaveBeenCalledWith('/k/v1/app/status', true);
    expect(kintone.api).toHaveBeenCalledWith('/k/v1/app/status', 'GET', { app: 76 });
  });

  it('定義済みの遷移はアクション名を返す', async () => {
    const transitions = await fetchStatusTransitions(76);

    expect(transitions.resolveAction('未処理', '進行中')).toBe('割り当てる');
    expect(transitions.resolveAction('進行中', '受入テスト中')).toBe('受入テストを依頼する');
    expect(transitions.resolveAction('進行中', '完了')).toBe('修正しない');
    expect(transitions.resolveAction('受入テスト中', '完了')).toBe('完了する');
  });

  it('同じfrom/toに複数アクションがある場合はPRIMARYを優先する', async () => {
    const transitions = await fetchStatusTransitions(76);

    expect(transitions.resolveAction('受入テスト中', '進行中')).toBe('差戻す');
  });

  it('定義されていない遷移はundefinedを返す', async () => {
    const transitions = await fetchStatusTransitions(76);

    expect(transitions.resolveAction('未処理', '完了')).toBeUndefined();
    expect(transitions.resolveAction('完了', '進行中')).toBeUndefined();
  });
});
