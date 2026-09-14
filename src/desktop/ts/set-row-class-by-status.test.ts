import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setRowClassesByStatus } from './set-row-class-by-status';

type SavedFields = kintone.types.SavedFields;

const buildRecord = (overrides: Partial<SavedFields>): SavedFields => overrides as SavedFields;

function createRow(rowClassName: string): { row: HTMLElement; cell: HTMLElement } {
  const row = document.createElement('div');
  row.className = rowClassName;
  const cell = document.createElement('div');
  row.appendChild(cell);
  document.body.appendChild(row);
  return { row, cell };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('setRowClassesByStatus', () => {
  it('非公開レコードはstatus-canceledのみ付与される', () => {
    const { row, cell } = createRow('recordlist-row-gaia');
    vi.mocked(kintone.app.getFieldElements).mockReturnValue([cell]);

    const record = buildRecord({
      非公開: { type: 'CHECK_BOX', value: ['非公開'] },
      カテゴリー: { type: 'CATEGORY', value: ['進行中'] },
    });

    setRowClassesByStatus({ records: [record] });

    expect(row.classList.contains('status-canceled')).toBe(true);
    expect(row.classList.contains('status-in-progress')).toBe(false);
  });

  it.each([
    ['未処理', 'status-not-started'],
    ['進行中', 'status-in-progress'],
    ['完了', 'status-provided'],
  ])('カテゴリーが%sのとき%sが付与される', (categoryValue, expectedClass) => {
    const { row, cell } = createRow('recordlist-row-gaia');
    vi.mocked(kintone.app.getFieldElements).mockReturnValue([cell]);

    const record = buildRecord({
      カテゴリー: { type: 'CATEGORY', value: [categoryValue] },
    });

    setRowClassesByStatus({ records: [record] });

    expect(row.classList.contains(expectedClass)).toBe(true);
  });

  it('未知のカテゴリー値のときどの状態クラスも付与されない', () => {
    const { row, cell } = createRow('recordlist-row-gaia');
    vi.mocked(kintone.app.getFieldElements).mockReturnValue([cell]);

    const record = buildRecord({
      カテゴリー: { type: 'CATEGORY', value: ['不明'] },
    });

    setRowClassesByStatus({ records: [record] });

    expect(row.classList.contains('status-not-started')).toBe(false);
    expect(row.classList.contains('status-in-progress')).toBe(false);
    expect(row.classList.contains('status-provided')).toBe(false);
    expect(row.classList.contains('status-canceled')).toBe(false);
  });

  it('再呼び出し時に前回のクラスが正しく除去される', () => {
    const { row, cell } = createRow('recordlist-row-gaia');
    vi.mocked(kintone.app.getFieldElements).mockReturnValue([cell]);

    setRowClassesByStatus({
      records: [buildRecord({ カテゴリー: { type: 'CATEGORY', value: ['進行中'] } })],
    });
    expect(row.classList.contains('status-in-progress')).toBe(true);

    setRowClassesByStatus({
      records: [buildRecord({ カテゴリー: { type: 'CATEGORY', value: ['完了'] } })],
    });
    expect(row.classList.contains('status-in-progress')).toBe(false);
    expect(row.classList.contains('status-provided')).toBe(true);
  });

  it('モバイル判定時は別のセレクタ・APIを使う', () => {
    vi.mocked(kintone.mobile.app.getId).mockReturnValue(1);
    const { row, cell } = createRow('gaia-mobile-v2-app-index-recordlist-table-bodyrow');
    vi.mocked(kintone.mobile.app.getFieldElements).mockReturnValue([cell]);

    const record = buildRecord({ カテゴリー: { type: 'CATEGORY', value: ['未処理'] } });
    setRowClassesByStatus({ records: [record] });

    expect(row.classList.contains('status-not-started')).toBe(true);
  });

  it('対応する行要素が見つからない場合は何もしない', () => {
    vi.mocked(kintone.app.getFieldElements).mockReturnValue([]);

    const record = buildRecord({ カテゴリー: { type: 'CATEGORY', value: ['未処理'] } });

    expect(() => setRowClassesByStatus({ records: [record] })).not.toThrow();
  });
});
