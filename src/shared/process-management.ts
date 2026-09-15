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

const transitionKey = (from: string, to: string): string => `${from}→${to}`;

export async function fetchStatusTransitions(app: number): Promise<StatusTransitionMap> {
  const response = (await kintone.api(kintone.api.url('/k/v1/app/status', true), 'GET', {
    app,
  })) as ProcessManagementResponse;

  // "from→to"を複合キーにした単一Mapで表現する。同じfrom/toの組に対して
  // 複数アクションが定義されている場合(例: 「差戻す」と対応者専用の
  // 「取消す」)があるため、PRIMARYのみを採用する。SECONDARYは取り消し
  // 操作等の特別な目的のアクションであり、カンバンのドラッグ&ドロップに
  // よる通常のステータス変更には用いない。
  const table = new Map(
    response.actions
      .filter((action) => action.type === 'PRIMARY')
      .map((action) => [transitionKey(action.from, action.to), action.name]),
  );

  return {
    resolveAction: (from, to) => table.get(transitionKey(from, to)),
  };
}
