// プロセス管理の遷移ルール(状態→状態→アクション名)をコード側にハードコード
// せず、GET /k/v1/app/statusから毎回取得する。kintone管理画面で遷移設定が
// 変わってもコード修正が不要になるようにするため。
interface ProcessManagementAction {
  name: string;
  from: string;
  to: string;
  type: 'PRIMARY' | 'SECONDARY';
}

interface ProcessManagementResponse {
  actions: ProcessManagementAction[];
}

export interface StatusTransitionMap {
  resolveAction(from: string, to: string): string | undefined;
}

export async function fetchStatusTransitions(app: number): Promise<StatusTransitionMap> {
  const response = (await kintone.api(kintone.api.url('/k/v1/app/status', true), 'GET', {
    app,
  })) as ProcessManagementResponse;

  const table = new Map<string, Map<string, string>>();

  // 同じfrom/toの組に対して複数アクションが定義されている場合(例:
  // 「差戻す」と対応者専用の「取消す」)があるため、PRIMARYのみを採用する。
  // SECONDARYは取り消し操作等の特別な目的のアクションであり、カンバンの
  // ドラッグ&ドロップによる通常のステータス変更には用いない。
  for (const action of response.actions) {
    if (action.type !== 'PRIMARY') continue;

    if (!table.has(action.from)) {
      table.set(action.from, new Map());
    }
    table.get(action.from)!.set(action.to, action.name);
  }

  return {
    resolveAction: (from, to) => table.get(from)?.get(to),
  };
}
