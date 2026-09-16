import { PRIORITY_VALUES } from '../../../../shared/fields';
import type { KanbanTask } from './kanban-data-mapper';

const PRIORITY_ORDER: Record<string, number> = {
  [PRIORITY_VALUES.HIGH]: 0,
  [PRIORITY_VALUES.MEDIUM]: 1,
  [PRIORITY_VALUES.LOW]: 2,
};
const UNKNOWN_PRIORITY_ORDER = PRIORITY_ORDER[PRIORITY_VALUES.LOW]! + 1;

// 列内は「優先度(高→中→低)」でまずグループ化し、同一優先度内は
// `表示順`(優先度バケット内で独立した数値。異なる優先度間の大小比較には
// 使わない)で並べる。`表示順`が未設定の場合はチケットNoをタイブレークに
// 使い、表示順序が実行のたびにばらつかないようにする。
export function comparePriority(a: KanbanTask, b: KanbanTask): number {
  const priorityDiff =
    (PRIORITY_ORDER[a.priority] ?? UNKNOWN_PRIORITY_ORDER) -
    (PRIORITY_ORDER[b.priority] ?? UNKNOWN_PRIORITY_ORDER);
  if (priorityDiff !== 0) return priorityDiff;

  if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
    const displayOrderDiff = a.displayOrder - b.displayOrder;
    if (displayOrderDiff !== 0) return displayOrderDiff;
  } else if (a.displayOrder !== undefined) {
    return -1;
  } else if (b.displayOrder !== undefined) {
    return 1;
  }

  return a.id.localeCompare(b.id);
}
