import {
  JandentArgs,
  JandentOptions,
  JandentConvertResult,
  JandentLintResult,
  JandentResult,
  TargetChars
} from "./interfaces";
//import { JandentError } from "./error";

/**
 * JandentスクリプトのRoot Classとなるやつ
 */
export class Jandent implements JandentArgs {
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
   * 文字列を受け取って、それを適切な形に整形して返す
   * @param  text 受け取る小説文字列
   * @return      変換した文字列を含んだResult型
   */
  public convert(text: string): JandentConvertResult {
    // TODO: 現状では処理は行わずそのまま返しているので、また処理を実装する
    return {
      type: "convert",
      some: text
    };
  }

  /**
   * 文字列を受け取って、その内容のどこが変換対象であったかを返す
   * @param  text 受け取る小説文字列
   * @return      lint結果を含んだResult型
   */
  public lint(_text: string): JandentLintResult {
    // TODO: 現状では処理は行わず空の配列を返す
    return {
      type: "lint",
      some: []
    }
  }

  /**
   * 文字列を受け取ってその内容を変換し、
   * また変換対象であったリストをまとめて配列として返す。
   *
   * @param  text 受け取る小説文字列
   * @return      [convertResult, lintResult]
   */
  public run(text: string): JandentResult[] {
    const lintResult = this.lint(text);
    const convertResult = this.convert(text);

    return [convertResult, lintResult]
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
