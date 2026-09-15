import { useState } from 'react';
import type { KanbanTask } from '../lib/kanban-data-mapper';
import { useColumnReorder } from '../hooks/use-column-reorder';
import { ColumnReorderOverlay } from './column-reorder-overlay';

export interface ColumnReorderContainerProps {
  app: number;
  columnName: string;
  priority: string;
  initialItems: KanbanTask[];
  onClose: () => void;
  onCommitted: () => void;
}

// useColumnReorderはinitialItemsを初期stateとしてしか使わないため、
// 対象(列×優先度)が変わるたびに呼び出し側でkeyを変えて本コンポーネント
// ごと再マウントし、意図せず前回の並べ替え途中状態が引き継がれないよう
// にする(呼び出し側のkanban-board-app.tsxを参照)。
export const ColumnReorderContainer = ({
  app,
  columnName,
  priority,
  initialItems,
  onClose,
  onCommitted,
}: ColumnReorderContainerProps) => {
  const { items, reorder, commit } = useColumnReorder(app, initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const handleCommit = async () => {
    setIsSaving(true);
    setErrorMessage(undefined);
    const result = await commit();
    setIsSaving(false);

    if (result.type === 'success') {
      onCommitted();
    } else if (result.type === 'conflict') {
      setErrorMessage('他のユーザーによって更新されたため、保存できませんでした。閉じて最新の状態を確認してください');
    } else {
      setErrorMessage('保存に失敗しました');
    }
  };

  return (
    <ColumnReorderOverlay
      columnName={columnName}
      priority={priority}
      items={items}
      onReorder={reorder}
      onCommit={() => void handleCommit()}
      onCancel={onClose}
      isSaving={isSaving}
      errorMessage={errorMessage}
    />
  );
};
