/**
 * Jandent初期化時に求められる引数オブジェクト
 */
export interface JandentArgs {
    chars: TargetChars;
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
    isConvertArabicNum: boolean;
    isInsertLineHeadSpace: boolean;
    isRemovePuncBeforeBrackets: boolean;
    isUnifyDoubleDash: boolean;
    isUnifyDoubleLeaders: boolean;
    isRemoveConsecPunc: boolean;
    isRemoveExclamAfterPunc: boolean;
    isInsertSpaceAfterExclam: boolean;
    isRemoveTrailingSpaces: boolean;
    isRemoveConsecSpecificChars: boolean;
    isConvertHarfExclam: boolean;
}
/**
 * 変換時の判定対象とする文字を登録する配列まとめオブジェクト
 */
export interface TargetChars {
    replaceMap: Map<string, string>;
    forbidConsecChars: string[];
    leftBrackets: string[];
    rightBrackets: string[];
    puncs: string[];
    exclams: string[];
    dashs: string[];
    leaders: string[];
    spaces: string[];
    newline: string;
}
/**
 * 処理中の一時的なステートを格納するオブジェクト
 */
export interface JandentStates {
    isLint: boolean;
    lineNumber: number;
}
/**
* lint時に生成する各種lint結果情報
*
* lint時はテキスト操作を行わないので、
* 「テキスト操作に必要なインデックス数値操作を差し引いて」
* 値を加えることを忘れないように。
*/
export interface LintData {
    line: number;
    columnBegin: number;
    columnEnd: number;
    detected: string;
    kind: string;
}
/**
 * convert()とlint()で共有する型判定が曖昧なinterface
 * 使用時にはJandentConvertResultかJandentLintResultのどちらかとして使う
 */
export interface JandentResult {
    type: "convert" | "lint";
    some: string | LintData[];
}
/**
 * convert()が返すconvert結果のinterface
 */
export interface JandentConvertResult extends JandentResult {
    type: "convert";
    some: string;
}
/**
 * lint()が返すlint結果のinterface
 */
export interface JandentLintResult extends JandentResult {
    type: "lint";
    some: LintData[];
}
