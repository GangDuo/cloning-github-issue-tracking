import { useCallback, useEffect, useRef, useState } from 'react';
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

export interface UseKanbanRecordsResult {
  tasks: KanbanTask[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
  // 列内並べ替えオーバーレイの表示中や、ステータス変更APIの応答待ち中に
  // ポーリングでボードがすり替わらないようにするための一時停止操作。
  // ネストして呼ばれる可能性があるためカウンタで管理する。
  pausePolling: () => void;
  resumePolling: () => void;
}

export function useKanbanRecords(app: number): UseKanbanRecordsResult {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const pauseCountRef = useRef(0);

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

  const pausePolling = useCallback(() => {
    pauseCountRef.current += 1;
  }, []);

  const resumePolling = useCallback(() => {
    pauseCountRef.current = Math.max(0, pauseCountRef.current - 1);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (pauseCountRef.current > 0) return;
      if (document.visibilityState === 'hidden') return;
      void load();
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [load]);

  return { tasks, isLoading, error, refetch: load, pausePolling, resumePolling };
}
