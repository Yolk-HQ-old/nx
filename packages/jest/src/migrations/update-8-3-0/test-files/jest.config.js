module.exports = {
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  resolver: '@yolkai/nx-jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  coverageReporters: ['html']
};
