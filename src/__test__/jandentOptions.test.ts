import { Jandent } from "../index";
import { JandentArgs } from "../interfaces";

// JandentOptionsに関するテスト
describe("jandentOptions", () => {

  const defaultSettingJandent = new Jandent();

  it("default jandent replaceMap has exclamations value", () => {
    const replaceMap = defaultSettingJandent.chars.replaceMap;
    expect(replaceMap.get("!")).toBe("！");
    expect(replaceMap.get("?")).toBe("？");
  })

  it("if disabled isConvertHarfExclam setting, replaceMap haven't got harf exclamation key", () => {
    const customInitArg: JandentArgs = ({
      options: {
        isConvertHarfExclam: false
      }
    } as JandentArgs);

    const jandent = new Jandent(customInitArg);
    const replaceMap = jandent.chars.replaceMap;

    expect(replaceMap.has("!")).toBeFalsy();
    expect(replaceMap.has("?")).toBeFalsy();
  })

  it("default jandent replaceMap has numeral value", () => {
    const replaceMap = defaultSettingJandent.chars.replaceMap;
    expect(replaceMap.get("０")).toBe("0");
    expect(replaceMap.get("７")).toBe("7");
  })

  it("if disabled isConvertArabicNum setting, replaceMap haven't got full numeral key", () => {
    const customInitArg: JandentArgs = ({
      options: {
        isConvertArabicNum: false
      }
    } as JandentArgs);

    const jandent = new Jandent(customInitArg);
    const replaceMap = jandent.chars.replaceMap;
    expect(replaceMap.has("５")).toBeFalsy();
  })

  it("if toggle isConvertArabicNum or isConvertHarfExclam options, replaceMap value must be switch", () => {
    const jandent = new Jandent();
    const replaceMap = jandent.chars.replaceMap;
    expect(replaceMap.get("０")).toBe("0");
    expect(replaceMap.get("?")).toBe("？");

    // isConvertArabicNum test
    jandent.options.isConvertArabicNum = false;
    expect(replaceMap.has("０")).toBeFalsy();
    expect(jandent.options.isConvertArabicNum).toBeFalsy();
    jandent.options.isConvertArabicNum = true;
    expect(replaceMap.get("０")).toBe("0");
    expect(jandent.options.isConvertArabicNum).toBeTruthy();

    // isConvertHarfExclam test
    jandent.options.isConvertHarfExclam = false;
    expect(replaceMap.has("?")).toBeFalsy();
    expect(jandent.options.isConvertHarfExclam).toBeFalsy();
    jandent.options.isConvertHarfExclam = true;
    expect(replaceMap.get("?")).toBe("？");
    expect(jandent.options.isConvertHarfExclam).toBeTruthy();
  })
})
