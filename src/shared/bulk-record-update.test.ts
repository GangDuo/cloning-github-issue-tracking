import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeBulkRecordUpdate } from './bulk-record-update';

beforeEach(() => {
  vi.mocked(kintone.api).mockImplementation(() => Promise.resolve({ records: [] }));
});

describe('executeBulkRecordUpdate', () => {
  it('PUT /k/v1/recordsに各レコードのid/revision/recordを渡して実行する', () => {
    executeBulkRecordUpdate(76, [
      { id: 1, revision: '3', record: { 表示順: { value: 10 } } },
      { id: 2, revision: '5', record: { 表示順: { value: 20 } } },
    ]);

    expect(kintone.api.url).toHaveBeenCalledWith('/k/v1/records', true);
    expect(kintone.api).toHaveBeenCalledWith('/k/v1/records', 'PUT', {
      app: 76,
      records: [
        { id: 1, revision: '3', record: { 表示順: { value: 10 } } },
        { id: 2, revision: '5', record: { 表示順: { value: 20 } } },
      ],
    });
  });
});
