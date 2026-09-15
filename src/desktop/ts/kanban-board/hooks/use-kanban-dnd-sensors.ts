import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

// メインボード(kanban.tsx)と列内並べ替えオーバーレイ(column-reorder-
// overlay.tsx)の両方で同じセンサー構成(マウス/タッチ/キーボード)を
// 使うため、設定漏れを防ぐ共通フックとして切り出す。
export function useKanbanDndSensors() {
  return useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor));
}
