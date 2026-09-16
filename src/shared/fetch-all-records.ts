import type { SavedSavedFields } from './kintone-events';

interface CursorCreateResponse {
  id: string;
}

interface CursorGetResponse {
  records: SavedSavedFields[];
  next: boolean;
}

// カーソルAPIで全件取得する(1回のGET /k/v1/recordsは上限500件のため)。
// カンバンのインクリメンタル検索・親子課題判定は全件がメモリ上にある
// ことが前提のため、フィルタをかけずに一括取得してからクライアント側で
// 絞り込む設計にしている(レンダリング負荷は仮想化で吸収する)。
export async function fetchAllRecords(params: {
  app: number;
  fields?: string[];
  query?: string;
}): Promise<SavedSavedFields[]> {
  const { app, fields, query } = params;

  const cursor = (await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'POST', {
    app,
    fields,
    query,
    size: 500,
  })) as CursorCreateResponse;

  const allRecords: SavedSavedFields[] = [];

  try {
    let hasNext = true;
    while (hasNext) {
      const result = (await kintone.api(
        kintone.api.url('/k/v1/records/cursor', true),
        'GET',
        { id: cursor.id },
      )) as CursorGetResponse;
      allRecords.push(...result.records);
      hasNext = result.next;
    }
  } catch (error) {
    await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'DELETE', { id: cursor.id });
    throw error;
  }

  return allRecords;
}
