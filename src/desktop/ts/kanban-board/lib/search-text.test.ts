import { describe, expect, it } from 'vitest';
import { matchesSearchText, stripHtmlTags } from './search-text';

describe('stripHtmlTags', () => {
  it('HTMLタグを除去してプレーンテキストにする', () => {
    expect(stripHtmlTags('<p>詳細な<b>説明文</b>です</p>')).toBe('詳細な説明文です');
  });

  it('タグがない文字列はそのまま返す', () => {
    expect(stripHtmlTags('プレーンテキスト')).toBe('プレーンテキスト');
  });
});

describe('matchesSearchText', () => {
  it('部分一致すればtrueを返す', () => {
    expect(matchesSearchText('ログイン画面の不具合修正', 'ログイン')).toBe(true);
  });

  it('大文字小文字を区別しない', () => {
    expect(matchesSearchText('API連携のバグ', 'api')).toBe(true);
  });

  it('一致しなければfalseを返す', () => {
    expect(matchesSearchText('ログイン画面の不具合修正', '決済')).toBe(false);
  });

  it('検索文字列が空のときは常にtrueを返す', () => {
    expect(matchesSearchText('何でも', '')).toBe(true);
    expect(matchesSearchText('何でも', '   ')).toBe(true);
  });
});
