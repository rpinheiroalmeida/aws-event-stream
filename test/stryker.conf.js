module.exports = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    config: require('./jest.config-unit.js'),
    enableFindRelatedTests: true,
  },
  coverageAnalysis: 'off',
  tsconfigFile: 'tsconfig-stryker.json',
  mutate: ['src/**/*.ts'],
  thresholds: { break: 65 },
  timeoutMS: 35000
};
