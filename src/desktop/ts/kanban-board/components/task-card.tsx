import type { KanbanTask } from '../lib/kanban-data-mapper';

export interface TaskCardContentProps {
  task: KanbanTask;
}

// KanbanCard/column-reorder-overlayの両方から呼ばれるカード内容の
// レンダリング。ドラッグ用のラッパー(useDraggable/useSortable)は
// 呼び出し側が担当するため、ここでは純粋に表示内容のみを扱う。
export const TaskCardContent = ({ task }: TaskCardContentProps) => (
  <div className="tw:flex tw:flex-col tw:gap-1 tw:p-3">
    <p className="tw:m-0 tw:font-medium tw:text-sm">{task.name}</p>
    {task.parentName && (
      <p className="tw:m-0 tw:text-kanban-foreground/60 tw:text-xs">親: {task.parentName}</p>
    )}
    <div className="tw:flex tw:items-center tw:justify-between tw:text-xs">
      <span>{task.assigneeName || '未割当'}</span>
      {task.priority && <span>優先度: {task.priority}</span>}
    </div>
  </div>
);
