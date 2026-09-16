import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useKanbanBoardView } from './use-kanban-board-view';
import type { KanbanTask } from '../lib/kanban-data-mapper';
import { buildSavedSavedFields } from '../../../../../test/record-builders';

const task = (id: string, column: string, priority: string): KanbanTask =>
  ({
    id,
    name: `課題${id}`,
    column,
    priority,
    displayOrder: undefined,
    assigneeName: '',
    assignees: [],
    parentName: undefined,
    type: '',
    category: '',
    milestoneId: undefined,
    searchText: '',
    record: buildSavedSavedFields({}),
  }) as KanbanTask;

const COLUMNS = [
  { id: '未処理', name: '未処理' },
  { id: '進行中', name: '進行中' },
];

describe('useKanbanBoardView', () => {
  it('列ごとに優先度順でソートし、列の順序通りに平坦化する', () => {
    const displayTasks = [
      task('1', '進行中', '低'),
      task('2', '未処理', '高'),
      task('3', '未処理', '低'),
      task('4', '進行中', '高'),
    ];

    const { result } = renderHook(() =>
      useKanbanBoardView({ displayTasks, columns: COLUMNS, reorderTarget: null }),
    );

    expect(result.current.sortedByColumn.get('未処理')?.map((t) => t.id)).toEqual(['2', '3']);
    expect(result.current.sortedByColumn.get('進行中')?.map((t) => t.id)).toEqual(['4', '1']);
    expect(result.current.kanbanData.map((t) => t.id)).toEqual(['2', '3', '4', '1']);
  });

  it('reorderTargetがnullのとき、reorderColumnNameは空文字、reorderItemsは空配列になる', () => {
    const { result } = renderHook(() =>
      useKanbanBoardView({ displayTasks: [], columns: COLUMNS, reorderTarget: null }),
    );

    expect(result.current.reorderColumnName).toBe('');
    expect(result.current.reorderItems).toEqual([]);
  });

  it('reorderTargetが指定されたとき、対象列・対象優先度のタスクのみをreorderItemsに抽出する', () => {
    const displayTasks = [
      task('1', '未処理', '高'),
      task('2', '未処理', '低'),
      task('3', '進行中', '高'),
    ];

    const { result } = renderHook(() =>
      useKanbanBoardView({
        displayTasks,
        columns: COLUMNS,
        reorderTarget: { columnId: '未処理', priority: '高' },
      }),
    );

    expect(result.current.reorderColumnName).toBe('未処理');
    expect(result.current.reorderItems.map((t) => t.id)).toEqual(['1']);
  });
});
