const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('node:path');

module.exports = {
  resolve: {
    alias: {
      '@configs': resolve(__dirname, '../../../libs/backend/configs/src'),
      '@interfaces': resolve(__dirname, '../../../libs/backend/interfaces/src'),
      '@jwt-utils': resolve(__dirname, '../../../libs/backend/jwt-utils/src'),
      '@enums': resolve(__dirname, '../../../libs/backend/enums/src'),
      '@get-env': resolve(__dirname, '../../../libs/backend/get-env/src'),
      '@decorators': resolve(__dirname, '../../../libs/backend/decorators/src'),
      '@guards': resolve(__dirname, '../../../libs/backend/guards/src'),
      '@bootstrap': resolve(__dirname, '../../../libs/backend/bootstrap/src'),
      '@services': resolve(__dirname, '../../../libs/backend/services/src'),
      '@dtos': resolve(__dirname, '../../../libs/backend/dtos/src'),
      '@modules': resolve(__dirname, '../../../libs/backend/modules/src'),
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
