// 列内カードの表示を担当するコンポーネント。1000件規模のレコードでも
// 初回描画が重くならないよう、@tanstack/react-virtualで可視範囲のカード
// のみをDOM生成する(kanban.tsx冒頭のコメント参照: このためDraggableCardは
// SortableContextを使わずuseDraggableのみで構成している)。
//
// カードの高さは件名の折返し行数等で可変なため、固定のestimateSizeに
// 頼らずmeasureElementで実測する。
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useContext, useRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { KanbanContext, type KanbanContextProps, type KanbanItemProps } from './kanban';

const ESTIMATED_CARD_HEIGHT_PX = 72;

interface DraggableCardProps {
  id: string;
  children: ReactNode;
}

const DraggableCard = ({ id, children }: DraggableCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        'tw:cursor-grab',
        isDragging && 'tw:pointer-events-none tw:cursor-grabbing tw:opacity-30',
      )}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
};

export interface VirtualizedCardListProps<T extends KanbanItemProps = KanbanItemProps> {
  columnId: string;
  children: (item: T) => ReactNode;
}

export const VirtualizedCardList = <T extends KanbanItemProps = KanbanItemProps>({
  columnId,
  children,
}: VirtualizedCardListProps<T>) => {
  const { data } = useContext(KanbanContext) as KanbanContextProps<T>;
  const items = data.filter((item) => item.column === columnId);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_CARD_HEIGHT_PX,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="tw:flex-grow tw:overflow-y-auto tw:p-2">
      <div
        style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          if (!item) return null;

          return (
            <div
              key={virtualItem.key}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className="tw:pb-2"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <DraggableCard id={item.id}>{children(item)}</DraggableCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};
