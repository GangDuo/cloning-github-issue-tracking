import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
    'set-row-class-by-status': './src/desktop/ts/set-row-class-by-status.ts',
    'assign-action-on-save': './src/desktop/ts/assign-action-on-save.ts',
    'require-assignee-when-in-progress': './src/desktop/ts/require-assignee-when-in-progress.ts',
    'notify-assignee-required-when-not-started':
      './src/desktop/ts/notify-assignee-required-when-not-started.ts',
  },
  output: {
    path: path.resolve(__dirname, 'src/desktop/js'),
    filename: '[name].js',
    clean: true,
  },
  resolve: { extensions: ['.ts', '.js'] },
  module: {
    // splitChunksは使わない。共有ロジックは各バンドルにインライン化される(現状は小規模なため許容)。
    // 外部ライブラリ依存が増えてバンドルサイズが問題になったら導入を再検討する。
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
  devtool: 'source-map',
};
