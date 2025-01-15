/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    preset: 'ts-jest',
    testEnvironment: "node",
    transform: {
      "^.+.tsx?$": ["ts-jest",{}],
    },
    testPathIgnorePatterns: ["/dist/", "src/config/test.ts"],
  };