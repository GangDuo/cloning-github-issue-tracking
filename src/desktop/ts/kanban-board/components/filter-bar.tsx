import { useMemo } from 'react';
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
    const byCode = new Map(tasks.flatMap((task) => task.assignees.map((a) => [a.code, a.name])));
    return Array.from(byCode, ([code, name]) => ({ code, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [tasks]);
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroupProps {
  legend: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

function FilterGroup({ legend, options, selectedValues, onToggle }: FilterGroupProps) {
  return (
    <fieldset className="tw:flex tw:flex-wrap tw:gap-2 tw:border-0 tw:p-0">
      <legend className="tw:text-xs">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className="tw:flex tw:items-center tw:gap-1">
          <input
            type="checkbox"
            checked={selectedValues.includes(option.value)}
            onChange={() => onToggle(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
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

      <FilterGroup
        legend="種別"
        options={types.map((type) => ({ value: type, label: type }))}
        selectedValues={filters.types}
        onToggle={(value) => onFiltersChange({ ...filters, types: toggleValue(filters.types, value) })}
      />

      <FilterGroup
        legend="カテゴリ"
        options={categories.map((category) => ({ value: category, label: category }))}
        selectedValues={filters.categories}
        onToggle={(value) =>
          onFiltersChange({ ...filters, categories: toggleValue(filters.categories, value) })
        }
      />

      <FilterGroup
        legend="マイルストーン"
        options={milestoneIds.map((milestoneId) => ({ value: milestoneId, label: milestoneId }))}
        selectedValues={filters.milestoneIds}
        onToggle={(value) =>
          onFiltersChange({ ...filters, milestoneIds: toggleValue(filters.milestoneIds, value) })
        }
      />

      <FilterGroup
        legend="担当者"
        options={assignees.map((assignee) => ({ value: assignee.code, label: assignee.name }))}
        selectedValues={filters.assigneeCodes}
        onToggle={(value) =>
          onFiltersChange({ ...filters, assigneeCodes: toggleValue(filters.assigneeCodes, value) })
        }
      />
    </div>
  );
};
