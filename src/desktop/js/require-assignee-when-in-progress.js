(function () {
  'use strict';

  const CONFIG = {
    STATUS_FIELD: 'ステータス',
    ASSIGNEE_FIELD: '対応者',
    STATUSES_REQUIRING_ASSIGNEE: ['進行中', '受入テスト中', '完了']
  };

  const isAssigneeRequired = (record) =>
    CONFIG.STATUSES_REQUIRING_ASSIGNEE.includes(record[CONFIG.STATUS_FIELD]?.value);

  const isAssigneeEmpty = (record) => (record[CONFIG.ASSIGNEE_FIELD]?.value?.length ?? 0) === 0;

  function validateAssigneeRequired(event) {
    const { record } = event;

    if (isAssigneeRequired(record) && isAssigneeEmpty(record)) {
      record[CONFIG.ASSIGNEE_FIELD].error = 'ステータスが進行中以降の場合、対応者を設定してください。';
    }

    return event;
  }

  kintone.events.on(
    ['app.record.create.submit', 'app.record.edit.submit', 'app.record.index.edit.submit'],
    validateAssigneeRequired
  );
})();
