const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('node:path');

module.exports = {
  resolve: {
    alias: {
      '@backend-configs': resolve(
        __dirname,
        '../../../libs/backend/backend-configs/src',
      ),
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
