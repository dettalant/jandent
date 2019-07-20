/**
 * Jandent初期化時に求められる引数オブジェクト
 */
interface JandentInitArgs {
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
interface JandentOptions {
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
}
/**
 * 変換時の判定対象とする文字を登録する配列まとめオブジェクト
 */
interface TargetChars {
    forbidConsecChars: string[];
    leftBrackets: string[];
    rightBrackets: string[];
    puncs: string[];
    exclams: string[];
    dashs: string[];
    leaders: string[];
    spaces: string[];
}
