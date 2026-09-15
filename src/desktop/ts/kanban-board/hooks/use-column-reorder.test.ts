import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useColumnReorder } from './use-column-reorder';
import type { KanbanTask } from '../lib/kanban-data-mapper';
import { buildSavedSavedFields } from '../../../../../test/record-builders';

const task = (id: string, ticketId: number): KanbanTask =>
  ({
    id,
    name: `課題${id}`,
    column: '未処理',
    priority: '中',
    displayOrder: undefined,
    assigneeName: '',
    parentName: undefined,
    searchText: '',
    record: buildSavedSavedFields({
      $id: { type: '__ID__', value: String(ticketId) },
      $revision: { type: '__REVISION__', value: '1' },
    }),
  }) as KanbanTask;

beforeEach(() => {
  vi.mocked(kintone.api).mockImplementation(() => Promise.resolve({}));
});

describe('useColumnReorder', () => {
  it('reorderで並び順を入れ替える', () => {
    const { result } = renderHook(() => useColumnReorder(76, [task('1', 101), task('2', 102), task('3', 103)]));

    act(() => {
      result.current.reorder('1', '3');
    });

    expect(result.current.items.map((item) => item.id)).toEqual(['2', '3', '1']);
  });

  it('commitで並び順に応じた表示順を一括更新する', async () => {
    const { result } = renderHook(() => useColumnReorder(76, [task('1', 101), task('2', 102)]));

    act(() => {
      result.current.reorder('1', '2');
    });

    const commitResult = await act(() => result.current.commit());

    expect(commitResult).toEqual({ type: 'success' });
    expect(kintone.api).toHaveBeenCalledWith('/k/v1/records', 'PUT', {
      app: 76,
      records: [
        { id: 102, revision: '1', record: { 表示順: { value: 10 } } },
        { id: 101, revision: '1', record: { 表示順: { value: 20 } } },
      ],
    });
  });

  it('リビジョン競合時はconflictを返す', async () => {
    vi.mocked(kintone.api).mockRejectedValue({ code: 'GAIA_CO02' });
    const { result } = renderHook(() => useColumnReorder(76, [task('1', 101)]));

    const commitResult = await act(() => result.current.commit());

    expect(commitResult).toEqual({ type: 'conflict' });
  });
});
