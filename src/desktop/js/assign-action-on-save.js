(function () {
  'use strict';

  const CONFIG = {
    STATUS_FIELD: 'ステータス',
    ASSIGNEE_FIELD: '対応者',
    STATUS_NOT_STARTED: '未処理',
    ASSIGN_ACTION: '割り当てる'
  };

  const isUnassignedWithAssignee = (record) =>
    record[CONFIG.STATUS_FIELD]?.value === CONFIG.STATUS_NOT_STARTED &&
    (record[CONFIG.ASSIGNEE_FIELD]?.value?.length ?? 0) > 0;

  const executeAssignAction = (recordId, assignee, revision) =>
    kintone.api(kintone.api.url('/k/v1/record/status', true), 'PUT', {
      app: kintone.app.getId(),
      id: recordId,
      action: CONFIG.ASSIGN_ACTION,
      assignee,
      revision
    });

  function advanceStatusIfAssignable(event) {
    const { record, recordId } = event;

    if (isUnassignedWithAssignee(record)) {
      const assignee = record[CONFIG.ASSIGNEE_FIELD].value[0].code;

      executeAssignAction(recordId, assignee, record.$revision?.value).catch((error) => {
        console.error(`アクション「${CONFIG.ASSIGN_ACTION}」の自動実行に失敗しました`, error);
      });
    }

    return event;
  }

  kintone.events.on(
    [
      'app.record.create.submit.success',
      'app.record.edit.submit.success',
      'app.record.index.edit.submit.success'
    ],
    advanceStatusIfAssignable
  );
})();
