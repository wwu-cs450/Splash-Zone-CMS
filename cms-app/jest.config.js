export default {
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {},
  testMatch: ["**/src/tests/**/*.test.js"],
  collectCoverageFrom: [
    "src/api/**/*.js",
    "!src/api/firebaseconfig.js", // Exclude config file from coverage
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
