import { useCallback, useEffect, useState } from 'react';
import { FIELD_CODES } from '../../../../shared/fields';
import { fetchAllRecords } from '../../../../shared/fetch-all-records';
import { isPrivate } from '../../../../shared/record-helpers';
import { mapRecordsToKanbanTasks, type KanbanTask } from '../lib/kanban-data-mapper';
import { selectLeafTasks } from '../lib/leaf-task-selector';

const POLLING_INTERVAL_MS = 15000;

const REQUIRED_FIELDS = [
  FIELD_CODES.TICKET_NO,
  FIELD_CODES.TITLE,
  FIELD_CODES.STATUS,
  FIELD_CODES.ASSIGNEE,
  FIELD_CODES.APPROVER,
  FIELD_CODES.DESCRIPTION,
  FIELD_CODES.PRIORITY,
  FIELD_CODES.DISPLAY_ORDER,
  FIELD_CODES.TYPE,
  FIELD_CODES.CATEGORY,
  FIELD_CODES.MILESTONE_ID,
  FIELD_CODES.PARENT,
  FIELD_CODES.PRIVATE,
];

export interface UseKanbanRecordsOptions {
  // 列内並べ替えオーバーレイの表示中や、ステータス変更APIの応答待ち中に
  // ポーリングでボードがすり替わらないようにするための一時停止。呼び出し
  // 側が「今止めるべき理由があるか」を論理式で導出して渡す(このhook自身は
  // 命令的なpause/resume操作を持たない)。
  paused: boolean;
}

export interface UseKanbanRecordsResult {
  tasks: KanbanTask[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useKanbanRecords(
  app: number,
  { paused }: UseKanbanRecordsOptions,
): UseKanbanRecordsResult {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    try {
      const allRecords = await fetchAllRecords({ app, fields: REQUIRED_FIELDS });
      const visibleRecords = allRecords.filter((record) => !isPrivate(record));
      const leafTasks = selectLeafTasks(visibleRecords);
      setTasks(mapRecordsToKanbanTasks(leafTasks, visibleRecords));
      setError(null);
    } catch (caughtError) {
      setError(caughtError);
    } finally {
      setIsLoading(false);
    }
  }, [app]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (paused) return;

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      void load();
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [load, paused]);

  return { tasks, isLoading, error, refetch: load };
}
