import {
  LintData,
  JandentArgs,
  JandentOptions,
  JandentConvertResult,
  JandentLintResult,
  JandentResult,
  JandentStates,
  TargetChars
} from "./interfaces";
import { JandentError } from "./error";

/**
 * JandentスクリプトのRoot Classとなるやつ
 */
export class Jandent implements JandentArgs {
  options: JandentOptions;
  chars: TargetChars;
  // constructor内ではclassに属するgetterを呼び出せないので、
  // 泥臭く初期値を入力
  states: JandentStates = {
    isLint: false,
    lineNumber: 1
  };

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
   * 文字列を受け取って、それを適切な形に整形して返す
   * @param  text 受け取る小説文字列
   * @return      変換した文字列を含んだResult型
   */
  public convert(text: string): JandentConvertResult {
    // jandent statesの初期化
    this.states = this.defaultJandentStates;

    const result = this.process(text);

    if (!this.isConvertResult(result)) {
      throw new JandentError("convert()関数の返り値がJandentConvertResultでない");
    }

    return result;
  }

  /**
   * 文字列を受け取って、その内容のどこが変換対象であったかを返す
   * @param  text 受け取る小説文字列
   * @return      lint結果を含んだResult型
   */
  public lint(text: string): JandentLintResult {
    // jandent statesの初期化
    this.states = this.defaultJandentStates;
    // lint設定を有効にする
    this.states.isLint = true;

    const result = this.process(text);

    if (!this.isLintResult(result)) {
      throw new JandentError("lint()関数の返り値がJandentLintResultでない");
    }

    return result;
  }

  /**
   * メインの処理部分。第二引数のisLintの値に応じて、lintを行うか変換を行うかを変更する
   * isLintがtrueの場合はlint_processへと投げて、falseの場合はconvert_processに投げる
   *
   * @param  text   変換またはlint対象として扱うテキスト
   * @param  isLint lintを行うか否かのbool
   * @return        変換またはlint結果のJandentResult
   */
  process(text: string): JandentResult {
    const resultType = (this.isLint) ? "lint" : "convert";
    const resultSome = (this.isLint) ? this.lintProcess(text) : this.convertProcess(text);

    return {
      type: resultType,
      some: resultSome
    };
  }

  convertProcess(text: string): string {
    let result = "";
    // 正規表現を用いて改行ごとのstring配列として切り分ける
    const textArray = text.split(/\n|\r|\r\n/);
    const textArrayLen = textArray.length;

    for (let i = 0; i < textArrayLen; i++) {
      const line = textArray[i];
      // 変換結果に改行コードを付け足して文字列結合
      result += this.lineConvert(line) + this.chars.newline;
    }

    return result;
  }

  lintProcess(text: string): LintData[] {
    // 正規表現を用いて改行ごとのstring配列として切り分ける
    const textArray = text.split(/\n|\r|\r\n/);
    const textArrayLen = textArray.length;
    const lintData: LintData[] = [];

    for (let i = 0; i < textArrayLen; i++) {
      const line = textArray[i];
      // ループ回数 + 1を行番号として扱う
      this.lineNumber = i + 1;

      // result配列に対して、lineLint結果を破壊的結合
      this.lineLint(line, lintData);
    }

    return lintData;
  }


  lineLint(line: string, lintData: LintData[]) {
    if (this.options.isConvertArabicNum) {
      // アラビア数字を英数字に変換する
    }

    // 行頭字下げを行う
    if (this.options.isInsertLineHeadSpace) {
      this.insertLineHeadSpace(line, lintData);
    }

    if (this.options.isRemovePuncBeforeBrackets) {
      // 終わり括弧前の句読点を除去
    }
    if (this.options.isUnifyDoubleDash) {
      // 単体ダッシュ記号"―"を二つに統一
      this.unifyDoubleChar(line, this.chars.dashs, lintData);
    }

    if (this.options.isUnifyDoubleLeaders) {
      // 単体三点リーダ記号"…"を二つに統一
      this.unifyDoubleChar(line, this.chars.leaders, lintData);
    }

    if (this.options.isRemoveConsecPunc) {
      // 連続した句読点のうち、ふたつ目以降を除去
    }
    if (this.options.isRemoveExclamAfterPunc) {
      // 感嘆符・疑問符直後の句読点を除去
    }
    if (this.options.isInsertSpaceAfterExclam) {
      // 感嘆符直後に終わり括弧を除く文字があった場合空白を挿入
    }
    if (this.options.isRemoveTrailingSpaces) {
      // 行末の空白を削除
    }
    if (this.options.isRemoveConsecSpecificChars) {
      // 特定の文字列が連続している場合に除去
    }

    if (Object.keys(this.chars.replaceStrings).length !== 0) {
      // 置換設定が一つ以上付け足されているならそれを順繰りに処理する
    }

    return [];
  }

