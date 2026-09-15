import { FIELD_CODES, PRIVATE_VALUE, STATUS_VALUES } from './fields';
import type { SavedFields } from './kintone-events';

export const isAssigneeEmpty = (record: SavedFields): boolean =>
  (record[FIELD_CODES.ASSIGNEE]?.value?.length ?? 0) === 0;

export const isApproverEmpty = (record: SavedFields): boolean =>
  (record[FIELD_CODES.APPROVER]?.value?.length ?? 0) === 0;

export const isPrivate = (record: SavedFields): boolean =>
  !!record[FIELD_CODES.PRIVATE]?.value?.includes(PRIVATE_VALUE);

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
