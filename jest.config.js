module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
        },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|@react-native|react-native|expo|@expo|expo-crypto|expo-file-system|base64-js)/)',
  ],
  // Skip tests that require full React Native environment
  // (Requires react-native-web or full metro bundler setup)
  // TODO: Re-enable when React Native testing environment is configured
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/components/__tests__/',
    'src/screens/analytics/__tests__/',
    'src/hooks/__tests__/use-confidence-analytics.test.ts',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/types/**'],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 15,
      lines: 15,
      statements: 15,
    },
  },
  testMatch: ['**/__tests__/**/*.(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