  lineConvert(line: string): string {
    if (this.options.isConvertArabicNum) {
      // アラビア数字を英数字に変換する
    }

    // 行頭字下げを行う
    if (this.options.isInsertLineHeadSpace) {
      line = this.insertLineHeadSpace(line);
    }

    if (this.options.isRemovePuncBeforeBrackets) {
      // 終わり括弧前の句読点を除去
    }
    // 単体ダッシュ記号"―"を二つに統一する処理
    if (this.options.isUnifyDoubleDash) {
      line = this.unifyDoubleChar(line, this.chars.dashs);
    }

    if (this.options.isUnifyDoubleLeaders) {
      // 単体三点リーダ記号"…"を二つに統一
      line = this.unifyDoubleChar(line, this.chars.leaders)
    }
    if (this.options.isRemoveConsecPunc) {
      // 連続した句読点のうち、ふたつ目以降を除去
    }
    if (this.options.isRemoveExclamAfterPunc) {
      // 感嘆符・疑問符直後の句読点を除去
    }
    if (this.options.isInsertSpaceAfterExclam) {
      // 感嘆符直後に終わり括弧を除く文字があった場合空白を挿入
    }
    if (this.options.isRemoveConsecSpecificChars) {
      // 特定の文字列が連続している場合に除去
    }

    if (Object.keys(this.chars.replaceStrings).length !== 0) {
      // 置換設定が一つ以上付け足されているならそれを順繰りに処理する
    }

    if (this.options.isRemoveTrailingSpaces) {
      // 最後に行末の空白を削除
      line = this.removeTrailingSpaces(line);
    }

    return line;
  }

  /**
   * 主に外部からJandentOptionsを取得するためのgetter
   * @return インスタンス内のJandentOptions
   */
  public get jandentOptions(): JandentOptions {
    return this.options;
  }

  /**
   * 主に外部からTargetCharsを取得するためのgetter
   * @return インスタンス内のTargetChars
   */
  public get targetChars(): TargetChars {
    return this.chars;
  }

  /**
   * JandentOptionsの初期値を返す
   * @see JandentOptions
   * @return JandentOptionsの初期値
   */
  public get defaultJandentOptions(): JandentOptions {
    return {
      // アラビア数字を英数字に変換する
      isConvertArabicNum: true,
      // 行頭字下げを行う
      isInsertLineHeadSpace: true,
      // 終わり括弧前の句読点を除去
      isRemovePuncBeforeBrackets: true,
      // 単体ダッシュ記号"―"を二つに統一
      isUnifyDoubleDash: true,
      // 単体三点リーダ記号"…"を二つに統一
      isUnifyDoubleLeaders: true,
      // 連続した句読点のうち、ふたつ目以降を除去
      isRemoveConsecPunc: true,
      // 感嘆符・疑問符直後の句読点を除去
      isRemoveExclamAfterPunc: true,
      // 感嘆符直後に終わり括弧を除く文字があった場合空白を挿入
      isInsertSpaceAfterExclam: true,
      // 行末の空白を削除
      isRemoveTrailingSpaces: true,
      // 特定の文字列が連続している場合に除去
      isRemoveConsecSpecificChars: true,
      // 半角感嘆符を全角感嘆符に変換する
      isConvertHarfExclam: true,
    }
  }

