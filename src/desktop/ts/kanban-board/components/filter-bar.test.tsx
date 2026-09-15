import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FilterBar } from './filter-bar';
import { EMPTY_FILTERS } from '../lib/apply-filters';
import type { KanbanTask } from '../lib/kanban-data-mapper';

const task = (overrides: Partial<KanbanTask>): KanbanTask =>
  ({
    id: '1',
    name: '課題',
    column: '未処理',
    priority: '',
    displayOrder: undefined,
    assigneeName: '担当 太郎',
    parentName: undefined,
    type: 'バグ',
    category: 'サブシステムA',
    milestoneId: '1',
    searchText: '',
    record: {
      対応者: { type: 'USER_SELECT', value: [{ code: 'user1', name: '担当 太郎' }] },
    } as KanbanTask['record'],
    ...overrides,
  }) as KanbanTask;

describe('FilterBar', () => {
  it('タスクに含まれる種別・カテゴリ・担当者を選択肢として表示する', () => {
    render(<FilterBar tasks={[task({})]} filters={EMPTY_FILTERS} onFiltersChange={vi.fn()} />);

    expect(screen.getByText('バグ')).toBeInTheDocument();
    expect(screen.getByText('サブシステムA')).toBeInTheDocument();
    expect(screen.getByText('担当 太郎')).toBeInTheDocument();
  });

  it('検索テキストを入力するとonFiltersChangeが呼ばれる', () => {
    const onFiltersChange = vi.fn();
    render(<FilterBar tasks={[task({})]} filters={EMPTY_FILTERS} onFiltersChange={onFiltersChange} />);

    fireEvent.change(screen.getByPlaceholderText('件名・担当者・詳細を検索'), {
      target: { value: 'ログイン' },
    });

    expect(onFiltersChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, searchQuery: 'ログイン' });
  });

  it('種別チェックボックスをクリックするとtypesに追加される', () => {
    const onFiltersChange = vi.fn();
    render(<FilterBar tasks={[task({})]} filters={EMPTY_FILTERS} onFiltersChange={onFiltersChange} />);

    fireEvent.click(screen.getByLabelText('バグ'));

    expect(onFiltersChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, types: ['バグ'] });
  });
});
