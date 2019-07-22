import { JandentArgs, JandentOptions, TargetChars } from "./interfaces";
//import { JandentError } from "./error";

/**
 * JandentスクリプトのRoot Classとなるやつ
 */
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

  /**
   * JandentOptionsの初期値を返す
   * @see JandentOptions
   * @return JandentOptionsの初期値
   */
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

  /**
   * TargetCharsの初期値を返す
   * @see TargetChars
   * @return TargetCharsの初期値
   */
  get defaultTargetChars(): TargetChars {
    return {
      // 置換する検索単語と置換単語のobject
      replaceStrings: {},
      // 連続していると二つ目以降が除去される文字
      forbidConsecChars: ["を", "ん", "っ", "ゃ", "ゅ", "ょ"],
      // 始め鉤括弧リスト
      leftBrackets: ["「", "『", "【", "［", "《", "〈"],
      // 終わり鉤括弧のリスト
      rightBrackets: ["」", "』", "】", "］", "》", "〉"],
      // 句読点リスト
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

  /**
   * 半角感嘆符・疑問符を全角感嘆符・疑問符に置換する設定を加える
   * この関数はisConvertHarfExclam設定が無効化されている場合は呼び出されない
   */
  appendHarfExclamReplaceSetting() {
    // 半角感嘆符を全角感嘆符へ、
    // 半角疑問符を全角疑問符にする設定追加
    this.chars.replaceStrings["!"] = "！";
    this.chars.replaceStrings["?"] = "？";
  }
}
