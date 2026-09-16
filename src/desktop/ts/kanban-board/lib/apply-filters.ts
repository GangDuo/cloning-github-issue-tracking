import type { KanbanTask } from './kanban-data-mapper';
import { matchesSearchText } from './search-text';

export interface KanbanFilters {
  searchQuery: string;
  types: string[];
  categories: string[];
  milestoneIds: string[];
  assigneeCodes: string[];
}

export const EMPTY_FILTERS: KanbanFilters = {
  searchQuery: '',
  types: [],
  categories: [],
  milestoneIds: [],
  assigneeCodes: [],
};

export function applyFilters(tasks: KanbanTask[], filters: KanbanFilters): KanbanTask[] {
  return tasks.filter((task) => {
    if (!matchesSearchText(task.searchText, filters.searchQuery)) return false;
    if (filters.types.length > 0 && !filters.types.includes(task.type)) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(task.category)) return false;
    if (
      filters.milestoneIds.length > 0 &&
      (!task.milestoneId || !filters.milestoneIds.includes(task.milestoneId))
    ) {
      return false;
    }
    if (
      filters.assigneeCodes.length > 0 &&
      !task.assignees.some((assignee) => filters.assigneeCodes.includes(assignee.code))
    ) {
      return false;
    }
    return true;
  });
}
