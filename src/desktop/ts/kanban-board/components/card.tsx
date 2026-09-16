import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

// shadcn/uiのCardコンポーネントをRadix UI依存なしで手動移植した薄いラッパー。
// スタイルの大半は呼び出し側(column-reorder-overlay.tsx等)がclassNameで指定するため、
// ここでは最小限の見た目(背景・枠線・角丸)のみを定義する。
export const Card = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn(
      'tw:bg-kanban-background tw:text-kanban-foreground tw:rounded-xl tw:border tw:border-kanban-border',
      className,
    )}
    {...props}
  />
);
