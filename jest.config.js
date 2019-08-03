module.exports = {
  verbose: true,
  transform: {
    ".*\\.(js)$": "babel-jest",
    ".*\\.(ts)$": "ts-jest",
  },
  moduleFileExtensions: ["js", "ts"],
  moduleDirectories: ["node_modules"],
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!convert_arabic_num)"
  ],
  moduleNameMapper: {
    "^#/(.+)": "<rootDir>/src/$1"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(js|tsx?)$"
}
