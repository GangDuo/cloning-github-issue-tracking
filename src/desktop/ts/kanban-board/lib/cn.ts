import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// kanban.css側でTailwindのクラスに`tw:`prefixを付与している(kintone標準
// 画面とのクラス名衝突回避のため)ため、tailwind-merge側にも同じprefixを
// 教えないと競合クラスの解決(例: tw:p-2とtw:p-4の重複)が機能しない。
const twMerge = extendTailwindMerge({ prefix: 'tw' });

// clsxで条件付きクラスを組み立て、twMergeで競合するTailwindクラスを
// 後勝ちで解決する。shadcn/ui由来の定番パターン。
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
