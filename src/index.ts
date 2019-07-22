import { JandentArgs, JandentOptions, TargetChars } from "./interfaces";
//import { JandentError } from "./error";

export class Jandent {
  options: JandentOptions;
  chars: TargetChars;

  constructor(args?: JandentArgs) {
    const initArgs = {
      options: this.defaultJandentOptions,
      chars: this.defaultTargetChars,
    };

    if (typeof args !== "undefined") {
      // 必要最低限の設定だけで動くように
      // Object.assign処理を分ける
      if (typeof args.options !== "undefined") {
        Object.assign(initArgs.options, args.options);
      }

      if (typeof args.chars !== "undefined") {
        // 引数があればデフォルト設定に上書き
        Object.assign(initArgs.chars, args.chars);
      }
    }

    this.options = initArgs.options;
    this.chars = initArgs.chars;

    if (this.options.isConvertHarfExclam) {
      this.appendHarfExclamReplaceSetting();
    }
  }

  get defaultJandentOptions(): JandentOptions {
    return {
      isConvertArabicNum: true,
      isInsertLineHeadSpace: true,
      isRemovePuncBeforeBrackets: true,
      isUnifyDoubleDash: true,
      isUnifyDoubleLeaders: true,
      isRemoveConsecPunc: true,
      isRemoveExclamAfterPunc: true,
      isInsertSpaceAfterExclam: true,
      isRemoveTrailingSpaces: true,
      isRemoveConsecSpecificChars: true,
      isConvertHarfExclam: true,
    }
  }

  get defaultTargetChars(): TargetChars {
    return {
      replaceStrings: {},
      forbidConsecChars: ["を", "ん", "っ", "ゃ", "ゅ", "ょ"],
      leftBrackets: ["「", "『", "【", "［", "《", "〈"],
      rightBrackets: ["」", "』", "】", "］", "》", "〉"],
      // 句読点ってこの他にもあったっけ？
      puncs: ["、", "。"],
      // 全角ビックリマークと全角はてなマーク
      exclams: ["！", "？"],
      // ダッシュ記号
      dashs: ["―"],
      // 三点リーダと二点リーダ
      leaders: ["…", "‥"],
      // 半角スペースと全角スペース
      spaces: [" ", "　"],
    }
  }

  appendHarfExclamReplaceSetting() {
    // 半角感嘆符を全角感嘆符へ、
    // 半角疑問符を全角疑問符にする設定追加
    this.chars.replaceStrings["!"] = "！";
    this.chars.replaceStrings["?"] = "？";
  }
}
