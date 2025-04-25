const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('node:path');

module.exports = {
  resolve: {
    alias: {
      '@bootstrap': resolve(__dirname, '../../../libs/backend/bootstrap/src'),
      '@configs': resolve(__dirname, '../../../libs/backend/configs/src'),
      '@get-env': resolve(__dirname, '../../../libs/backend/get-env/src'),
      '@models': resolve(__dirname, '../../../libs/backend/models/src'),
      '@shared': resolve(__dirname, '../../../libs/backend/shared/src'),
      '@two-fa-lib': resolve(__dirname, '../../../libs/backend/two-fa-lib/src'),
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
