import { isAssigneeEmpty, isStatusNotStarted } from '../../shared/record-helpers';
import type { RecordShowEvent, SavedSavedFields } from '../../shared/kintone-events';

const NOTICE_ELEMENT_ID = 'notify-assignee-required-when-not-started';
const MESSAGE = '対応者を設定してください。';

const shouldShowNotice = (record: SavedSavedFields): boolean =>
  isStatusNotStarted(record) && isAssigneeEmpty(record);

function getOrCreateNoticeElement(spaceElement: HTMLElement): HTMLElement {
  return (
    spaceElement.querySelector<HTMLElement>(`#${NOTICE_ELEMENT_ID}`) ??
    spaceElement.appendChild(
      Object.assign(document.createElement('div'), { id: NOTICE_ELEMENT_ID }),
    )
  );
}

function renderNotice(noticeElement: HTMLElement, visible: boolean): void {
  noticeElement.textContent = visible ? MESSAGE : '';
  noticeElement.classList.toggle('assignee-required-notice', visible);
}

export function updateAssigneeRequiredNotice(event: RecordShowEvent): RecordShowEvent {
  const spaceElement = kintone.app.record.getHeaderMenuSpaceElement();
  if (!spaceElement) return event;

  renderNotice(getOrCreateNoticeElement(spaceElement), shouldShowNotice(event.record));

  return event;
}

kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], updateAssigneeRequiredNotice);
