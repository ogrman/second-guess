export default {
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [151001]
        }
      },
    ]},
  testEnvironment: 'node',
  testRegex: '.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
