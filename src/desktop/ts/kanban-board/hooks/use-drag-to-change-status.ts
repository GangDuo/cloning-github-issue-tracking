import { useMemo, useState } from 'react';
import type { StatusTransitionMap } from '../../../../shared/process-management';
import type { DragEndEvent, DragOverEvent } from '../components/kanban';
import type { KanbanTask } from '../lib/kanban-data-mapper';
import { resolveDragMessage } from '../lib/resolve-drag-message';
import { changeCardStatus } from './use-status-transition';

export interface UseDragToChangeStatusParams {
  app: number;
  // サーバー由来の生データ。ドラッグ確定時にkintoneへ送るfromStatusは、
  // 下記displayTasks(表示用に列を上書き済み)ではなくこちらから引く。
  tasks: KanbanTask[];
  // フィルタ適用後の表示対象。displayTasksはこれにドラッグ中の列上書きを
  // 重ねたものを返す。
  filteredTasks: KanbanTask[];
  transitions: StatusTransitionMap | null;
  columns: Array<{ id: string }>;
  refetch: () => Promise<void>;
  // ステータス変更APIの応答待ちであることを呼び出し側(ポーリング一時
  // 停止の判定に使うuseKanbanRecords)へ伝える。値そのものをこのフックが
  // 返す設計にすると、useKanbanRecordsの呼び出しとの間で循環依存になる
  // ため、setStateを直接渡してもらう。
  onChangingStatusChange: (isChanging: boolean) => void;
}

export interface UseDragToChangeStatusResult {
  displayTasks: KanbanTask[];
  dragMessage: string | undefined;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
}

// 列間ドラッグ(ステータス変更)に伴う状態管理をKanbanBoardAppから分離する。
// 「ドラッグ中の見た目上の列上書き」「確定時のkintone更新」「結果メッセージ」
// という一連の責務をひとまとめにし、KanbanBoardApp側はこのフックの結果を
// JSXに反映するだけにする。
export function useDragToChangeStatus({
  app,
  tasks,
  filteredTasks,
  transitions,
  columns,
  refetch,
  onChangingStatusChange,
}: UseDragToChangeStatusParams): UseDragToChangeStatusResult {
  const [dragMessage, setDragMessage] = useState<string | undefined>(undefined);
  // ドラッグ中に列を跨いだ瞬間、確定(kintone更新+再取得)を待たずに
  // カードを見た目上ドロップ先の列へ移す一時的な上書き。確定・キャンセル
  // いずれの場合も空にリセットし、以降はtasks(サーバー由来)の値に従う。
  const [pendingColumnOverrides, setPendingColumnOverrides] = useState<Map<string, string>>(new Map());

  const displayTasks = useMemo(
    () =>
      filteredTasks.map((task) =>
        pendingColumnOverrides.has(task.id)
          ? { ...task, column: pendingColumnOverrides.get(task.id)! }
          : task,
      ),
    [filteredTasks, pendingColumnOverrides],
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const toColumnId = columns.find((column) => column.id === over.id)?.id;
    if (!toColumnId) return;

    setPendingColumnOverrides((prev) => new Map(prev).set(active.id as string, toColumnId));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setPendingColumnOverrides(new Map());
    if (!over || !transitions) return;

    const toStatus = columns.find((column) => column.id === over.id)?.id;
    const originalTask = tasks.find((task) => task.id === active.id);
    if (!originalTask || !toStatus || originalTask.column === toStatus) return;

    onChangingStatusChange(true);
    const result = await changeCardStatus({
      app,
      recordId: Number(originalTask.record.$id.value),
      revision: originalTask.record.$revision.value,
      fromStatus: originalTask.column,
      toStatus,
      record: originalTask.record,
      transitions,
    });
    onChangingStatusChange(false);

    setDragMessage(resolveDragMessage(result));
    await refetch();
  };

  return { displayTasks, dragMessage, handleDragOver, handleDragEnd };
}
