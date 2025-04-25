const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('node:path');

module.exports = {
  resolve: {
    alias: {
      '@bootstrap': resolve(__dirname, '../../../libs/backend/bootstrap/src'),
      '@interfaces': resolve(__dirname, '../../../libs/backend/interfaces/src'),
      '@guards': resolve(__dirname, '../../../libs/backend/guards/src'),
      '@services': resolve(__dirname, '../../../libs/backend/services/src'),
      '@get-env': resolve(__dirname, '../../../libs/backend/get-env/src'),
      '@decorators': resolve(__dirname, '../../../libs/backend/decorators/src'),
      '@modules': resolve(__dirname, '../../../libs/backend/modules/src'),
      '@controllers': resolve(
        __dirname,
        '../../../libs/backend/controllers/src',
      ),
      '@models': resolve(__dirname, '../../../libs/backend/models/src'),
      '@jwt-utils': resolve(__dirname, '../../../libs/backend/jwt-utils/src'),
      '@configs': resolve(__dirname, '../../../libs/backend/configs/src'),
      '@enums': resolve(__dirname, '../../../libs/backend/enums/src'),
      '@dtos': resolve(__dirname, '../../../libs/backend/dtos/src'),
      '@two-fa-lib': resolve(__dirname, '../../../libs/backend/two-fa-lib/src'),
      '@shared': resolve(__dirname, '../../../libs/backend/shared/src'),
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
