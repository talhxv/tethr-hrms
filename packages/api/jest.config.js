/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  setupFiles: ['reflect-metadata'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/modules/$1',
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@hrms/shared$': '<rootDir>/../shared/src/index.ts',
  },
};
