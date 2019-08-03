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

    expect(replaceMap.get("!")).toBeUndefined();
    expect(replaceMap.get("?")).toBeUndefined();
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
    expect(replaceMap.get("５")).toBeUndefined();
  })
})
