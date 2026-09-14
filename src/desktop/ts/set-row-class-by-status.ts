import { FIELD_CODES, PRIVATE_VALUE, STATUS_VALUES } from '../../shared/fields';
import type { RecordIndexShowEvent } from '../../shared/kintone-events';

function isMobile(): boolean {
  return !!kintone.mobile.app.getId();
}

export function setRowClassesByStatus(event: RecordIndexShowEvent): RecordIndexShowEvent {
  const { records } = event;

  // カレンダー表示のときrecordsは配列でなくオブジェクトになり、本関数の
  // index対応ロジックが成立しない。カレンダー表示は非対応として早期returnする。
  if (!Array.isArray(records)) {
    return event;
  }

  const app = isMobile() ? kintone.mobile.app : kintone.app;
  const rowSelector = isMobile()
    ? '.gaia-mobile-v2-app-index-recordlist-table-bodyrow'
    : '.recordlist-row-gaia';

  records.forEach((record, index) => {
    const spaceElement = app.getFieldElements(FIELD_CODES.TICKET_NO)?.[index];
    if (!spaceElement) return;

    const rowElement = spaceElement.closest(rowSelector);
    if (!rowElement) {
      return;
    }

    rowElement.classList.remove(
      'status-not-started',
      'status-in-progress',
      'status-provided',
      'status-canceled',
    );

    if (record[FIELD_CODES.PRIVATE]?.value?.includes(PRIVATE_VALUE)) {
      rowElement.classList.add('status-canceled');
    } else {
      (
        [
          [STATUS_VALUES.NOT_STARTED, 'status-not-started'],
          [STATUS_VALUES.IN_PROGRESS, 'status-in-progress'],
          [STATUS_VALUES.COMPLETED, 'status-provided'],
        ] as const
      ).forEach(([state, className]) => {
        // 既知のバグ(#10): 本来はFIELD_CODES.STATUSを参照すべきだが、現状は
        // FIELD_CODES.CATEGORY('カテゴリー')を参照している(既存挙動を維持。修正は別PRで対応)。
        if (record[FIELD_CODES.CATEGORY]?.value?.includes(state)) {
          rowElement.classList.add(className);
        }
      });
    }
  });

  return event;
}

kintone.events.on(['app.record.index.show', 'mobile.app.record.index.show'], setRowClassesByStatus);
