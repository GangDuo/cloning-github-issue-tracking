(function () {
  'use strict';

  const CONFIG = {
    STATUS_FIELD: 'ステータス',
    ASSIGNEE_FIELD: '対応者',
    STATUS_NOT_STARTED: '未処理',
    NOTICE_ELEMENT_ID: 'notify-assignee-required-when-not-started',
    MESSAGE: '対応者を設定してください。'
  };

  const isStatusNotStarted = (record) =>
    record[CONFIG.STATUS_FIELD]?.value === CONFIG.STATUS_NOT_STARTED;

  const isAssigneeEmpty = (record) => (record[CONFIG.ASSIGNEE_FIELD]?.value?.length ?? 0) === 0;

  const shouldShowNotice = (record) => isStatusNotStarted(record) && isAssigneeEmpty(record);

  function getOrCreateNoticeElement(spaceElement) {
    return (
      spaceElement.querySelector(`#${CONFIG.NOTICE_ELEMENT_ID}`) ??
      spaceElement.appendChild(Object.assign(document.createElement('div'), { id: CONFIG.NOTICE_ELEMENT_ID }))
    );
  }

  function renderNotice(noticeElement, visible) {
    noticeElement.textContent = visible ? CONFIG.MESSAGE : '';
    noticeElement.classList.toggle('assignee-required-notice', visible);
  }

  function updateAssigneeRequiredNotice(event) {
    const spaceElement = kintone.app.record.getHeaderMenuSpaceElement();
    if (!spaceElement) return event;

    renderNotice(getOrCreateNoticeElement(spaceElement), shouldShowNotice(event.record));

    return event;
  }

  kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], updateAssigneeRequiredNotice);
})();
