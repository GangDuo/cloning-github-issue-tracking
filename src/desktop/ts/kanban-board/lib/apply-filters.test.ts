import { describe, expect, it } from 'vitest';
import { applyFilters, EMPTY_FILTERS } from './apply-filters';
import type { KanbanTask } from './kanban-data-mapper';

const task = (overrides: Partial<KanbanTask>): KanbanTask =>
  ({
    id: '1',
    name: 'ログイン画面の不具合',
    column: '未処理',
    priority: '',
    displayOrder: undefined,
    assigneeName: '担当 太郎',
    assignees: [{ code: 'user1', name: '担当 太郎' }],
    parentName: undefined,
    type: 'バグ',
    category: 'サブシステムA',
    milestoneId: '1',
    searchText: 'ログイン画面の不具合 担当 太郎',
    record: {} as KanbanTask['record'],
    ...overrides,
  }) as KanbanTask;

describe('applyFilters', () => {
  it('フィルタなしの場合は全件を返す', () => {
    expect(applyFilters([task({})], EMPTY_FILTERS)).toHaveLength(1);
  });

  it('検索語に一致しないタスクを除外する', () => {
    const result = applyFilters([task({})], { ...EMPTY_FILTERS, searchQuery: '決済' });
    expect(result).toHaveLength(0);
  });

  it('種別が選択肢に含まれないタスクを除外する', () => {
    const result = applyFilters([task({ type: 'バグ' })], { ...EMPTY_FILTERS, types: ['新機能'] });
    expect(result).toHaveLength(0);
  });

  it('カテゴリが選択肢に含まれるタスクのみ残す', () => {
    const matching = task({ category: 'サブシステムA' });
    const notMatching = task({ id: '2', category: 'サブシステムB' });
    const result = applyFilters([matching, notMatching], { ...EMPTY_FILTERS, categories: ['サブシステムA'] });
    expect(result).toEqual([matching]);
  });

  it('マイルストーン未設定のタスクは絞り込み時に除外する', () => {
    const result = applyFilters([task({ milestoneId: undefined })], {
      ...EMPTY_FILTERS,
      milestoneIds: ['1'],
    });
    expect(result).toHaveLength(0);
  });

  it('担当者コードで絞り込める', () => {
    const result = applyFilters([task({})], { ...EMPTY_FILTERS, assigneeCodes: ['user1'] });
    expect(result).toHaveLength(1);

    const noMatch = applyFilters([task({})], { ...EMPTY_FILTERS, assigneeCodes: ['user2'] });
    expect(noMatch).toHaveLength(0);
  });
});
