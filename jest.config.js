module.exports = {
  verbose: true,
  transform: {
    ".*\\.(ts)$": "ts-jest",
  },
  moduleFileExtensions: ["js", "ts"],
  moduleDirectories: ["node_modules"],
  moduleNameMapper: {
    "^#/(.+)": "<rootDir>/src/$1",
    "^#packages/(.+)": "<rootDir>/packages/$1"
  },
  modulePathIgnorePatterns: ["<rootDir>/packages"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(ts?)$"
}
