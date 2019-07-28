import { Jandent } from "#/index";
// import { LintData } from "#/interfaces";

// jandentに関するテスト
describe("jandent", () => {

  const jandent = new Jandent();
  const testText = "テスト1番いっきまーす！どうですかー！？";

  // type guard functions
  // const isConvertResult = (result: JandentResult): result is JandentConvertResult => result.type === "convert" && typeof result.some === "undefined";
  // const isLintResult = (result: JandentResult): result is JandentLintResult => result.type === "lint" && typeof result.some === "undefined";

  it("jandent.convert() has return JandentConvertResult", () => {
    const result = jandent.convert(testText);
    expect(result.type === "convert").toBeTruthy();
  });

  it("jandent.lint() has return JandentLintResult", () => {
    const result = jandent.lint(testText);
    expect(result.type === "lint").toBeTruthy();
  });

  it("jandent.unifyDoubleChar() is specific single char convert to double char ", () => {
    const charTestText = "単体ダッシュは―ダブルダッシュに。単体三点リーダは…ダブル三点リーダになる";
    const result = jandent.unifyDoubleChar(charTestText, ["―", "…"])
    expect(result).toBe("単体ダッシュは――ダブルダッシュに。単体三点リーダは……ダブル三点リーダになる");
  });

  it("jandent.insertLineHeadSpace() is append line head space if missing line head space or left bracket.", () => {
    const result = jandent.insertLineHeadSpace(testText);
    expect(result).toBe("　テスト1番いっきまーす！どうですかー！？");
  });

  it("jandent.removeTrailingSpaces() as the name suggests", () => {
    const result = jandent.removeTrailingSpaces(testText + "　　　  　　");
    expect(result).toBe(testText);
  })

  it("jandent.removeConsecSpecificChars() test", () => {
    const charTestText = "テストだょょ。小さいやゆよとか、ををとかが連続すると検出するょ。"
    const result = jandent.removeConsecSpecificChars(charTestText);
    console.log("result: " + result);
  })

  // it("lintData test", () => {
  //   const lintData: LintData[] = [];
  //   jandent.insertLineHeadSpace(testText, lintData);
  //   console.dir(lintData);
  // });
})
