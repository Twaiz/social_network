const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('node:path');

module.exports = {
  resolve: {
    alias: {
      '@bootstrap': resolve(__dirname, '../../../libs/backend/bootstrap/src'),
      '@interfaces': resolve(__dirname, '../../../libs/backend/interfaces/src'),
      '@guards': resolve(__dirname, '../../../libs/backend/guards/src'),
      '@services': resolve(__dirname, '../../../libs/backend/services/src'),
    },
  },
  output: {
    path: join(__dirname, 'dist'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      main: './src/main.ts',
      target: 'node',
      compiler: 'tsc',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
