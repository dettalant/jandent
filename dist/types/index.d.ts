import { LintData, JandentArgs, JandentOptions, JandentConvertResult, JandentLintResult, JandentResult, JandentStates, TargetChars } from "./interfaces";
import ConvertArabicNum from "convert_arabic_num";
/**
 * JandentスクリプトのRoot Classとなるやつ
 */
export declare class Jandent implements JandentArgs {
    options: JandentOptions;
    chars: TargetChars;
    convertArabicNum: ConvertArabicNum;
    states: JandentStates;
    constructor(args?: JandentArgs);
    /**
     * 文字列を受け取ってその内容を変換し、
     * また変換対象であったリストをまとめて配列として返す。
     *
     * @param  text 受け取る小説文字列
     * @return      [convertResult, lintResult]
     */
    run(text: string): JandentResult[];
    /**
     * 文字列を受け取って、それを適切な形に整形して返す
     * @param  text 受け取る小説文字列
     * @return      変換した文字列を含んだResult型
     */
    convert(text: string): JandentConvertResult;
    /**
     * 文字列を受け取って、その内容のどこが変換対象であったかを返す
     * @param  text 受け取る小説文字列
     * @return      lint結果を含んだResult型
     */
    lint(text: string): JandentLintResult;
    /**
     * メインの処理部分。第二引数のisLintの値に応じて、lintを行うか変換を行うかを変更する
     * isLintがtrueの場合はlint_processへと投げて、falseの場合はconvert_processに投げる
     *
     * @param  text   変換またはlint対象として扱うテキスト
     * @param  isLint lintを行うか否かのbool
     * @return        変換またはlint結果のJandentResult
     */
    process(text: string): JandentResult;
    convertProcess(text: string): string;
    lintProcess(text: string): LintData[];
    lineLint(line: string, lintData: LintData[]): never[];
    lineConvert(line: string): string;
    /**
     * 主に外部からJandentOptionsを取得するためのgetter
     * @return インスタンス内のJandentOptions
     */
    readonly jandentOptions: JandentOptions;
    /**
     * 主に外部からTargetCharsを取得するためのgetter
     * @return インスタンス内のTargetChars
     */
    readonly targetChars: TargetChars;
    /**
     * JandentOptionsの初期値を返す
     * @see JandentOptions
     * @return JandentOptionsの初期値
     */
    readonly defaultJandentOptions: JandentOptions;
    /**
     * TargetCharsの初期値を返す
     * @see TargetChars
     * @return TargetCharsの初期値
     */
    readonly defaultTargetChars: TargetChars;
    /**
     * JandentStatesの初期値を返す。主に処理開始時の初期化に用いる。
     * @return JandentStatesの初期値として想定されるオブジェクト
     */
    readonly defaultJandentStates: JandentStates;
    /**
     * lint処理を行うか否かのboolを取得する
     *
     * @return lint処理中であるならtrue
     */
    readonly isLint: boolean;
    /**
     * 現在処理中行番号を取得する
     * @return JandentStates.lineNumber
     */
    /**
    * 現在処理中行番号を変更する
    * この行番号はlint時の行番号表示にのみ用いるので、
    * 非ゼロ整数値であるかわざわざ確認せずとも良いかと処理を手抜き
    *
    * @param  num 非ゼロ整数値であることが望ましい数値
    */
    lineNumber: number;
    readonly replaceMap: Map<string, string>;
    /**
     * 受け取った引数がJandentLintResultであるかのboolを返す関数。type guardとして用いる。
     * @param  result 詳細が不明なJandentResult
     * @return        JandentLintResultであればtrue
     */
    isLintResult(result: JandentResult): result is JandentLintResult;
    /**
     * 受け取った引数がJandentConvertResultであるかのboolを返す関数。type guardとして用いる。
     * @param  result 詳細が不明なJandentResult
     * @return        JandentConvertResultであればtrue
     */
    isConvertResult(result: JandentResult): result is JandentConvertResult;
    /**
     * 半角感嘆符・疑問符を全角感嘆符・疑問符に置換する設定を加える
     * この関数はisConvertHarfExclam設定が無効化されている場合は呼び出されない
     */
    appendHarfExclamReplaceSetting(): void;
    /**
     * 各種全角数字を半角数字に置換する設定を加える
     * convertArabicNumは全角数字の変換に対応させてないので、
     * isConvertArabicNumがtrueの場合に全角数字を半角数字に変換する
     */
    appendFullNumeralReplaceSetting(): void;
    /**
     * 行頭字下げが行われておらず、また行頭次の文字が左鉤括弧でない場合に字下げを行う
     * @param  line     行テキスト
     * @param  lintData lint処理時にlint判定結果を追加する配列。省略可。
     * @return          変換後の行テキスト
     */
    insertLineHeadSpace(line: string, lintData?: LintData[] | null): string;
    /**
     * 特定の文字が一つだけ出現している場合に、二つ連続させる形に統一する
     * @param  line     行テキスト
     * @param  chars    判定対象とする文字を入れた配列
     * @param  lintData lint処理時にlint判定結果を追加する配列。省略可。
     * @return          変換後の行テキスト
     */
    unifyDoubleChars(line: string, chars: string[], lintData?: LintData[] | null): string;
    /**
     * 特定の文字が連続して現れている場合、それを削除する。
     * isStrictフラグがfalseの場合は、「単一のマッチ対象文字」の連続を除外する。
     * isStrictフラグがtrueの場合は、「マッチ対象文字同士」の連続であっても除外判定とする。
     *
     * @param  line     行テキスト
     * @param  chars    特定の文字として認識する文字の配列
     * @param  lintData lint処理時にlint判定結果を追加する配列。省略可。
     * @return          変換後の行テキスト
     */
    removeConsecSpecificChars(line: string, chars: string[], isStrict: boolean, lintData?: LintData[] | null): string;
    /**
     * 一つ以上続く特定の文字の後に別の特定文字が来ている場合、
     * 後者の文字を削除する
     * @param  line        行テキスト
     * @param  chars       特定の文字として認識する文字の配列
     * @param  removeChars 削除対象文字として認識する文字の配列
     * @param  _lintData   lint処理時にlint判定結果を追加する配列。省略可。
     * @return             変換後の行テキスト
     */
    removeSpecificCharsAfterChars(line: string, chars: string[], removeChars: string[], lintData?: LintData[] | null): string;
    /**
     * 一つ以上続く特定の文字直前に別の特定文字が存在する場合、
     * 前者の文字を削除する
     *
     * 処理内容はほぼremoveSpecificCharsAfterChars()のコンパチ
     *
     * @param  line        行テキスト
     * @param  chars       特定の文字として認識する文字の配列
     * @param  removeChars 削除対象文字として認識する文字の配列
     * @param  _lintData   lint処理時にlint判定結果を追加する配列。省略可。
     * @return             変換後の行テキスト
     */
    removeSpecificCharsBeforeChars(line: string, chars: string[], removeChars: string[], lintData?: LintData[] | null): string;
    /**
     * 特定の文字の後ろへと、insertStrで指定した文字列を挿入する。
     * excludeCharsを指定している場合は、
     * 「chars文字の後にexcludeChars文字が来る」場合には文字列を挿入しない。
     *
     * @param  line             行テキスト
     * @param  chars            特定の文字として認識する文字の配列
     * @param  insertStr        条件を満たしたら挿入される文字列
     * @param  excludeChars     chars文字の次にこれらが続く場合は文字列を挿入しない文字配列。省略可。
     * @param  isExcludeLineEnd trueでいて行末に対象文字がある場合は処理しない
     * @param  lintData         lint処理時にlint判定結果を追加する配列。省略可。
     * @return                  変換後の行テキスト
     */
    insertStrToAfterSpecificChars(line: string, chars: string[], insertStr: string, excludeChars?: string[], isExcludeLineEnd?: boolean, lintData?: LintData[] | null): string;
    /**
     * 行末の空白を削除する。
     * この処理は小説お作法に関わるものではないので、
     * lint処理は呼び出さない。
     *
     * @param  line 行テキスト
     * @return      変換後の行テキスト
     */
    removeTrailingSpaces(line: string): string;
    /**
     * 一行テキスト内に対して、replaceStringsに応じた置換を行う
     * @param  line 行テキスト
     * @return      変換後の行テキスト
     */
    lineReplace(line: string): string;
    /**
     * 文字列と判定用正規表現を引数に取り、
     * マッチした文字の配列とマッチ箇所初めのindex数値の配列を返す
     *
     * whileを使った処理は何回書いても危なっかしく感じるので、
     * この箇所は関数に入れて最低限の触り方にする。
     *
     * @param  line          元の文字列
     * @param  regex         判定基準となる正規表現
     * @param  excludeRegex  除外判定として用いる正規表現。省略可。
     * @return       [マッチ文字列配列, マッチindex数値配列]
     */
    regexMatchAll(text: string, regex: RegExp, excludeRegex?: RegExp): [string[], number[]];
}
