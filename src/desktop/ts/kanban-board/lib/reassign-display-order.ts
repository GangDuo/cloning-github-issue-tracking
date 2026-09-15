const DISPLAY_ORDER_STEP = 10;

// 列内並べ替えオーバーレイで確定した順序から、`表示順`を等間隔の整数で
// 振り直す。ドラッグのたびに前後カードの中間値を計算する方式(fractional
// indexing)は、繰り返すほど間隔が狭まり浮動小数点精度に近づく弱点がある
// ため、確定時に対象カード全件をまとめて振り直す方式を採用する。
export function reassignDisplayOrder<T extends { id: string }>(
  orderedItems: T[],
): Array<{ id: string; displayOrder: number }> {
  return orderedItems.map((item, index) => ({
    id: item.id,
    displayOrder: (index + 1) * DISPLAY_ORDER_STEP,
  }));
}
