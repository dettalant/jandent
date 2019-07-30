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

  it("jandent.unifyDoubleChars() is specific single char convert to double char ", () => {
    const charTestText = "単体ダッシュは―ダブルダッシュに。単体三点リーダは…ダブル三点リーダになる";
    const result = jandent.unifyDoubleChars(charTestText, ["―", "…"])
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

  it("jandent.removeConsecSpecificChars() disable strict mode test", () => {
    const charTestText = "テストだょょ。小さいやゆよとか、ををとかが連続すると検出するょっ。";
    const result = jandent.removeConsecSpecificChars(charTestText, ["っ", "ょ", "を"], false);
    expect(result).toBe("テストだょ。小さいやゆよとか、をとかが連続すると検出するょっ。");
  })

  it("jandent.removeConsecSpecificChars() enable strict mode test", () => {
    const charTestText = "テストだょょ。小さいやゆよとか、ををとかが連続すると検出するょっ。";
    const result = jandent.removeConsecSpecificChars(charTestText, ["っ", "ょ", "を"], true);
    expect(result).toBe("テストだょ。小さいやゆよとか、をとかが連続すると検出するょ。");
  })

  it("jandent.insertStrToAfterSpecificChars() space exclude test", () => {
    const charTestText = "感嘆符と疑問符！！？の後には？？スペースを挿入するぜ！　すでにスペースが挿入されている場合は挿入しないぜ！";
    const result = jandent.insertStrToAfterSpecificChars(charTestText, ["！", "？"], "　", ["　"]);
    expect(result).toBe("感嘆符と疑問符！！？　の後には？？　スペースを挿入するぜ！　すでにスペースが挿入されている場合は挿入しないぜ！　");
  })

  it("jandent.insertStrToAfterSpecificChars() never exclude test", () => {
    const charTestText = "単純に@特定文字が一つ以上表れた@@後に@@@@文字を追加することも出来ます";
    const result = jandent.insertStrToAfterSpecificChars(charTestText, ["@"], "ok");
    expect(result).toBe("単純に@ok特定文字が一つ以上表れた@@ok後に@@@@ok文字を追加することも出来ます");
  })

  it("jandent.removeSpecificCharsAfterChars() test", () => {
    const charTestText = "感嘆符！。と疑問符？、直後の句読点を削除します。";
    const result = jandent.removeSpecificCharsAfterChars(charTestText, ["！", "？"], ["、", "。"]);
    expect(result).toBe("感嘆符！と疑問符？直後の句読点を削除します。");
  })

  it("jandent.removeSpecificCharsBeforeChars() test", () => {
    const charTestText = "「終わり鉤括弧直前の句読点を削除します。」";
    const result = jandent.removeSpecificCharsBeforeChars(charTestText, ["」"], ["、", "。"]);
    expect(result).toBe("「終わり鉤括弧直前の句読点を削除します」");
  })

  it("jandent.lineReplace() test", () => {
    const charTestText = "初期設定では半角感嘆符!、疑問符?が全角へと変換されます";
    const result = jandent.lineReplace(charTestText);
    expect(result).toBe("初期設定では半角感嘆符！、疑問符？が全角へと変換されます");
  })

  it("jandent.convertArabicNum.convert() simple mode test", () => {
    const includeNumText = "私の戦闘力は530000です";
    const result = jandent.convertArabicNum.convert(includeNumText);
    expect(result).toBe("私の戦闘力は五三〇〇〇〇です");
  })

  // it("lintData test", () => {
  //   const lintData: LintData[] = [];
  //   jandent.insertLineHeadSpace(testText, lintData);
  //   console.dir(lintData);
  // });
})
