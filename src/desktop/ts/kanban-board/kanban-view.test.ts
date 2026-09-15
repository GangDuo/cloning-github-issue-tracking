import { describe, expect, it, vi } from 'vitest';
import { mountKanbanBoardIfCustomView } from './kanban-view';
import type { CustomViewIndexShowEvent } from '../../../shared/kintone-events';

// このテストではDOM要素の追加/重複防止のガードのみを検証する。
// 実際にKanbanBoardAppをcreateRootでマウントするとReactのコミットが
// 非同期(マイクロタスク以降)に行われ、テストのafterEachでkintoneスタブが
// 破棄された後に描画されてReferenceErrorになるため、react-dom/clientを
// モックしてレンダリング自体は行わない(vi.mockはファイル内でホイストされる)。
vi.mock('react-dom/client', () => ({
  createRoot: () => ({ render: vi.fn() }),
}));

const buildEvent = (overrides: Partial<CustomViewIndexShowEvent>): CustomViewIndexShowEvent => ({
  appId: 76,
  viewId: 1,
  viewName: 'カンバンボード',
  viewType: 'custom',
  records: [],
  offset: 0,
  size: 20,
  ...overrides,
});

describe('mountKanbanBoardIfCustomView', () => {
  it('viewTypeがcustomでない場合は何もしない', () => {
    const container = document.createElement('div');
    vi.mocked(kintone.app.getHeaderSpaceElement).mockReturnValue(container);

    mountKanbanBoardIfCustomView(buildEvent({ viewType: 'list' }));

    expect(container.children).toHaveLength(0);
  });

  it('viewNameが一致しない場合は何もしない', () => {
    const container = document.createElement('div');
    vi.mocked(kintone.app.getHeaderSpaceElement).mockReturnValue(container);

    mountKanbanBoardIfCustomView(buildEvent({ viewName: '別のビュー' }));

    expect(container.children).toHaveLength(0);
  });

  it('条件に一致する場合はcontainer配下にマウント用要素を追加する', () => {
    const container = document.createElement('div');
    vi.mocked(kintone.app.getHeaderSpaceElement).mockReturnValue(container);

    mountKanbanBoardIfCustomView(buildEvent({}));

    expect(container.querySelector('.kanban-board-root-mount')).not.toBeNull();
  });

  it('既にマウント済みの場合は重複してマウントしない', () => {
    const container = document.createElement('div');
    vi.mocked(kintone.app.getHeaderSpaceElement).mockReturnValue(container);

    mountKanbanBoardIfCustomView(buildEvent({}));
    mountKanbanBoardIfCustomView(buildEvent({}));

    expect(container.querySelectorAll('.kanban-board-root-mount')).toHaveLength(1);
  });

  it('headerSpaceElementがnullの場合は何もしない(エラーにならない)', () => {
    vi.mocked(kintone.app.getHeaderSpaceElement).mockReturnValue(null);

    expect(() => mountKanbanBoardIfCustomView(buildEvent({}))).not.toThrow();
  });

  it('eventをそのまま返す', () => {
    const container = document.createElement('div');
    vi.mocked(kintone.app.getHeaderSpaceElement).mockReturnValue(container);
    const event = buildEvent({});

    expect(mountKanbanBoardIfCustomView(event)).toBe(event);
  });
});
