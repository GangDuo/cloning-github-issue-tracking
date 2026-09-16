import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { fetchAllRecords } from '../../../../shared/fetch-all-records';
import { useKanbanRecords } from './use-kanban-records';
import { buildSavedSavedFields } from '../../../../../test/record-builders';

vi.mock('../../../../shared/fetch-all-records', () => ({
  fetchAllRecords: vi.fn(),
}));

describe('useKanbanRecords', () => {
  it('非公開の中間レコードがあっても祖先を末端タスクとして表示しない', async () => {
    const grandParent = buildSavedSavedFields({
      チケットNo: { type: 'RECORD_NUMBER', value: '1' },
      件名: { type: 'SINGLE_LINE_TEXT', value: '祖父課題' },
      ステータス: { type: 'STATUS', value: '未処理' },
    });
    const privateParent = buildSavedSavedFields({
      チケットNo: { type: 'RECORD_NUMBER', value: '2' },
      件名: { type: 'SINGLE_LINE_TEXT', value: '親課題' },
      ステータス: { type: 'STATUS', value: '未処理' },
      親: { type: 'SINGLE_LINE_TEXT', value: '1' },
      非公開: { type: 'CHECK_BOX', value: ['非公開'] },
    });
    const child = buildSavedSavedFields({
      チケットNo: { type: 'RECORD_NUMBER', value: '3' },
      件名: { type: 'SINGLE_LINE_TEXT', value: '子課題' },
      ステータス: { type: 'STATUS', value: '進行中' },
      親: { type: 'SINGLE_LINE_TEXT', value: '2' },
    });
    vi.mocked(fetchAllRecords).mockResolvedValue([grandParent, privateParent, child]);

    const { result } = renderHook(() => useKanbanRecords(76, { paused: false }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const ids = result.current.tasks.map((task) => task.id);
    expect(ids).not.toContain('1');
    expect(ids).not.toContain('2');
    expect(ids).toContain('3');
  });
});
