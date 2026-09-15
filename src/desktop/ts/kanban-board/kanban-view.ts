import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { CustomViewIndexShowEvent } from '../../../shared/kintone-events';
import { KanbanBoardApp } from './kanban-board-app';

const KANBAN_VIEW_NAME = 'カンバンボード';
const ROOT_CLASS_NAME = 'kanban-board-root-mount';

export function mountKanbanBoardIfCustomView(
  event: CustomViewIndexShowEvent,
): CustomViewIndexShowEvent {
  if (event.viewType !== 'custom' || event.viewName !== KANBAN_VIEW_NAME) {
    return event;
  }

  const container = kintone.app.getHeaderSpaceElement();
  // イベントが複数回発火してもReact rootを重複生成しないためのガード。
  if (!container || container.querySelector(`.${ROOT_CLASS_NAME}`)) {
    return event;
  }

  const root = document.createElement('div');
  root.className = ROOT_CLASS_NAME;
  container.appendChild(root);
  createRoot(root).render(createElement(KanbanBoardApp));

  return event;
}

kintone.events.on(['app.record.index.show'], mountKanbanBoardIfCustomView);