  /**
   * TargetCharsの初期値を返す
   * @see TargetChars
   * @return TargetCharsの初期値
   */
  public get defaultTargetChars(): TargetChars {
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
      // 改行コードはunixで用いられるLFをデフォルトとして使用
      newline: "\n",
    }
  }

  /**
   * JandentStatesの初期値を返す。主に処理開始時の初期化に用いる。
   * @return JandentStatesの初期値として想定されるオブジェクト
   */
  public get defaultJandentStates(): JandentStates {
    return {
      isLint: false,
      lineNumber: 1
    }
  }

  /**
   * lint処理を行うか否かのboolを取得する
   *
   * @return lint処理中であるならtrue
   */
  public get isLint(): boolean {
    return this.states.isLint;
  }

  /**
   * 現在処理中行番号を取得する
   * @return JandentStates.lineNumber
   */
  public get lineNumber(): number {
    return this.states.lineNumber;
  }

  /**
   * 現在処理中行番号を変更する
   * この行番号はlint時の行番号表示にのみ用いるので、
   * 非ゼロ整数値であるかわざわざ確認せずとも良いかと処理を手抜き
   *
   * @param  num 非ゼロ整数値であることが望ましい数値
   */
  public set lineNumber(num: number) {
    this.states.lineNumber = num;
  }

  /**
   * 受け取った引数がJandentLintResultであるかのboolを返す関数。type guardとして用いる。
   * @param  result 詳細が不明なJandentResult
   * @return        JandentLintResultであればtrue
   */
  isLintResult(result: JandentResult): result is JandentLintResult {
    return result.type === "lint";
  }

  /**
   * 受け取った引数がJandentConvertResultであるかのboolを返す関数。type guardとして用いる。
   * @param  result 詳細が不明なJandentResult
   * @return        JandentConvertResultであればtrue
   */
  isConvertResult(result: JandentResult): result is JandentConvertResult {
    return result.type === "convert";
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

  /**
   * 行頭字下げが行われておらず、また行頭次の文字が左鉤括弧でない場合に字下げを行う
   * @param  line     行テキスト
   * @param  lintData lint処理時にlint判定結果を追加する配列。省略可。
   * @return          変換後の行テキスト
   */
  insertLineHeadSpace(line: string, lintData: LintData[] | null = null): string {
    const spacesStr = this.chars.spaces.join("");
    const leftBracketsStr = this.chars.leftBrackets.join("");
    // 要するに`/^[^（半角スペース）（全角スペース）「《]/みたいなregexオブジェクトを生成する`
    const regex = new RegExp("^[^" + spacesStr + leftBracketsStr + "]");

    if (regex.test(line)) {
      // マッチする = 字下げが必要な行ならば、行頭字下げを行う
      line = "　" + line;

      if (this.isLint && lintData !== null) {
        // lint結果をlintData配列に追加する
        lintData.push({
          line: this.lineNumber,
          // 行頭字下げがないことに対するものなので、列番号は0固定でOK
          columnBegin: 0,
          columnEnd: 0,
          detected: "",
          kind: "MissingLineHeadSpace"
        })
      }
    }

    return line;
  }

  /**
   * 特定の文字が一つだけ出現している場合に、二つ連続させる形に統一する
   * @param  line     行テキスト
   * @param  chars    判定対象とする文字を入れた配列
   * @param  lintData lint処理時にlint判定結果を追加する配列。省略可。
   * @return          変換後の行テキスト
   */
  unifyDoubleChar(line: string, chars: string[], lintData: LintData[] | null = null): string {
    // chars配列内の文字列を正規表現にしやすい形に結合整形
    const charsStr = chars.join("");

    // 一つ以上の特定文字にマッチする正規表現
    const regex = new RegExp("[" + charsStr + "]+", "g");

    // 二つ以上の特定文字にマッチする正規表現
    const greaterThanTwoRegex = new RegExp("[" + charsStr + "]{2,}", "g");

    // 文字を追加で挿入するべきindex数値を入れる配列
    const insertIdxArray = [];
    // 取得したindex数値部分へ追加する文字の配列
    const insertCharArray = [];

    // regex.exec()で生成されるtmp配列
    let tmpRegexArray;

    // マッチする限りはループを回し続ける
    while (tmpRegexArray = regex.exec(line)) {
      if (!greaterThanTwoRegex.test(tmpRegexArray[0])) {
        // マッチしない = 単一の特定文字

        // 文字列処理に必要な配列を準備する
        insertIdxArray.push(tmpRegexArray.index);
        insertCharArray.push(tmpRegexArray[0]);
      }
    }

    // while中に処理するのは怖いので、
    // 一旦処理するべき箇所を取得してからforループを回す
    const loopLen = insertIdxArray.length;
    for (let i = 0; i < loopLen; i++) {
      // ループごとに一文字ずつダッシュ記号を追加するので、
      // `取得したindex数値 + ループ周回数`で正しい数値が取れるはず
      const idx = insertIdxArray[i] + i;
      // 文字列を二つに切り分けて、その間に追加するべき文字を追加し再結合
      line = line.slice(0, idx) + insertCharArray[i] + line.slice(idx);

      if (this.isLint && lintData !== null) {
        // lint結果をlintData配列に追加する
        lintData.push({
          line: this.lineNumber,
          columnBegin: insertIdxArray[i] - 1,
          columnEnd: insertIdxArray[i],
          detected: insertCharArray[i],
          kind: "SingleUsedSpecificChar"
        })
      }
    }

    return line;
  }

  /**
   * 特定の文字が連続して現れている場合、それを削除する。
   * 特定の文字の指定は`TargetChars.forbidConsecChars`から行う。
   * @param  line     行テキスト
   * @param  lintData lint処理時にlint判定結果を追加する配列。省略可。
   * @return          変換後の行テキスト
   */
  removeConsecSpecificChars(line: string, _lintData: LintData[] | null = null): string {
    const charsStr = this.chars.forbidConsecChars.join("");
    const regex = new RegExp("[" + charsStr + "]{2,}", "g");

    // 文字を追加で挿入するべきindex数値を入れる配列
    const insertIdxArray = [];
    // 取得したindex数値部分へ追加する文字の配列
    const matchCharArray = [];

    // regex.exec()で生成されるtmp配列
    let tmpRegexArray;

    // マッチする限りはループを回し続ける
    while (tmpRegexArray = regex.exec(line)) {
      insertIdxArray.push(tmpRegexArray.index);
      matchCharArray.push(tmpRegexArray[0]);
    }

    const loopLen = insertIdxArray.length;
    for (let i = 0; i < loopLen; i++) {
      console.log(insertIdxArray[i]);
    }

    return line;
  }

  /**
   * 行末の空白を削除する。
   * この処理は小説お作法に関わるものではないので、
   * lint処理は呼び出さない。
   *
   * @param  line 行テキスト
   * @return      変換後の行テキスト
   */
  removeTrailingSpaces(line: string): string {
    const spacesStr = this.chars.spaces.join("");
    const regex = new RegExp("[" + spacesStr  + "]+$");
    if (regex.test(line)) {
      // 行末空白をまとめて削除
      line = line.replace(regex, "");
    }

    return line;
  }
}
