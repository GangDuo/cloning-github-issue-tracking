import { useEffect, useMemo, useState } from 'react';
import { PRIORITY_VALUES, STATUS_VALUES } from '../../../shared/fields';
import { fetchStatusTransitions, type StatusTransitionMap } from '../../../shared/process-management';
import { Card } from './components/card';
import { ColumnReorderContainer } from './components/column-reorder-container';
import { FilterBar } from './components/filter-bar';
import { KanbanBoard, KanbanHeader, KanbanProvider } from './components/kanban';
import { TaskCardContent } from './components/task-card';
import { VirtualizedCardList } from './components/virtualized-card-list';
import { useDragToChangeStatus } from './hooks/use-drag-to-change-status';
import { useKanbanRecords } from './hooks/use-kanban-records';
import { applyFilters, EMPTY_FILTERS, type KanbanFilters } from './lib/apply-filters';
import type { KanbanTask } from './lib/kanban-data-mapper';
import { comparePriority } from './lib/priority-sort';

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
  const [filters, setFilters] = useState<KanbanFilters>(EMPTY_FILTERS);
  const [transitions, setTransitions] = useState<StatusTransitionMap | null>(null);
  const [reorderTarget, setReorderTarget] = useState<ReorderTarget | null>(null);

  // ステータス変更APIの応答待ちであることを表す実際の非同期処理の進行
  // 状態。並べ替えオーバーレイの表示中(reorderTarget !== null)と合わせて
  // 「ポーリングを止めるべき理由があるか」を論理式で導出する。
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const { tasks, error, refetch } = useKanbanRecords(app, {
    paused: reorderTarget !== null || isChangingStatus,
  });

  useEffect(() => {
    void fetchStatusTransitions(app).then(setTransitions);
  }, [app]);

  const filteredTasks = useMemo(() => applyFilters(tasks, filters), [tasks, filters]);

  const { displayTasks, dragMessage, handleDragOver, handleDragEnd } = useDragToChangeStatus({
    app,
    tasks,
    filteredTasks,
    transitions,
    columns: COLUMNS,
    refetch,
    onChangingStatusChange: setIsChangingStatus,
  });

  const sortedByColumn = useMemo(
    () =>
      new Map<string, KanbanTask[]>(
        COLUMNS.map((column) => [
          column.id,
          displayTasks.filter((task) => task.column === column.id).sort(comparePriority),
        ]),
      ),
    [displayTasks],
  );

  const kanbanData = useMemo(
    () => COLUMNS.flatMap((column) => sortedByColumn.get(column.id) ?? []),
    [sortedByColumn],
  );

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

      <KanbanProvider<KanbanTask>
        columns={COLUMNS}
        data={kanbanData}
        onDragOver={handleDragOver}
        onDragEnd={(event) => void handleDragEnd(event)}
        renderOverlayCard={(item) => <TaskCardContent task={item} />}
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
            <VirtualizedCardList<KanbanTask> columnId={column.id}>
              {(item) => (
                <Card>
                  <TaskCardContent task={item} />
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
