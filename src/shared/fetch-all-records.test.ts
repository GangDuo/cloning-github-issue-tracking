import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAllRecords } from './fetch-all-records';
import { buildSavedSavedFields } from '../../test/record-builders';

describe('fetchAllRecords', () => {
  beforeEach(() => {
    vi.mocked(kintone.api).mockReset();
  });

  it('1ページで完結する場合はカーソル作成後に1回GETして削除は行わない', async () => {
    const record = buildSavedSavedFields({ チケットNo: { type: 'RECORD_NUMBER', value: '1' } });
    vi.mocked(kintone.api).mockImplementation((url: string, method: string) => {
      if (method === 'POST') return Promise.resolve({ id: 'cursor-1' });
      if (method === 'GET') return Promise.resolve({ records: [record], next: false });
      throw new Error(`unexpected call: ${url} ${method}`);
    });

    const result = await fetchAllRecords({ app: 76, fields: ['チケットNo'] });

    expect(result).toEqual([record]);
    expect(kintone.api).toHaveBeenCalledWith('/k/v1/records/cursor', 'POST', {
      app: 76,
      fields: ['チケットNo'],
      query: undefined,
      size: 500,
    });
    expect(vi.mocked(kintone.api).mock.calls.filter(([, method]) => method === 'DELETE')).toHaveLength(0);
  });

  it('next:trueの間はページングを続け、全ページ分のレコードを結合する', async () => {
    const record1 = buildSavedSavedFields({ チケットNo: { type: 'RECORD_NUMBER', value: '1' } });
    const record2 = buildSavedSavedFields({ チケットNo: { type: 'RECORD_NUMBER', value: '2' } });
    let getCallCount = 0;
    vi.mocked(kintone.api).mockImplementation((_url: string, method: string) => {
      if (method === 'POST') return Promise.resolve({ id: 'cursor-1' });
      if (method === 'GET') {
        getCallCount += 1;
        if (getCallCount === 1) return Promise.resolve({ records: [record1], next: true });
        return Promise.resolve({ records: [record2], next: false });
      }
      throw new Error('unexpected call');
    });

    const result = await fetchAllRecords({ app: 76 });

    expect(result).toEqual([record1, record2]);
  });

  it('取得中にエラーが起きた場合はカーソルを削除してから例外を再送出する', async () => {
    vi.mocked(kintone.api).mockImplementation((_url: string, method: string) => {
      if (method === 'POST') return Promise.resolve({ id: 'cursor-1' });
      if (method === 'GET') return Promise.reject(new Error('network error'));
      if (method === 'DELETE') return Promise.resolve({});
      throw new Error('unexpected call');
    });

    await expect(fetchAllRecords({ app: 76 })).rejects.toThrow('network error');

    expect(kintone.api).toHaveBeenCalledWith('/k/v1/records/cursor', 'DELETE', { id: 'cursor-1' });
  });
});
