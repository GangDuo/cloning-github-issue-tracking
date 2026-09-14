import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setRowClassesByStatus } from './set-row-class-by-status';
import type { SavedSavedFields } from '../../shared/kintone-events';
import { buildSavedSavedFields } from '../../../test/record-builders';

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
  it('非公開レコードは、ステータスが進行中でもstatus-canceledのみ付与される', () => {
    const { row, cell } = createRow('recordlist-row-gaia');
    vi.mocked(kintone.app.getFieldElements).mockReturnValue([cell]);

    const record = buildSavedSavedFields({
      非公開: { type: 'CHECK_BOX', value: ['非公開'] },
      ステータス: { type: 'STATUS', value: '進行中' },
    });

    setRowClassesByStatus({ records: [record] });

    expect(row.classList.contains('status-canceled')).toBe(true);
    expect(row.classList.contains('status-in-progress')).toBe(false);
    expect(row.classList.contains('status-not-started')).toBe(false);
    expect(row.classList.contains('status-provided')).toBe(false);
  });

  it.each([
    ['未処理', 'status-not-started'],
    ['進行中', 'status-in-progress'],
    ['完了', 'status-provided'],
  ])('ステータスが%sのとき%sが付与される', (statusValue, expectedClass) => {
    const { row, cell } = createRow('recordlist-row-gaia');
    vi.mocked(kintone.app.getFieldElements).mockReturnValue([cell]);

    const record = buildSavedSavedFields({
      ステータス: { type: 'STATUS', value: statusValue },
    });

    setRowClassesByStatus({ records: [record] });

    expect(row.classList.contains(expectedClass)).toBe(true);
  });

  it('未知のステータス値のときどの状態クラスも付与されない', () => {
    const { row, cell } = createRow('recordlist-row-gaia');
    vi.mocked(kintone.app.getFieldElements).mockReturnValue([cell]);

    const record = buildSavedSavedFields({
      ステータス: { type: 'STATUS', value: '不明' },
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
      records: [buildSavedSavedFields({ ステータス: { type: 'STATUS', value: '進行中' } })],
    });
    expect(row.classList.contains('status-in-progress')).toBe(true);

    setRowClassesByStatus({
      records: [buildSavedSavedFields({ ステータス: { type: 'STATUS', value: '完了' } })],
    });
    expect(row.classList.contains('status-in-progress')).toBe(false);
    expect(row.classList.contains('status-provided')).toBe(true);
  });

  it('モバイル判定時は別のセレクタ・APIを使う', () => {
    vi.mocked(kintone.mobile.app.getId).mockReturnValue(1);
    const { row, cell } = createRow('gaia-mobile-v2-app-index-recordlist-table-bodyrow');
    vi.mocked(kintone.mobile.app.getFieldElements).mockReturnValue([cell]);

    const record = buildSavedSavedFields({ ステータス: { type: 'STATUS', value: '未処理' } });
    setRowClassesByStatus({ records: [record] });

    expect(row.classList.contains('status-not-started')).toBe(true);
  });

  it('対応する行要素が見つからない場合は何もしない', () => {
    vi.mocked(kintone.app.getFieldElements).mockReturnValue([]);

    const record = buildSavedSavedFields({ ステータス: { type: 'STATUS', value: '未処理' } });

    expect(() => setRowClassesByStatus({ records: [record] })).not.toThrow();
  });

  it('recordsが配列でない場合(カレンダー表示)は例外を投げず何もしない', () => {
    const calendarRecords = {} as unknown as SavedSavedFields[];

    expect(() => setRowClassesByStatus({ records: calendarRecords })).not.toThrow();
    expect(kintone.app.getFieldElements).not.toHaveBeenCalled();
  });
});
