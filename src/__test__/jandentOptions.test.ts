import { Jandent } from "#/index";
import { JandentArgs } from "#/interfaces";

// JandentOptionsに関するテスト
describe("jandentOptions", () => {

  const defaultSettingJandent = new Jandent();

  it("default jandent replaceStrings has harf exclamation key", () => {
    const replaceStrings = defaultSettingJandent.chars.replaceStrings;
    expect(replaceStrings["!"]).toBe("！");
    expect(replaceStrings["?"]).toBe("？");
  })

  it("if disabled isConvertHarfExclam setting, replaceStrings haven't got harf exclamation key", () => {
    const customInitArg: JandentArgs = ({
      options: {
        isConvertHarfExclam: false
      }
    } as JandentArgs);

    const jandent = new Jandent(customInitArg);
    const replaceStrings = jandent.chars.replaceStrings;

    expect(replaceStrings["!"]).toBeUndefined();
    expect(replaceStrings["?"]).toBeUndefined();
  })
})
