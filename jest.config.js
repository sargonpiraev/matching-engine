/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: { "^.+\.tsx?$": ["ts-jest",{}] },
  "collectCoverage": true,
  "collectCoverageFrom": ["src/**/*.ts", "!src/**/*.test.ts", "!src/main.ts"],
  "coverageDirectory": "coverage",
  "coverageReporters": ["clover", "json", "lcov", "text", "cobertura"]
};
