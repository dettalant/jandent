
/**
 * Jandent初期化時に求められる引数オブジェクト
 */
export interface JandentArgs {
  // 変換対象とみなされる文字の配列まとめ
  chars: TargetChars;
  // 変換時の設定まとめ
  options: JandentOptions;
}

/**
 * Jandentの処理設定を変更するboolean群
 *
 *  Abbreviations - 略語リスト
 *  + punc: punctuation
 *  + exclam: exclamation
 *  + consec: consecutive
 */
export interface JandentOptions {
  // アラビア数字を漢数字に変換する
  isConvertArabicNum: boolean;
  // 行頭字下げを行う
  isInsertLineHeadSpace: boolean;
  // 終わり括弧前の句読点を除去
  isRemovePuncBeforeBrackets: boolean;
  // 単体ダッシュ記号"―"を二つに統一
  isUnifyDoubleDash: boolean;
  // 単体三点リーダ記号"…"を二つに統一
  isUnifyDoubleLeaders: boolean;
  // 連続した句読点のうち、ふたつ目以降を除去
  isRemoveConsecPunc: boolean;
  // 感嘆符・疑問符直後の句読点を除去
  isRemoveExclamAfterPunc: boolean;
  // 感嘆符・疑問符直後に終わり括弧か空白を除く文字があった場合空白を挿入
  isInsertSpaceAfterExclam: boolean;
  // 行末の空白を削除
  isRemoveTrailingSpaces: boolean;
  // 特定の文字列が連続している場合に除去
  // どの文字を判定対象とみなすかはTargetChars.forbidConsecCharsで指定する
  isRemoveConsecSpecificChars: boolean;
  // 半角感嘆符を全角感嘆符に変換する
  isConvertHarfExclam: boolean;
}

/**
 * 変換時の判定対象とする文字を登録する配列まとめオブジェクト
 */
export interface TargetChars {
  replaceStrings: ReplaceStringObj;
  // 連続出現を禁止する文字の配列
  forbidConsecChars: string[];
  // 始め括弧としてみなされる文字の配列
  leftBrackets: string[];
  // 終わり括弧とみなされる文字の配列
  rightBrackets: string[];
  // 句読点とみなされる文字の配列
  puncs: string[];
  // 感嘆符・疑問符とみなされる文字の配列
  exclams: string[];
  // ダッシュ記号とみなされる文字の配列
  dashs: string[];
  // 三点リーダ記号としてみなされる文字の配列
  leaders: string[];
  // 空白としてみなされる文字の配列
  spaces: string[];
  // 処理の中で用いる改行コード
  newline: string;
}

/**
 * 処理中の一時的なステートを格納するオブジェクト
 */
export interface JandentStates {
  // lint処理を行うか否かのbool
  isLint: boolean;
  // 現在処理中行の行番号。非ゼロの整数値。
  lineNumber: number;
}

/**
 * 文字置換に用いる変換対象文字と変換後文字の組み合わせ
 * key側が変換対象文字、value側が変換後文字となる
 */
export interface ReplaceStringObj {
  [s: string]: string;
}

export interface JandentResult {
  type: "convert" | "lint";
  some: string | LintData[];
}

/**
 * lint時に生成する各種lint結果情報
 *
 * lint時はテキスト操作を行わないので、
 * 「テキスト操作に必要なインデックス数値操作を差し引いて」
 * 値を加えることを忘れないように。
 */
export interface LintData {
  // 検出対象が発見された行番号
  line: number;
  // 検出対象が発見された初めの列番号
  columnBegin: number;
  // 検出対象が発見された終わりの列番号
  columnEnd: number;
  // 検出対象となった部分の文字列
  detected: string;
  // どの項目で検出されたか
  kind: string;
}

export interface JandentConvertResult extends JandentResult {
  type: "convert";
  some: string;
}

export interface JandentLintResult extends JandentResult {
  type: "lint";
  some: LintData[];
}
