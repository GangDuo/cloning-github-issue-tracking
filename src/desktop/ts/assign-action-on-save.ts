import { ASSIGN_ACTION_NAME, FIELD_CODES } from '../../shared/fields';
import { isAssigneeEmpty, isStatusNotStarted } from '../../shared/record-helpers';
import type { RecordSubmitSuccessEvent, SavedSavedFields } from '../../shared/kintone-events';

const isUnassignedWithAssignee = (record: SavedSavedFields): boolean =>
  isStatusNotStarted(record) && !isAssigneeEmpty(record);

const executeAssignAction = (recordId: number, assignee: string, revision: string | undefined) =>
  kintone.api(kintone.api.url('/k/v1/record/status', true), 'PUT', {
    app: kintone.app.getId(),
    id: recordId,
    action: ASSIGN_ACTION_NAME,
    assignee,
    revision,
  });

export function advanceStatusIfAssignable(
  event: RecordSubmitSuccessEvent,
): RecordSubmitSuccessEvent {
  const { record, recordId } = event;

  if (isUnassignedWithAssignee(record)) {
    // isUnassignedWithAssignee内のisAssigneeEmptyチェックにより、
    // ここでは対応者が最低1件存在することが保証されている。
    const assignee = record[FIELD_CODES.ASSIGNEE]!.value[0]!.code;

    executeAssignAction(recordId, assignee, record.$revision?.value).catch((error: unknown) => {
      console.error(`アクション「${ASSIGN_ACTION_NAME}」の自動実行に失敗しました`, error);
    });
  }

  return event;
}

kintone.events.on(
  [
    'app.record.create.submit.success',
    'app.record.edit.submit.success',
    'app.record.index.edit.submit.success',
  ],
  advanceStatusIfAssignable,
);
