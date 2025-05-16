const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('node:path');

module.exports = {
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../../../libs/backend/shared'),
      '@features/*': resolve(__dirname, '../../../libs/backend/features/*'),
      '@entities/*': resolve(__dirname, '../../../libs/backend/entities/*'),
    },
  },
  output: {
    path: join(__dirname, 'dist'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
