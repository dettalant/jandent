import { Jandent } from "#/index";

// jandentに関するテスト
describe("jandent", () => {

  const jandent = new Jandent();
  const testText = "テスト1番いっきまーす！どうですかー！？";

  // type guard functions
  // const isConvertResult = (result: JandentResult): result is JandentConvertResult => result.type === "convert" && typeof result.some === "undefined";
  // const isLintResult = (result: JandentResult): result is JandentLintResult => result.type === "lint" && typeof result.some === "undefined";

  it("jandent.convert() has return JandentConvertResult", () => {
    const result = jandent.convert(testText);
    expect(result.type === "convert").toBeTruthy;
  })
})
