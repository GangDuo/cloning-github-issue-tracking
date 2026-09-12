(function () {
  'use strict';

  const CONFIG = {
    FAR_LEFT_FIELD: 'チケットNo',
    STATUS_FIELD: 'カテゴリー',
    PRIVATE_FIELD: '非公開',
    STATUS_NOT_STARTED: '未処理',
    STATUS_IN_PROGRESS: '進行中',
    STATUS_PROVIDED: '完了',
    PRIVATE_VALUE: '非公開'
  };

  function isMobile() {
    return !!kintone.mobile.app.getId();
  }

  function setRowClassesByStatus(event) {
    const records = event.records;
    const app = isMobile() ? kintone.mobile.app : kintone.app;
    const rowSelector = isMobile() ? '.gaia-mobile-v2-app-index-recordlist-table-bodyrow' : '.recordlist-row-gaia';

    records.forEach((record, index) => {
      const spaceElement = app.getFieldElements(CONFIG.FAR_LEFT_FIELD)[index];
      if (!spaceElement) return;

      const rowElement = spaceElement.closest(rowSelector);
      if (!rowElement) {
        return;
      }

      // Remove existing status classes to avoid conflicts
      rowElement.classList.remove('status-not-started', 'status-in-progress', 'status-provided', 'status-canceled');

      // Add a new class based on the record's status
      if (record[CONFIG.PRIVATE_FIELD]?.value?.includes(CONFIG.PRIVATE_VALUE)) {
        rowElement.classList.add('status-canceled');
      } else {
        [
          [CONFIG.STATUS_NOT_STARTED, 'status-not-started'],
          [CONFIG.STATUS_IN_PROGRESS, 'status-in-progress'],
          [CONFIG.STATUS_PROVIDED, 'status-provided']
        ].forEach(([state, className]) => {
          if (record[CONFIG.STATUS_FIELD]?.value?.includes(state)) {
            rowElement.classList.add(className);
          }
        });
      }
    });
  }

  kintone.events.on(['app.record.index.show', 'mobile.app.record.index.show'], setRowClassesByStatus);

})();
