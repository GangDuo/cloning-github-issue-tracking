import { useMemo } from 'react';
import type { KanbanTask } from '../lib/kanban-data-mapper';
import { comparePriority } from '../lib/priority-sort';

export interface ReorderTarget {
  columnId: string;
  priority: string;
}

export interface UseKanbanBoardViewParams {
  displayTasks: KanbanTask[];
  columns: Array<{ id: string; name: string }>;
  reorderTarget: ReorderTarget | null;
}

export interface UseKanbanBoardViewResult {
  sortedByColumn: Map<string, KanbanTask[]>;
  kanbanData: KanbanTask[];
  reorderColumnName: string;
  reorderItems: KanbanTask[];
}

// 列ごとの優先度ソート・カンバン全体データへの平坦化・並べ替えオーバーレイ
// 用の抽出という表示のための派生データ計算を、KanbanBoardAppから分離する。
export function useKanbanBoardView({
  displayTasks,
  columns,
  reorderTarget,
}: UseKanbanBoardViewParams): UseKanbanBoardViewResult {
  const sortedByColumn = useMemo(
    () =>
      new Map<string, KanbanTask[]>(
        columns.map((column) => [
          column.id,
          displayTasks.filter((task) => task.column === column.id).sort(comparePriority),
        ]),
      ),
    [displayTasks, columns],
  );

  const kanbanData = useMemo(
    () => columns.flatMap((column) => sortedByColumn.get(column.id) ?? []),
    [columns, sortedByColumn],
  );

  const reorderColumnName = reorderTarget
    ? (columns.find((column) => column.id === reorderTarget.columnId)?.name ?? reorderTarget.columnId)
    : '';
  const reorderItems = reorderTarget
    ? (sortedByColumn.get(reorderTarget.columnId) ?? []).filter(
        (task) => task.priority === reorderTarget.priority,
      )
    : [];

  return { sortedByColumn, kanbanData, reorderColumnName, reorderItems };
}
