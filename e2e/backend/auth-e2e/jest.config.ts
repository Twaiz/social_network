import * as fs from 'node:fs';

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  fs.readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8'),
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

export default {
  displayName: '@social-network/auth-e2e',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    '^@get-env$': '<rootDir>/../../../libs/backend/get-env/src/index.ts',
  },
  coverageDirectory: 'test-output/jest/coverage',
};
