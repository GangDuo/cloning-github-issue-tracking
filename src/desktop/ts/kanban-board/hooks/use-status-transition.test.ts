import { beforeEach, describe, expect, it, vi } from 'vitest';
import { changeCardStatus } from './use-status-transition';
import { buildSavedSavedFields } from '../../../../../test/record-builders';
import type { StatusTransitionMap } from '../../../../shared/process-management';

const ASSIGNEE = { code: 'assignee1', name: '対応 太郎' };
const APPROVER = { code: 'approver1', name: '承認 花子' };

const transitionsAllowing = (from: string, to: string, action: string): StatusTransitionMap => ({
  resolveAction: (f, t) => (f === from && t === to ? action : undefined),
});

beforeEach(() => {
  vi.mocked(kintone.api).mockImplementation(() => Promise.resolve({}));
});

describe('changeCardStatus', () => {
  it('同じステータスへの変更はnoopを返しAPIを呼ばない', async () => {
    const record = buildSavedSavedFields({ 対応者: { type: 'USER_SELECT', value: [ASSIGNEE] } });

    const result = await changeCardStatus({
      app: 76,
      recordId: 1,
      revision: '1',
      fromStatus: '進行中',
      toStatus: '進行中',
      record,
      transitions: transitionsAllowing('進行中', '進行中', 'noop'),
    });

    expect(result).toEqual({ type: 'noop' });
    expect(kintone.api).not.toHaveBeenCalled();
  });

  it('遷移が定義されていない場合はrejectedを返す', async () => {
    const record = buildSavedSavedFields({});

    const result = await changeCardStatus({
      app: 76,
      recordId: 1,
      revision: '1',
      fromStatus: '未処理',
      toStatus: '完了',
      record,
      transitions: { resolveAction: () => undefined },
    });

    expect(result).toEqual({
      type: 'rejected',
      reason: 'この状態への変更はプロセス管理で許可されていません',
    });
    expect(kintone.api).not.toHaveBeenCalled();
  });

  it('進行中への変更で対応者が未設定の場合はrejectedを返す', async () => {
    const record = buildSavedSavedFields({ 対応者: { type: 'USER_SELECT', value: [] } });

    const result = await changeCardStatus({
      app: 76,
      recordId: 1,
      revision: '1',
      fromStatus: '未処理',
      toStatus: '進行中',
      record,
      transitions: transitionsAllowing('未処理', '進行中', '割り当てる'),
    });

    expect(result).toEqual({
      type: 'rejected',
      reason: '対応者が未設定のため、進行中に変更できません',
    });
    expect(kintone.api).not.toHaveBeenCalled();
  });

  it('受入テスト中への変更で承認者が未設定の場合はrejectedを返す', async () => {
    const record = buildSavedSavedFields({ 承認者: { type: 'USER_SELECT', value: [] } });

    const result = await changeCardStatus({
      app: 76,
      recordId: 1,
      revision: '1',
      fromStatus: '進行中',
      toStatus: '受入テスト中',
      record,
      transitions: transitionsAllowing('進行中', '受入テスト中', '受入テストを依頼する'),
    });

    expect(result).toEqual({
      type: 'rejected',
      reason: '承認者が未設定のため、受入テスト中に変更できません',
    });
  });

  it('進行中への変更が許可されている場合、対応者をassigneeにしてAPIを呼ぶ', async () => {
    const record = buildSavedSavedFields({ 対応者: { type: 'USER_SELECT', value: [ASSIGNEE] } });

    const result = await changeCardStatus({
      app: 76,
      recordId: 42,
      revision: '3',
      fromStatus: '未処理',
      toStatus: '進行中',
      record,
      transitions: transitionsAllowing('未処理', '進行中', '割り当てる'),
    });

    expect(result).toEqual({ type: 'success' });
    expect(kintone.api).toHaveBeenCalledWith('/k/v1/record/status', 'PUT', {
      app: 76,
      id: 42,
      action: '割り当てる',
      assignee: 'assignee1',
      revision: '3',
    });
  });

  it('受入テスト中への変更が許可されている場合、承認者をassigneeにしてAPIを呼ぶ', async () => {
    const record = buildSavedSavedFields({ 承認者: { type: 'USER_SELECT', value: [APPROVER] } });

    await changeCardStatus({
      app: 76,
      recordId: 42,
      revision: '3',
      fromStatus: '進行中',
      toStatus: '受入テスト中',
      record,
      transitions: transitionsAllowing('進行中', '受入テスト中', '受入テストを依頼する'),
    });

    expect(kintone.api).toHaveBeenCalledWith('/k/v1/record/status', 'PUT', {
      app: 76,
      id: 42,
      action: '受入テストを依頼する',
      assignee: 'approver1',
      revision: '3',
    });
  });

  it('完了への変更(担当者選択不要)はassigneeがundefinedになる', async () => {
    const record = buildSavedSavedFields({});

    await changeCardStatus({
      app: 76,
      recordId: 42,
      revision: '3',
      fromStatus: '進行中',
      toStatus: '完了',
      record,
      transitions: transitionsAllowing('進行中', '完了', '修正しない'),
    });

    expect(kintone.api).toHaveBeenCalledWith('/k/v1/record/status', 'PUT', {
      app: 76,
      id: 42,
      action: '修正しない',
      assignee: undefined,
      revision: '3',
    });
  });

  it('リビジョン競合エラーの場合はconflictを返す', async () => {
    vi.mocked(kintone.api).mockRejectedValue({ code: 'GAIA_CO02' });
    const record = buildSavedSavedFields({});

    const result = await changeCardStatus({
      app: 76,
      recordId: 42,
      revision: '3',
      fromStatus: '進行中',
      toStatus: '完了',
      record,
      transitions: transitionsAllowing('進行中', '完了', '修正しない'),
    });

    expect(result).toEqual({ type: 'conflict' });
  });

  it('その他のエラーの場合はerrorを返す', async () => {
    const apiError = new Error('network error');
    vi.mocked(kintone.api).mockRejectedValue(apiError);
    const record = buildSavedSavedFields({});

    const result = await changeCardStatus({
      app: 76,
      recordId: 42,
      revision: '3',
      fromStatus: '進行中',
      toStatus: '完了',
      record,
      transitions: transitionsAllowing('進行中', '完了', '修正しない'),
    });

    expect(result).toEqual({ type: 'error', error: apiError });
  });
});
