// Kibo UI Kanban(https://www.kibo-ui.com/components/kanban)をベースに、
// このプロジェクト向けに以下を変更して移植したもの:
//
// - 列内の自由な並べ替え(SortableContext/useSortable)は行わない設計のため、
//   KanbanCardはuseDraggableのみで構成する(ドロップ対象はKanbanBoard列
//   全体のみとし、個々のカードはドロップターゲットにしない)。これにより
//   Step7の仮想化(virtualized-card-list.tsx)と両立できる。SortableContext
//   は列内カード全件の実DOM rectを前提に衝突判定を行うため、仮想化で
//   画面外のカードをアンマウントすると破綻してしまう。
// - shadcn/uiのScrollAreaはRadix依存を増やすため使わず、ネイティブの
//   overflow-y-autoで代替する(仮想化コンテナ側で対応)。
// - tunnel-rat(DragOverlayへのスロット転送)も依存を増やすため使わない。
//   KanbanProviderにrenderOverlayCardを渡してもらい、activeCardIdから
//   対象データを引いて同じレンダー関数をDragOverlay側で再実行する。
import type { DndContextProps, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, DragOverlay, closestCenter, useDroppable } from '@dnd-kit/core';
import { createContext, useState, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useKanbanDndSensors } from '../hooks/use-kanban-dnd-sensors';
import { cn } from '../lib/cn';

export type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';

export type KanbanItemProps = {
  id: string;
  name: string;
  column: string;
} & Record<string, unknown>;

export type KanbanColumnProps = {
  id: string;
  name: string;
} & Record<string, unknown>;

export type KanbanContextProps<
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps,
> = {
  columns: C[];
  data: T[];
  activeCardId: string | null;
};

const KanbanContext = createContext<KanbanContextProps>({
  columns: [],
  data: [],
  activeCardId: null,
});

export type KanbanBoardProps = { id: string; children: ReactNode; className?: string };

export const KanbanBoard = ({ id, children, className }: KanbanBoardProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      className={cn(
        'tw:flex tw:size-full tw:min-h-40 tw:flex-col tw:divide-y tw:overflow-hidden tw:rounded-md tw:border tw:border-kanban-border tw:bg-kanban-secondary tw:text-xs tw:shadow-sm tw:ring-2 tw:transition-all',
        isOver ? 'tw:ring-kanban-primary' : 'tw:ring-transparent',
        className,
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export type KanbanHeaderProps = HTMLAttributes<HTMLDivElement>;

export const KanbanHeader = ({ className, ...props }: KanbanHeaderProps) => (
  <div className={cn('tw:m-0 tw:flex tw:items-center tw:justify-between tw:p-2 tw:font-semibold tw:text-sm', className)} {...props} />
);

export type KanbanProviderProps<
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps,
> = Omit<DndContextProps, 'children'> & {
  children: (column: C) => ReactNode;
  renderOverlayCard: (item: T) => ReactNode;
  className?: string;
  columns: C[];
  data: T[];
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
};

export const KanbanProvider = <
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps,
>({
  children,
  renderOverlayCard,
  onDragStart,
  onDragEnd,
  onDragOver,
  className,
  columns,
  data,
  ...props
}: KanbanProviderProps<T, C>) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const sensors = useKanbanDndSensors();

  const handleDragStart = (event: DragStartEvent) => {
    const card = data.find((item) => item.id === event.active.id);
    if (card) {
      setActiveCardId(event.active.id as string);
    }
    onDragStart?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);
    onDragEnd?.(event);
  };

  const activeItem = data.find((item) => item.id === activeCardId);

  return (
    <KanbanContext.Provider value={{ columns, data, activeCardId }}>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={onDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
        {...props}
      >
        <div className={cn('tw:grid tw:size-full tw:auto-cols-fr tw:grid-flow-col tw:gap-4', className)}>
          {columns.map((column) => children(column))}
        </div>
        {typeof window !== 'undefined' &&
          createPortal(
            <DragOverlay>{activeItem ? renderOverlayCard(activeItem) : null}</DragOverlay>,
            document.body,
          )}
      </DndContext>
    </KanbanContext.Provider>
  );
};

export { KanbanContext };
