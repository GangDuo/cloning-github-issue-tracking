import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateAssigneeRequiredNotice } from './notify-assignee-required-when-not-started';

type SavedSavedFields = kintone.types.SavedSavedFields;

const buildRecord = (overrides: Partial<SavedSavedFields>): SavedSavedFields =>
  overrides as SavedSavedFields;

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('updateAssigneeRequiredNotice', () => {
  it('未処理×対応者なしのとき通知を表示する', () => {
    const spaceElement = document.body.appendChild(document.createElement('div'));
    vi.mocked(kintone.app.record.getHeaderMenuSpaceElement).mockReturnValue(spaceElement);

    const record = buildRecord({
      ステータス: { type: 'STATUS', value: '未処理' },
      対応者: { type: 'USER_SELECT', value: [] },
    });

    updateAssigneeRequiredNotice({ record });

    const notice = spaceElement.querySelector('#notify-assignee-required-when-not-started');
    expect(notice?.textContent).toBe('対応者を設定してください。');
    expect(notice?.classList.contains('assignee-required-notice')).toBe(true);
  });

  it('通知不要なケースでは通知テキストが空になる', () => {
    const spaceElement = document.body.appendChild(document.createElement('div'));
    vi.mocked(kintone.app.record.getHeaderMenuSpaceElement).mockReturnValue(spaceElement);

    const record = buildRecord({
      ステータス: { type: 'STATUS', value: '進行中' },
      対応者: { type: 'USER_SELECT', value: [] },
    });

    updateAssigneeRequiredNotice({ record });

    const notice = spaceElement.querySelector('#notify-assignee-required-when-not-started');
    expect(notice?.textContent).toBe('');
    expect(notice?.classList.contains('assignee-required-notice')).toBe(false);
  });

  it('同一spaceElementへの再呼び出しで通知要素が重複作成されない', () => {
    const spaceElement = document.body.appendChild(document.createElement('div'));
    vi.mocked(kintone.app.record.getHeaderMenuSpaceElement).mockReturnValue(spaceElement);

    const record = buildRecord({
      ステータス: { type: 'STATUS', value: '未処理' },
      対応者: { type: 'USER_SELECT', value: [] },
    });

    updateAssigneeRequiredNotice({ record });
    updateAssigneeRequiredNotice({ record });

    expect(
      spaceElement.querySelectorAll('#notify-assignee-required-when-not-started'),
    ).toHaveLength(1);
  });

  it('spaceElementがnullのとき例外を投げずeventを返す', () => {
    vi.mocked(kintone.app.record.getHeaderMenuSpaceElement).mockReturnValue(null);

    const record = buildRecord({
      ステータス: { type: 'STATUS', value: '未処理' },
      対応者: { type: 'USER_SELECT', value: [] },
    });
    const event = { record };

    expect(updateAssigneeRequiredNotice(event)).toBe(event);
  });
});
