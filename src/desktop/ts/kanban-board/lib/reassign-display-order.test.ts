import { describe, expect, it } from 'vitest';
import { reassignDisplayOrder } from './reassign-display-order';

describe('reassignDisplayOrder', () => {
  it('先頭から等間隔の表示順を振り直す', () => {
    const result = reassignDisplayOrder([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

    expect(result).toEqual([
      { id: 'a', displayOrder: 10 },
      { id: 'b', displayOrder: 20 },
      { id: 'c', displayOrder: 30 },
    ]);
  });

  it('並び順を入れ替えた配列でも、その並び順通りに割り当てる', () => {
    const result = reassignDisplayOrder([{ id: 'c' }, { id: 'a' }, { id: 'b' }]);

    expect(result.map((item) => item.id)).toEqual(['c', 'a', 'b']);
    expect(result.map((item) => item.displayOrder)).toEqual([10, 20, 30]);
  });

  it('空配列を渡した場合は空配列を返す', () => {
    expect(reassignDisplayOrder([])).toEqual([]);
  });
});
