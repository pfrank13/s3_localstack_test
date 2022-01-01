module.exports = {
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  moduleFileExtensions: ["ts", "js", "json"],
  testPathIgnorePatterns: ["<rootDir>/dist/"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  collectCoverageFrom: ["<rootDir>/src/**/*.{js,ts}"],
  reporters: ["default", "jest-junit"],
  testMatch: ["<rootDir>/src/**/*.test.(ts|js)"],
  testEnvironment: "node",
};
