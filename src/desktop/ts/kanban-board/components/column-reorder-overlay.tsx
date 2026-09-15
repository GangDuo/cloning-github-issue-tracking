// 列内の並べ替え専用モーダル。メインボード(kanban.tsx)では仮想化との
// 両立のためSortableContextを使わない設計にしたが、ここは対象を
// 「列(ステータス)×優先度バケット」1組に絞ることで件数を抑え、
// 一般的なdnd-kit sortableのパターン(仮想化なし)をそのまま使う。
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanTask } from '../lib/kanban-data-mapper';
import { cn } from '../lib/cn';
import { Card } from './card';
import { TaskCardContent } from './task-card';

interface SortableTaskCardProps {
  task: KanbanTask;
}

const SortableTaskCard = ({ task }: SortableTaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <Card className={cn('tw:cursor-grab', isDragging && 'tw:cursor-grabbing tw:opacity-50')}>
        <TaskCardContent task={task} />
      </Card>
    </div>
  );
};

export interface ColumnReorderOverlayProps {
  columnName: string;
  priority: string;
  items: KanbanTask[];
  onReorder: (activeId: string, overId: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  isSaving: boolean;
  errorMessage: string | undefined;
}

export const ColumnReorderOverlay = ({
  columnName,
  priority,
  items,
  onReorder,
  onCommit,
  onCancel,
  isSaving,
  errorMessage,
}: ColumnReorderOverlayProps) => {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  return (
    <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:bg-black/40">
      <div className="tw:kanban-board-root tw:flex tw:max-h-[80vh] tw:w-full tw:max-w-md tw:flex-col tw:gap-3 tw:rounded-lg tw:bg-kanban-background tw:p-4 tw:shadow-lg">
        <h2 className="tw:m-0 tw:text-base tw:font-semibold">
          {columnName} / 優先度: {priority} の並べ替え
        </h2>
        {errorMessage && <p className="tw:m-0 tw:text-red-600 tw:text-sm">{errorMessage}</p>}
        <div className="tw:flex-grow tw:overflow-y-auto">
          <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="tw:flex tw:flex-col tw:gap-2">
                {items.map((item) => (
                  <SortableTaskCard key={item.id} task={item} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        <div className="tw:flex tw:justify-end tw:gap-2">
          <button
            type="button"
            className="tw:rounded-md tw:border tw:border-kanban-border tw:px-3 tw:py-1.5 tw:text-sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="tw:rounded-md tw:bg-kanban-primary tw:px-3 tw:py-1.5 tw:text-kanban-background tw:text-sm"
            onClick={onCommit}
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '確定'}
          </button>
        </div>
      </div>
    </div>
  );
};
