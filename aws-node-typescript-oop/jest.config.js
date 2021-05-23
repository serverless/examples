const { resolve } = require('path')
const root = resolve(__dirname)

module.exports = {
  rootDir: root,
  testEnvironment: 'node',
  clearMocks: true,
  preset: 'ts-jest',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/test/**/*.test.ts']
}
