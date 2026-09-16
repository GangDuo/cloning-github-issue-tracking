import { FIELD_CODES } from '../../../../shared/fields';
import type { SavedSavedFields } from '../../../../shared/kintone-events';

// 親課題→子課題→孫課題の3階層のうち、他レコードの「親」として参照されて
// いないレコード(=末端タスク)だけをカンバンのカード対象とする。
// 何階層目かは問わないため、深さに依存しない汎用ロジックにする。
export function selectLeafTasks(records: SavedSavedFields[]): SavedSavedFields[] {
  const parentTicketNumbers = new Set(
    records
      .map((record) => record[FIELD_CODES.PARENT]?.value)
      .filter((value): value is string => !!value),
  );

  return records.filter(
    (record) => !parentTicketNumbers.has(record[FIELD_CODES.TICKET_NO].value),
  );
}
