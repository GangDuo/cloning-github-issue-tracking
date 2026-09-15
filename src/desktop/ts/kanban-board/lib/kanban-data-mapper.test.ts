import { describe, expect, it } from 'vitest';
import { mapRecordsToKanbanTasks } from './kanban-data-mapper';
import { buildSavedSavedFields } from '../../../../../test/record-builders';

const ASSIGNEE = { code: 'user1', name: '担当 太郎' };

describe('mapRecordsToKanbanTasks', () => {
  it('末端タスクをKanbanTaskに変換する', () => {
    const parent = buildSavedSavedFields({
      チケットNo: { type: 'RECORD_NUMBER', value: '1' },
      件名: { type: 'SINGLE_LINE_TEXT', value: '親課題' },
    });
    const leaf = buildSavedSavedFields({
      チケットNo: { type: 'RECORD_NUMBER', value: '2' },
      件名: { type: 'SINGLE_LINE_TEXT', value: '子課題' },
      ステータス: { type: 'STATUS', value: '進行中' },
      優先度: { type: 'DROP_DOWN', value: '高' },
      表示順: { type: 'NUMBER', value: '20' },
      対応者: { type: 'USER_SELECT', value: [ASSIGNEE] },
      詳細: { type: 'RICH_TEXT', value: '<p>詳細な説明</p>' },
      親: { type: 'SINGLE_LINE_TEXT', value: '1' },
    });

    const [task] = mapRecordsToKanbanTasks([leaf], [parent, leaf]);

    expect(task).toMatchObject({
      id: '2',
      name: '子課題',
      column: '進行中',
      priority: '高',
      displayOrder: 20,
      assigneeName: '担当 太郎',
      parentName: '親課題',
    });
    expect(task!.searchText).toContain('子課題');
    expect(task!.searchText).toContain('担当 太郎');
    expect(task!.searchText).toContain('詳細な説明');
  });

  it('親が見つからない・未設定の場合はparentNameがundefinedになる', () => {
    const leaf = buildSavedSavedFields({
      チケットNo: { type: 'RECORD_NUMBER', value: '2' },
      件名: { type: 'SINGLE_LINE_TEXT', value: '独立課題' },
      ステータス: { type: 'STATUS', value: '未処理' },
    });

    const [task] = mapRecordsToKanbanTasks([leaf], [leaf]);

    expect(task!.parentName).toBeUndefined();
  });

  it('対応者・表示順が未設定の場合は空文字/undefinedになる', () => {
    const leaf = buildSavedSavedFields({
      チケットNo: { type: 'RECORD_NUMBER', value: '2' },
      件名: { type: 'SINGLE_LINE_TEXT', value: '未割当課題' },
      ステータス: { type: 'STATUS', value: '未処理' },
    });

    const [task] = mapRecordsToKanbanTasks([leaf], [leaf]);

    expect(task!.assigneeName).toBe('');
    expect(task!.displayOrder).toBeUndefined();
  });
});
