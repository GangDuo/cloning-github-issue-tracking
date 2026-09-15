import type { ChangeCardStatusResult } from '../hooks/use-status-transition';

const DRAG_RESULT_MESSAGES: Partial<Record<ChangeCardStatusResult['type'], string>> = {
  conflict: '他のユーザーによって更新されたため、最新の状態を再取得しました',
  error: '更新に失敗しました',
};

// 'rejected'のみ理由がAPI呼び出し前に確定するため個別に扱い、
// それ以外(success/conflict/error/noop)はテーブルから引く。
export function resolveDragMessage(result: ChangeCardStatusResult): string | undefined {
  return result.type === 'rejected' ? result.reason : DRAG_RESULT_MESSAGES[result.type];
}
