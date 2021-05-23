const config = require('./jest.config')

config.displayName = 'unit-tests'
config.testMatch = ['<rootDir>/src/**/*.test.ts']

module.exports = config
