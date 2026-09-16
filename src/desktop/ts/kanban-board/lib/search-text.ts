// 詳細(RICH_TEXT)はHTML文字列で保持されているため、タグを除去した
// プレーンテキストに正規化してから部分一致検索の対象にする。
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function matchesSearchText(searchableText: string, query: string): boolean {
  if (query.trim() === '') return true;

  return searchableText.toLowerCase().includes(query.toLowerCase());
}
