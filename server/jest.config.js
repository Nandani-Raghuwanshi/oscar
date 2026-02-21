export default {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: ['**/tests/**/*.test.js'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js',
    ],
    moduleFileExtensions: ['js', 'json'],
    transform: {},
    testTimeout: 30000,
    verbose: true,
};
