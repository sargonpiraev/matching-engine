/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: { "^.+\.tsx?$": ["ts-jest",{}] },
  "collectCoverage": true,
  "collectCoverageFrom": ["src/**/*.ts", "!src/**/*.test.ts", "!src/main.ts"],
  "coverageDirectory": "coverage",
  "reporters": ["default", "jest-junit"],
  "coverageReporters": ["clover", "json", "lcov", "text", "cobertura"]
};
