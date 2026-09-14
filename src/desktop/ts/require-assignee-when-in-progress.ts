import { FIELD_CODES } from '../../shared/fields';
import { isAssigneeEmpty, isAssigneeRequiredStatus } from '../../shared/record-helpers';
import type { RecordSubmitEvent } from '../../shared/kintone-events';

export function validateAssigneeRequired(event: RecordSubmitEvent): RecordSubmitEvent {
  const { record } = event;

  if (isAssigneeRequiredStatus(record) && isAssigneeEmpty(record)) {
    record[FIELD_CODES.ASSIGNEE].error = 'ステータスが進行中以降の場合、対応者を設定してください。';
  }

  return event;
}

kintone.events.on(
  ['app.record.create.submit', 'app.record.edit.submit', 'app.record.index.edit.submit'],
  validateAssigneeRequired,
);
