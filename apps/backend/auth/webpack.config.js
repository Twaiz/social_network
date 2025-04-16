const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('node:path');

module.exports = {
  resolve: {
    alias: {
      '@backend-configs': resolve(
        __dirname,
        '../../../libs/backend/backend-configs/src',
      ),
      '@interfaces': resolve(__dirname, '../../../libs/backend/interfaces/src'),
      '@jwt-utils': resolve(__dirname, '../../../libs/backend/jwt-utils/src'),
      '@roles': resolve(__dirname, '../../../libs/backend/roles/src'),
      '@types': resolve(__dirname, '../../../libs/backend/types/src'),
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
