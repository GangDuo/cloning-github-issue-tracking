import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDragToChangeStatus } from './use-drag-to-change-status';
import type { KanbanTask } from '../lib/kanban-data-mapper';
import type { StatusTransitionMap } from '../../../../shared/process-management';
import { buildSavedSavedFields } from '../../../../../test/record-builders';

const task = (id: string, column: string): KanbanTask =>
  ({
    id,
    name: `課題${id}`,
    column,
    priority: '',
    displayOrder: undefined,
    assigneeName: '',
    assignees: [],
    parentName: undefined,
    type: '',
    category: '',
    milestoneId: undefined,
    searchText: '',
    record: buildSavedSavedFields({
      $id: { type: '__ID__', value: id },
      $revision: { type: '__REVISION__', value: '1' },
    }),
  }) as KanbanTask;

const COLUMNS = [{ id: '未処理' }, { id: '進行中' }];

const allowTransition: StatusTransitionMap = { resolveAction: () => '割り当てる' };

beforeEach(() => {
  vi.mocked(kintone.api).mockImplementation(() => Promise.resolve({}));
});

describe('useDragToChangeStatus', () => {
  it('ドラッグオーバーで列を跨いだカードを見た目上ドロップ先の列に表示する', () => {
    const tasks = [task('1', '未処理')];
    const { result } = renderHook(() =>
      useDragToChangeStatus({
        app: 76,
        tasks,
        filteredTasks: tasks,
        transitions: allowTransition,
        columns: COLUMNS,
        refetch: vi.fn(),
        onChangingStatusChange: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleDragOver({
        active: { id: '1' },
        over: { id: '進行中' },
      } as Parameters<typeof result.current.handleDragOver>[0]);
    });

    expect(result.current.displayTasks[0]!.column).toBe('進行中');
  });

  it('確定(ドラッグエンド)すると一時的な列上書きをクリアしrefetchする', async () => {
    const tasks = [task('1', '未処理')];
    const refetch = vi.fn().mockResolvedValue(undefined);
    const onChangingStatusChange = vi.fn();
    const { result } = renderHook(() =>
      useDragToChangeStatus({
        app: 76,
        tasks,
        filteredTasks: tasks,
        transitions: allowTransition,
        columns: COLUMNS,
        refetch,
        onChangingStatusChange,
      }),
    );

    await act(() =>
      result.current.handleDragEnd({
        active: { id: '1' },
        over: { id: '進行中' },
      } as Parameters<typeof result.current.handleDragEnd>[0]),
    );

    expect(result.current.displayTasks[0]!.column).toBe('未処理');
    expect(onChangingStatusChange).toHaveBeenNthCalledWith(1, true);
    expect(onChangingStatusChange).toHaveBeenNthCalledWith(2, false);
    expect(refetch).toHaveBeenCalled();
  });

  it('遷移が許可されていない場合はAPIを呼ばずrejectedメッセージを表示する', async () => {
    const tasks = [task('1', '未処理')];
    const refetch = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDragToChangeStatus({
        app: 76,
        tasks,
        filteredTasks: tasks,
        transitions: { resolveAction: () => undefined },
        columns: COLUMNS,
        refetch,
        onChangingStatusChange: vi.fn(),
      }),
    );

    await act(() =>
      result.current.handleDragEnd({
        active: { id: '1' },
        over: { id: '進行中' },
      } as Parameters<typeof result.current.handleDragEnd>[0]),
    );

    expect(kintone.api).not.toHaveBeenCalled();
    expect(result.current.dragMessage).toBe('この状態への変更はプロセス管理で許可されていません');
  });

  it('同じ列へのドロップは何もしない', async () => {
    const tasks = [task('1', '未処理')];
    const refetch = vi.fn();
    const { result } = renderHook(() =>
      useDragToChangeStatus({
        app: 76,
        tasks,
        filteredTasks: tasks,
        transitions: allowTransition,
        columns: COLUMNS,
        refetch,
        onChangingStatusChange: vi.fn(),
      }),
    );

    await act(() =>
      result.current.handleDragEnd({
        active: { id: '1' },
        over: { id: '未処理' },
      } as Parameters<typeof result.current.handleDragEnd>[0]),
    );

    expect(kintone.api).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
  });
});
