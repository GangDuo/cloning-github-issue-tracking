import { useMemo } from 'react';
import { FIELD_CODES } from '../../../../shared/fields';
import type { KanbanFilters } from '../lib/apply-filters';
import type { KanbanTask } from '../lib/kanban-data-mapper';

export interface FilterBarProps {
  tasks: KanbanTask[];
  filters: KanbanFilters;
  onFiltersChange: (filters: KanbanFilters) => void;
}

function useUniqueValues(tasks: KanbanTask[], key: 'type' | 'category' | 'milestoneId'): string[] {
  return useMemo(() => {
    const values = new Set(
      tasks.map((task) => task[key]).filter((value): value is string => !!value),
    );
    return Array.from(values).sort();
  }, [tasks, key]);
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

function useUniqueAssignees(tasks: KanbanTask[]): Array<{ code: string; name: string }> {
  return useMemo(() => {
    const byCode = new Map<string, string>();
    for (const task of tasks) {
      for (const user of task.record[FIELD_CODES.ASSIGNEE]?.value ?? []) {
        byCode.set(user.code, user.name);
      }
    }
    return Array.from(byCode, ([code, name]) => ({ code, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [tasks]);
}

// 種別・カテゴリ・マイルストーンの選択肢は、フォーム定義から取得せず
// 実際にタスクデータに現れている値から動的に抽出する。フィールド定義の
// 変更(選択肢の追加・削除)に自動で追従できるための判断。マイルストーンは
// 名称解決(app=78参照)を行わずIDをそのまま表示する簡易実装としている。
export const FilterBar = ({ tasks, filters, onFiltersChange }: FilterBarProps) => {
  const types = useUniqueValues(tasks, 'type');
  const categories = useUniqueValues(tasks, 'category');
  const milestoneIds = useUniqueValues(tasks, 'milestoneId');
  const assignees = useUniqueAssignees(tasks);

  return (
    <div className="tw:kanban-board-root tw:flex tw:flex-wrap tw:items-start tw:gap-4 tw:p-2 tw:text-sm">
      <input
        type="text"
        value={filters.searchQuery}
        onChange={(event) => onFiltersChange({ ...filters, searchQuery: event.target.value })}
        placeholder="件名・担当者・詳細を検索"
        className="tw:min-w-48 tw:rounded-md tw:border tw:border-kanban-border tw:px-2 tw:py-1"
      />

      <fieldset className="tw:flex tw:flex-wrap tw:gap-2 tw:border-0 tw:p-0">
        <legend className="tw:text-xs">種別</legend>
        {types.map((type) => (
          <label key={type} className="tw:flex tw:items-center tw:gap-1">
            <input
              type="checkbox"
              checked={filters.types.includes(type)}
              onChange={() => onFiltersChange({ ...filters, types: toggleValue(filters.types, type) })}
            />
            {type}
          </label>
        ))}
      </fieldset>

      <fieldset className="tw:flex tw:flex-wrap tw:gap-2 tw:border-0 tw:p-0">
        <legend className="tw:text-xs">カテゴリ</legend>
        {categories.map((category) => (
          <label key={category} className="tw:flex tw:items-center tw:gap-1">
            <input
              type="checkbox"
              checked={filters.categories.includes(category)}
              onChange={() =>
                onFiltersChange({ ...filters, categories: toggleValue(filters.categories, category) })
              }
            />
            {category}
          </label>
        ))}
      </fieldset>

      <fieldset className="tw:flex tw:flex-wrap tw:gap-2 tw:border-0 tw:p-0">
        <legend className="tw:text-xs">マイルストーン</legend>
        {milestoneIds.map((milestoneId) => (
          <label key={milestoneId} className="tw:flex tw:items-center tw:gap-1">
            <input
              type="checkbox"
              checked={filters.milestoneIds.includes(milestoneId)}
              onChange={() =>
                onFiltersChange({
                  ...filters,
                  milestoneIds: toggleValue(filters.milestoneIds, milestoneId),
                })
              }
            />
            {milestoneId}
          </label>
        ))}
      </fieldset>

      <fieldset className="tw:flex tw:flex-wrap tw:gap-2 tw:border-0 tw:p-0">
        <legend className="tw:text-xs">担当者</legend>
        {assignees.map((assignee) => (
          <label key={assignee.code} className="tw:flex tw:items-center tw:gap-1">
            <input
              type="checkbox"
              checked={filters.assigneeCodes.includes(assignee.code)}
              onChange={() =>
                onFiltersChange({
                  ...filters,
                  assigneeCodes: toggleValue(filters.assigneeCodes, assignee.code),
                })
              }
            />
            {assignee.name}
          </label>
        ))}
      </fieldset>
    </div>
  );
};
