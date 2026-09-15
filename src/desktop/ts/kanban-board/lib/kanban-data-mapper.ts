import { FIELD_CODES } from '../../../../shared/fields';
import type { SavedSavedFields } from '../../../../shared/kintone-events';
import type { KanbanItemProps } from '../components/kanban';
import { stripHtmlTags } from './search-text';

export interface KanbanTask extends KanbanItemProps {
  priority: string;
  displayOrder: number | undefined;
  assigneeName: string;
  parentName: string | undefined;
  // 件名・担当者名・詳細(タグ除去済み)を連結した検索用テキスト。キー入力
  // のたびに全件へ毎回タグ除去処理をかけないよう、フェッチ直後に1回だけ
  // ここで計算してキャッシュする。
  searchText: string;
  record: SavedSavedFields;
}

// 末端タスク(leafTasks)を表示対象とするが、親課題名の解決には親自身の
// レコード(全件allRecords)が必要なため、両方を受け取る。
export function mapRecordsToKanbanTasks(
  leafTasks: SavedSavedFields[],
  allRecords: SavedSavedFields[],
): KanbanTask[] {
  const titleByTicketNumber = new Map(
    allRecords.map((record) => [record[FIELD_CODES.TICKET_NO].value, record[FIELD_CODES.TITLE].value]),
  );

  return leafTasks.map((record) => {
    const title = record[FIELD_CODES.TITLE].value;
    const assigneeUsers: Array<{ code: string; name: string }> =
      record[FIELD_CODES.ASSIGNEE]?.value ?? [];
    const assigneeName = assigneeUsers.map((user) => user.name).join(', ');
    const description = stripHtmlTags(record[FIELD_CODES.DESCRIPTION]?.value ?? '');
    const parentTicketNumber = record[FIELD_CODES.PARENT]?.value;
    const displayOrderValue = record[FIELD_CODES.DISPLAY_ORDER]?.value;

    return {
      id: record[FIELD_CODES.TICKET_NO].value,
      name: title,
      column: record[FIELD_CODES.STATUS].value,
      priority: record[FIELD_CODES.PRIORITY]?.value ?? '',
      displayOrder: displayOrderValue ? Number(displayOrderValue) : undefined,
      assigneeName,
      parentName: parentTicketNumber ? titleByTicketNumber.get(parentTicketNumber) : undefined,
      searchText: [title, assigneeName, description].join(' ').toLowerCase(),
      record,
    };
  });
}
