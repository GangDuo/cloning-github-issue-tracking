import { describe, expect, it } from 'vitest';
import { resolveDragMessage } from './resolve-drag-message';

describe('resolveDragMessage', () => {
  it('rejectedの場合はreasonをそのまま返す', () => {
    expect(resolveDragMessage({ type: 'rejected', reason: '対応者が未設定です' })).toBe(
      '対応者が未設定です',
    );
  });

  it('conflictの場合は競合メッセージを返す', () => {
    expect(resolveDragMessage({ type: 'conflict' })).toBe(
      '他のユーザーによって更新されたため、最新の状態を再取得しました',
    );
  });

  it('errorの場合は汎用エラーメッセージを返す', () => {
    expect(resolveDragMessage({ type: 'error', error: new Error('network error') })).toBe(
      '更新に失敗しました',
    );
  });

  it('successの場合はundefinedを返す', () => {
    expect(resolveDragMessage({ type: 'success' })).toBeUndefined();
  });

  it('noopの場合はundefinedを返す', () => {
    expect(resolveDragMessage({ type: 'noop' })).toBeUndefined();
  });
});
