import { describe, expect, it } from 'vitest';
import { comparePriority } from './priority-sort';
import type { KanbanTask } from './kanban-data-mapper';

const task = (overrides: Partial<KanbanTask>): KanbanTask =>
  ({
    id: '1',
    name: '',
    column: '未処理',
    priority: '',
    displayOrder: undefined,
    assigneeName: '',
    parentName: undefined,
    searchText: '',
    record: {} as KanbanTask['record'],
    ...overrides,
  }) as KanbanTask;

describe('comparePriority', () => {
  it('優先度が高いものほど前に並ぶ', () => {
    const high = task({ id: '1', priority: '高' });
    const low = task({ id: '2', priority: '低' });

    expect(comparePriority(high, low)).toBeLessThan(0);
    expect(comparePriority(low, high)).toBeGreaterThan(0);
  });

  it('同一優先度内では表示順の小さい順に並ぶ', () => {
    const first = task({ id: '1', priority: '中', displayOrder: 10 });
    const second = task({ id: '2', priority: '中', displayOrder: 20 });

    expect(comparePriority(first, second)).toBeLessThan(0);
  });

  it('表示順が設定済みのものが未設定のものより前に並ぶ', () => {
    const withOrder = task({ id: '1', priority: '中', displayOrder: 10 });
    const withoutOrder = task({ id: '2', priority: '中', displayOrder: undefined });

    expect(comparePriority(withOrder, withoutOrder)).toBeLessThan(0);
  });

  it('優先度・表示順とも同じ場合はチケットNoでタイブレークする', () => {
    const a = task({ id: '1', priority: '中' });
    const b = task({ id: '2', priority: '中' });

    expect(comparePriority(a, b)).toBeLessThan(0);
  });
});
