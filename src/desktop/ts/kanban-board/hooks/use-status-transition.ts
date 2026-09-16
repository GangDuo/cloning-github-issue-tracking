import { FIELD_CODES, STATUS_VALUES } from '../../../../shared/fields';
import type { SavedSavedFields } from '../../../../shared/kintone-events';
import { isApproverEmpty, isAssigneeEmpty } from '../../../../shared/record-helpers';
import type { StatusTransitionMap } from '../../../../shared/process-management';
import { executeStatusAction, isRevisionConflictError } from '../../../../shared/status-action';

// プロセス管理の「進行中」「受入テスト中」は作業者選択方式が「対応者/
// 承認者フィールドの値から1人選ぶ」設定になっているため、PUT /k/v1/
// record/statusのassigneeに次の作業者を明示する必要がある(未指定だと
// 候補が複数(または1人でも)存在する場合にAPIがエラーになる)。
function resolveNextAssignee(toStatus: string, record: SavedSavedFields): string | undefined {
  if (toStatus === STATUS_VALUES.IN_PROGRESS) {
    return record[FIELD_CODES.ASSIGNEE]?.value[0]?.code;
  }
  if (toStatus === STATUS_VALUES.ACCEPTANCE_TESTING) {
    return record[FIELD_CODES.APPROVER]?.value[0]?.code;
  }
  return undefined;
}

export interface ChangeCardStatusParams {
  app: number;
  recordId: number;
  revision: string | undefined;
  fromStatus: string;
  toStatus: string;
  record: SavedSavedFields;
  transitions: StatusTransitionMap;
}

export type ChangeCardStatusResult =
  | { type: 'noop' }
  | { type: 'rejected'; reason: string }
  | { type: 'success' }
  | { type: 'conflict' }
  | { type: 'error'; error: unknown };

// @dnd-kitのイベント型に依存しない純粋関数として業務ロジックを分離する。
// jsdomでの実ドラッグシミュレーションは信頼性が低いため、この関数単体を
// テスト対象にすることでカバレッジを確保する。
export async function changeCardStatus(params: ChangeCardStatusParams): Promise<ChangeCardStatusResult> {
  const { app, recordId, revision, fromStatus, toStatus, record, transitions } = params;

  if (fromStatus === toStatus) {
    return { type: 'noop' };
  }

  const action = transitions.resolveAction(fromStatus, toStatus);
  if (!action) {
    return { type: 'rejected', reason: 'この状態への変更はプロセス管理で許可されていません' };
  }

  if (toStatus === STATUS_VALUES.IN_PROGRESS && isAssigneeEmpty(record)) {
    return { type: 'rejected', reason: '対応者が未設定のため、進行中に変更できません' };
  }
  if (toStatus === STATUS_VALUES.ACCEPTANCE_TESTING && isApproverEmpty(record)) {
    return { type: 'rejected', reason: '承認者が未設定のため、受入テスト中に変更できません' };
  }

  try {
    await executeStatusAction({
      app,
      id: recordId,
      action,
      assignee: resolveNextAssignee(toStatus, record),
      revision,
    });
    return { type: 'success' };
  } catch (error) {
    if (isRevisionConflictError(error)) {
      return { type: 'conflict' };
    }
    return { type: 'error', error };
  }
}
