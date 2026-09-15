import { useEffect, useMemo, useState } from 'react';
import { PRIORITY_VALUES, STATUS_VALUES } from '../../../shared/fields';
import { fetchStatusTransitions, type StatusTransitionMap } from '../../../shared/process-management';
import { Card } from './components/card';
import { ColumnReorderContainer } from './components/column-reorder-container';
import { FilterBar } from './components/filter-bar';
import { KanbanBoard, KanbanHeader, KanbanProvider, type DragOverEvent, type DragEndEvent } from './components/kanban';
import { TaskCardContent } from './components/task-card';
import { VirtualizedCardList } from './components/virtualized-card-list';
import { applyFilters, EMPTY_FILTERS, type KanbanFilters } from './lib/apply-filters';
import type { KanbanTask } from './lib/kanban-data-mapper';
import { comparePriority } from './lib/priority-sort';
import { useKanbanRecords } from './hooks/use-kanban-records';
import { changeCardStatus } from './hooks/use-status-transition';

const COLUMNS = [
  { id: STATUS_VALUES.NOT_STARTED, name: STATUS_VALUES.NOT_STARTED },
  { id: STATUS_VALUES.IN_PROGRESS, name: STATUS_VALUES.IN_PROGRESS },
  { id: STATUS_VALUES.ACCEPTANCE_TESTING, name: STATUS_VALUES.ACCEPTANCE_TESTING },
  { id: STATUS_VALUES.COMPLETED, name: STATUS_VALUES.COMPLETED },
];

interface ReorderTarget {
  columnId: string;
  priority: string;
}

export const KanbanBoardApp = () => {
  const app = kintone.app.getId()!;
  const { tasks, error, refetch, pausePolling, resumePolling } = useKanbanRecords(app);
  const [filters, setFilters] = useState<KanbanFilters>(EMPTY_FILTERS);
  const [transitions, setTransitions] = useState<StatusTransitionMap | null>(null);
  const [reorderTarget, setReorderTarget] = useState<ReorderTarget | null>(null);
  const [dragMessage, setDragMessage] = useState<string | undefined>(undefined);
  // ドラッグ中に列を跨いだ瞬間、確定(kintone更新+再取得)を待たずに
  // カードを見た目上ドロップ先の列へ移す一時的な上書き。確定・キャンセル
  // いずれの場合も空にリセットし、以降はtasks(サーバー由来)の値に従う。
  const [pendingColumnOverrides, setPendingColumnOverrides] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    void fetchStatusTransitions(app).then(setTransitions);
  }, [app]);

  // 並べ替えオーバーレイの表示中にポーリングでボードが再取得されると、
  // オーバーレイが参照している一覧の裏でメインボードのデータがすり替わり
  // 保存内容と齟齬が生じるため、表示中は一時停止する。
  useEffect(() => {
    if (!reorderTarget) return;
    pausePolling();
    return () => resumePolling();
  }, [reorderTarget, pausePolling, resumePolling]);

  const filteredTasks = useMemo(() => applyFilters(tasks, filters), [tasks, filters]);

  const displayTasks = useMemo(
    () =>
      filteredTasks.map((task) =>
        pendingColumnOverrides.has(task.id)
          ? { ...task, column: pendingColumnOverrides.get(task.id)! }
          : task,
      ),
    [filteredTasks, pendingColumnOverrides],
  );

  const sortedByColumn = useMemo(() => {
    const map = new Map<string, KanbanTask[]>();
    for (const column of COLUMNS) {
      map.set(
        column.id,
        displayTasks.filter((task) => task.column === column.id).sort(comparePriority),
      );
    }
    return map;
  }, [displayTasks]);

  const kanbanData = useMemo(
    () => COLUMNS.flatMap((column) => sortedByColumn.get(column.id) ?? []),
    [sortedByColumn],
  );

  const taskById = useMemo(() => new Map(displayTasks.map((task) => [task.id, task])), [displayTasks]);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const toColumnId = COLUMNS.find((column) => column.id === over.id)?.id;
    if (!toColumnId) return;

    setPendingColumnOverrides((prev) => {
      const next = new Map(prev);
      next.set(active.id as string, toColumnId);
      return next;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setPendingColumnOverrides(new Map());
    if (!over || !transitions) return;

    const task = taskById.get(active.id as string);
    const toStatus = COLUMNS.find((column) => column.id === over.id)?.id;
    if (!task || !toStatus) return;

    // taskById(displayTasks)はpendingColumnOverrides適用後の値のため、
    // 実際にkintoneへ送るfromStatusは元のtasksから引き直す。
    const originalTask = tasks.find((t) => t.id === task.id);
    if (!originalTask || originalTask.column === toStatus) return;

    pausePolling();
    const result = await changeCardStatus({
      app,
      recordId: Number(originalTask.record.$id.value),
      revision: originalTask.record.$revision.value,
      fromStatus: originalTask.column,
      toStatus,
      record: originalTask.record,
      transitions,
    });
    resumePolling();

    if (result.type === 'rejected') {
      setDragMessage(result.reason);
    } else if (result.type === 'conflict') {
      setDragMessage('他のユーザーによって更新されたため、最新の状態を再取得しました');
    } else if (result.type === 'error') {
      setDragMessage('更新に失敗しました');
    }
    await refetch();
  };

  const reorderColumnName = reorderTarget
    ? (COLUMNS.find((column) => column.id === reorderTarget.columnId)?.name ?? reorderTarget.columnId)
    : '';
  const reorderItems = reorderTarget
    ? (sortedByColumn.get(reorderTarget.columnId) ?? []).filter(
        (task) => task.priority === reorderTarget.priority,
      )
    : [];

  return (
    <div className="tw:kanban-board-root">
      {error !== null && (
        <p className="tw:text-red-600 tw:text-sm">課題の取得に失敗しました。時間をおいて再度お試しください</p>
      )}
      {dragMessage && (
        <p className="tw:text-red-600 tw:text-sm" role="alert">
          {dragMessage}
        </p>
      )}

      <FilterBar tasks={tasks} filters={filters} onFiltersChange={setFilters} />

      <KanbanProvider
        columns={COLUMNS}
        data={kanbanData}
        onDragOver={handleDragOver}
        onDragEnd={(event) => void handleDragEnd(event)}
        renderOverlayCard={(item) => <TaskCardContent task={item as KanbanTask} />}
      >
        {(column) => (
          <KanbanBoard key={column.id} id={column.id}>
            <KanbanHeader>
              <span>
                {column.name} ({sortedByColumn.get(column.id)?.length ?? 0})
              </span>
              <div className="tw:flex tw:gap-2">
                {Object.values(PRIORITY_VALUES).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    title={`優先度「${priority}」のカードを並べ替える`}
                    className="tw:text-xs tw:underline"
                    onClick={() => setReorderTarget({ columnId: column.id, priority })}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </KanbanHeader>
            <VirtualizedCardList columnId={column.id}>
              {(item) => (
                <Card>
                  <TaskCardContent task={item as KanbanTask} />
                </Card>
              )}
            </VirtualizedCardList>
          </KanbanBoard>
        )}
      </KanbanProvider>

      {reorderTarget && (
        <ColumnReorderContainer
          key={`${reorderTarget.columnId}-${reorderTarget.priority}`}
          app={app}
          columnName={reorderColumnName}
          priority={reorderTarget.priority}
          initialItems={reorderItems}
          onClose={() => setReorderTarget(null)}
          onCommitted={() => {
            setReorderTarget(null);
            void refetch();
          }}
        />
      )}
    </div>
  );
};
