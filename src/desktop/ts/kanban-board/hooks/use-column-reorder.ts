import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import { FIELD_CODES } from '../../../../shared/fields';
import { executeBulkRecordUpdate } from '../../../../shared/bulk-record-update';
import { isRevisionConflictError } from '../../../../shared/status-action';
import type { KanbanTask } from '../lib/kanban-data-mapper';
import { reassignDisplayOrder } from '../lib/reassign-display-order';

export type CommitColumnReorderResult =
  | { type: 'success' }
  | { type: 'conflict' }
  | { type: 'error'; error: unknown };

// ドラッグ中はローカルstateのみで確定しない(オーバーレイを閉じる=確定
// するタイミングで初めて`表示順`をまとめて保存する)。これにより、
// ドラッグの都度APIを呼ぶ必要がなく、fractional indexingのような
// 中間値計算の弱点も避けられる。
export function useColumnReorder(app: number, initialItems: KanbanTask[]) {
  const [items, setItems] = useState(initialItems);

  const reorder = (activeId: string, overId: string) => {
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === activeId);
      const newIndex = prev.findIndex((item) => item.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const commit = async (): Promise<CommitColumnReorderResult> => {
    const assignments = reassignDisplayOrder(items);
    const itemById = new Map(items.map((item) => [item.id, item]));

    try {
      await executeBulkRecordUpdate(
        app,
        assignments.map(({ id, displayOrder }) => {
          const item = itemById.get(id)!;
          return {
            id: Number(item.record.$id.value),
            revision: item.record.$revision.value,
            record: { [FIELD_CODES.DISPLAY_ORDER]: { value: displayOrder } },
          };
        }),
      );
      return { type: 'success' };
    } catch (error) {
      if (isRevisionConflictError(error)) {
        return { type: 'conflict' };
      }
      return { type: 'error', error };
    }
  };

  return { items, reorder, commit };
}
