import { FIELD_CODES, STATUS_VALUES } from './fields';
import type { SavedFields } from './kintone-events';

export const isAssigneeEmpty = (record: SavedFields): boolean =>
  (record[FIELD_CODES.ASSIGNEE]?.value?.length ?? 0) === 0;

export const isStatusNotStarted = (record: SavedFields): boolean =>
  record[FIELD_CODES.STATUS]?.value === STATUS_VALUES.NOT_STARTED;

export const isAssigneeRequiredStatus = (record: SavedFields): boolean =>
  (
    [
      STATUS_VALUES.IN_PROGRESS,
      STATUS_VALUES.ACCEPTANCE_TESTING,
      STATUS_VALUES.COMPLETED,
    ] as string[]
  ).includes(record[FIELD_CODES.STATUS]?.value ?? '');
