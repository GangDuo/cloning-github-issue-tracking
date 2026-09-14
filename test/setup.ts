import { vi, beforeEach, afterEach } from 'vitest';

// jsdom環境には`kintone`グローバルが存在しないため、importするだけで
// kintone.events.on(...)がReferenceErrorで落ちるのを防ぐための最小スタブ。
function createKintoneStub() {
  const api = vi.fn() as unknown as { (...args: unknown[]): unknown; url: ReturnType<typeof vi.fn> };
  api.url = vi.fn((path: string) => path);

  return {
    events: { on: vi.fn() },
    app: {
      getId: vi.fn(() => 76),
      record: { getHeaderMenuSpaceElement: vi.fn(() => null) },
      getFieldElements: vi.fn(() => [])
    },
    mobile: {
      app: {
        getId: vi.fn(() => undefined),
        getFieldElements: vi.fn(() => [])
      }
    },
    api
  };
}

beforeEach(() => {
  vi.stubGlobal('kintone', createKintoneStub());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
