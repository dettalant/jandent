import {
  LintData,
  JandentArgs,
  JandentOptions,
  JandentConvertResult,
  JandentLintResult,
  JandentResult,
  JandentStates,
  TargetChars,
} from "./interfaces";
import { JandentError } from "./error";
import ConvertArabicNum from "convert_arabic_num";

/**
 * JandentスクリプトのRoot Classとなるやつ
 */
export class Jandent implements JandentArgs {
  options: JandentOptions;
  chars: TargetChars;
  convertArabicNum: ConvertArabicNum = new ConvertArabicNum();

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

    const optionsHandler = this.getOptionsHandler();

    // 特定の値が変更された際にcharsも書き換えなければならないので、
    // Proxyを噛ませる
    this.options = new Proxy(initArgs.options, optionsHandler);
    this.chars = initArgs.chars;

    if (this.options.isConvertHarfExclam) {
      this.appendHarfExclamReplaceSetting();
    }

    if (this.options.isConvertArabicNum) {
      this.appendFullNumeralReplaceSetting();
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

    // 処理用stateの初期化
    this.states = this.defaultJandentStates;

    return {
      type: resultType,
      some: resultSome
    };
  }

  convertProcess(text: string): string {
    // 正規表現を用いて改行ごとのstring配列として切り分ける
    const textArray = text.split(/\n|\r|\r\n/);

    let result = "";
    for (let line of textArray) {
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
    // 行頭字下げを行う
    if (this.options.isInsertLineHeadSpace) {
      this.insertLineHeadSpace(line, lintData);
    }

    if (this.options.isRemovePuncBeforeBrackets) {
      // 終わり括弧前の句読点を除去
      this.removeSpecificCharsBeforeChars(line, this.chars.rightBrackets, this.chars.puncs, lintData);
    }

    if (this.options.isUnifyDoubleDash) {
      // 単体ダッシュ記号"―"を二つに統一
      this.unifyDoubleChars(line, this.chars.dashs, lintData);
    }

    if (this.options.isUnifyDoubleLeaders) {
      // 単体三点リーダ記号"…"を二つに統一
      this.unifyDoubleChars(line, this.chars.leaders, lintData);
    }

    if (this.options.isRemoveConsecPunc) {
      // 連続した句読点のうち、ふたつ目以降を除去
      this.removeConsecSpecificChars(line, this.chars.puncs, true, lintData);
    }

    if (this.options.isRemoveExclamAfterPunc) {
      // 感嘆符・疑問符直後の句読点を除去
      this.removeSpecificCharsAfterChars(line, this.chars.exclams, this.chars.puncs, lintData);
    }

    if (this.options.isInsertSpaceAfterExclam) {
      // 感嘆符・疑問符直後に終わり括弧か空白を除く文字があった場合
      // 感嘆符・疑問符直後の句読点処理とかぶるので句読点も除外しておく
      this.insertStrToAfterSpecificChars(
        line,
        // 疑問符・感嘆符を判定
        this.chars.exclams,
        // 全角スペースを挿入
        "　",
        // 終わり鉤括弧 + 空白文字が続く場合は判定除外対象とする
        this.chars.rightBrackets.concat(this.chars.spaces, this.chars.puncs),
        true,
        lintData,
      );
    }

    if (this.options.isRemoveConsecSpecificChars) {
      // 特定の文字列が連続している場合に除去
      this.removeConsecSpecificChars(line, this.chars.forbidConsecChars, false, lintData);
    }

    // lint対象から除外する処理
    // * removeTrailingSpaces()
    // * lineReplace()
    // * convertArabicNum.convert()

    return [];
  }

  lineConvert(line: string): string {
    if (this.chars.replaceMap.size !== 0) {
      // 置換設定が一つ以上付け足されているならそれを順繰りに処理する
      line = this.lineReplace(line);
    }

    if (this.options.isConvertArabicNum) {
      // アラビア数字を英数字に変換する
      line = this.convertArabicNum.convert(line);
    }

    // 行頭字下げを行う
    if (this.options.isInsertLineHeadSpace) {
      line = this.insertLineHeadSpace(line);
    }

    if (this.options.isRemovePuncBeforeBrackets) {
      // 終わり括弧前の句読点を除去
      line = this.removeSpecificCharsBeforeChars(line, this.chars.rightBrackets, this.chars.puncs)
    }
    // 単体ダッシュ記号"―"を二つに統一する処理
    if (this.options.isUnifyDoubleDash) {
      line = this.unifyDoubleChars(line, this.chars.dashs);
    }

    if (this.options.isUnifyDoubleLeaders) {
      // 単体三点リーダ記号"…"を二つに統一
      line = this.unifyDoubleChars(line, this.chars.leaders)
    }
    if (this.options.isRemoveConsecPunc) {
      // 連続した句読点のうち、ふたつ目以降を除去
      line = this.removeConsecSpecificChars(line, this.chars.puncs, true);
    }
    if (this.options.isRemoveExclamAfterPunc) {
      // 感嘆符・疑問符直後の句読点を除去
      line = this.removeSpecificCharsAfterChars(line, this.chars.exclams, this.chars.puncs);
    }
    if (this.options.isInsertSpaceAfterExclam) {
      // 感嘆符・疑問符直後に終わり括弧か空白を除く文字があった場合空白を挿入
      line = this.insertStrToAfterSpecificChars(
        line,
        // 疑問符・感嘆符を判定
        this.chars.exclams,
        // 全角スペースを挿入
        "　",
        // 終わり鉤括弧 + 空白文字が続く場合は判定除外対象とする
        this.chars.rightBrackets.concat(this.chars.spaces),
        true,
      );
    }
    if (this.options.isRemoveConsecSpecificChars) {
      // 特定の文字列が連続している場合に除去
      line = this.removeConsecSpecificChars(line, this.chars.forbidConsecChars, false);
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
      // 感嘆符・疑問符直後に終わり括弧と空白を除く文字があった場合空白を挿入
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
      // 置換する検索単語と置換単語のMap
      replaceMap: new Map(),
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

  public get replaceMap(): Map<string, string> {
    return this.chars.replaceMap;
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
    this.chars.replaceMap.set("!", "！");
    this.chars.replaceMap.set("?", "？");
  }

  /**
   * 半角感嘆符・疑問符書き換え設定を削除する
   * jandent.options内数値の無効化時に呼び出される
   */
  removeHarfExclamReplaceSetting() {
    this.chars.replaceMap.delete("!");
    this.chars.replaceMap.delete("?");
  }

  /**
   * 各種全角数字を半角数字に置換する設定を加える
   * convertArabicNumは全角数字の変換に対応させてないので、
   * isConvertArabicNumがtrueの場合に全角数字を半角数字に変換する
   */
  appendFullNumeralReplaceSetting() {
    // 各種半角数字詰め合わせ配列
    const halfNumArray = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    // 各種全角数字詰め合わせ配列
    const fullNumArray = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];

    // 算用数字は0-9までなので、10回のループでよし
    for (let i = 0; i < 10; i++) {
      // 各種全角数字を半角数字に変換する設定追加
      this.chars.replaceMap.set(fullNumArray[i], halfNumArray[i]);
    }
  }

  /**
   * 各種全角数字書き換え設定を削除する
   * jandent.options内数値の無効化時に呼び出される
   */
  removeFullNumeralReplaceSetting() {
    const fullNumArray = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
    for (let i = 0; i < 10; i++) {
      // 各種全角数字を半角数字に変換する設定追加
      this.chars.replaceMap.delete(fullNumArray[i]);
    }
  }

  getOptionsHandler(): ProxyHandler<JandentOptions> {
    // optionsHandler関数内で、
    // Jandentが持つthisメソッドを呼び出すための苦肉の策
    const that = this;
    return {
      /**
       * `jandent.options`の内容値が変更された際に呼び出され、
       * `jandent.chars`などの他部分に変更を波及させる関数
       * 
       * @param  _obj  変更がなされたobjectへの参照（未使用）
       * @param  prop  変更がなされたプロパティの名称
       * @param  value 新しく追加された値のbool
       * @return       エラーが起きなければtrueを返す
       */
      set(_obj: JandentOptions, prop: string, value: boolean): boolean {
        if (prop === "isConvertHarfExclam" && value) {
          // `options.isConvertHarfExclam = true`がなされれば
          // 半角感嘆符・疑問符置換設定を追加
          that.appendHarfExclamReplaceSetting();
        } else if (prop === "isConvertHarfExclam") {
          // `options.isConvertHarfExclam = false`がなされれば
          // 半角感嘆符・疑問符置換設定を削除
          that.removeHarfExclamReplaceSetting();
        }

        if (prop === "isConvertArabicNum" && value) {
          // `options.isConvertArabicNum = true`がなされれば
          // 全角数字置換設定を追加
          that.appendFullNumeralReplaceSetting();
        } else if (prop === "isConvertArabicNum") {
          that.removeFullNumeralReplaceSetting();
        }

        return true;
      }
    }
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
      // 引数側に手を入れる処理なので、lintを先に行う
      if (this.isLint && lintData !== null) {
        // lint結果をlintData配列に追加する
        lintData.push({
          line: this.lineNumber,
          // 行頭字下げがないことに対するものなので、列番号は0固定でOK
          columnBegin: 0,
          columnEnd: 1,
          detected: line.slice(0, 1),
          kind: "MissingLineHeadSpace"
        })
      }

      // マッチする = 字下げが必要な行ならば、行頭字下げを行う
      line = "　" + line;

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
  unifyDoubleChars(line: string, chars: string[], lintData: LintData[] | null = null): string {
    // chars配列内の文字列を正規表現にしやすい形に結合整形
    const charsStr = chars.join("");

    // 一つ以上の特定文字にマッチする正規表現
    const regex = new RegExp("[" + charsStr + "]+", "g");

    // 二つ以上の特定文字にマッチする正規表現
    const greaterThanTwoRegex = new RegExp("[" + charsStr + "]{2,}", "g");

    // マッチ文字列とマッチ箇所初めindex数値配列を取得する
    // その際にgreaterThanTwoRegexで除外判定を行う
    const [matchStrArray, matchIdxArray] = this.regexMatchAll(line, regex, greaterThanTwoRegex);

    // while中に処理するのは怖いので、
    // 一旦処理するべき箇所を取得してからforループを回す
    const loopLen = matchIdxArray.length;
    for (let i = 0; i < loopLen; i++) {
      const matchBeginIdx = matchIdxArray[i];
      const matchChar = matchStrArray[i];

      // ループごとに一文字ずつダッシュ記号を追加するので、
      // `取得したindex数値 + ループ周回数`で正しい数値が取れるはず
      const idx = matchBeginIdx + i;
      // 文字列を二つに切り分けて、その間に追加するべき文字を追加し再結合
      line = line.slice(0, idx) + matchChar + line.slice(idx);
      if (this.isLint && lintData !== null) {
        // lint結果をlintData配列に追加する
        lintData.push({
          line: this.lineNumber,
          columnBegin: matchBeginIdx,
          // 単一の文字を判定する部分なので、
          // columnEndは常にmatchBeginIdx + 1で出る
          columnEnd: matchBeginIdx + 1,
          detected: matchChar,
          kind: "SingleUsedSpecificChar"
        })
      }
    }

    return line;
  }

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
  removeConsecSpecificChars(line: string, chars: string[], isStrict: boolean, lintData: LintData[] | null = null): string {
    const charsStr = chars.join("");
    // isStrictフラグで判定させる正規表現を変更
    const regex = (isStrict)
      ? new RegExp("[" + charsStr + "]{2,}", "g")
      : new RegExp("([" + charsStr + "])\\1+", "g");

    // マッチ文字列とマッチ箇所初めindex数値配列を取得する
    const [matchStrArray, matchIdxArray] = this.regexMatchAll(line, regex);

    // ループ回数
    const loopLen = matchIdxArray.length;
    // 除外されて無くなった文字数のlength
    let consumeCharLen = 0;
    for (let i = 0; i < loopLen; i++) {
      // 使いやすい変数名で変数束縛
      const matchStr = matchStrArray[i];
      const matchStrLen = matchStr.length;
      // マッチ初めのインデックス数値
      const matchBeginIdx = matchIdxArray[i];

      // 初回ループでは取得インデックス数値をそのまま、
      // 二回目以降のループでは取得インデックスから除外された文字数を引いたものをインデックス数として用いる
      const idx = (i === 0) ? matchBeginIdx : matchBeginIdx - consumeCharLen;

      // マッチ部分を除いた形で切り出して、マッチ部分の一文字目だけを間に入れて文字列結合させる
      line = line.slice(0, idx) + matchStr.slice(0, 1) + line.slice(idx + matchStrLen)

      // 除外した文字列数を足し合わせる
      // 一周回で足し合わせるのは`マッチ文字列数 - 1文字`でよい
      consumeCharLen += matchStrLen - 1;

      if (this.isLint && lintData !== null) {
        // lint結果をlintData配列に追加する
        lintData.push({
          line: this.lineNumber,
          columnBegin: matchBeginIdx,
          columnEnd: matchBeginIdx + matchStrLen,
          detected: matchStr,
          kind: "ConsecutiveSpecificChar"
        })
      }
    }

    return line;
  }

  /**
   * 一つ以上続く特定の文字の後に別の特定文字が来ている場合、
   * 後者の文字を削除する
   * @param  line        行テキスト
   * @param  chars       特定の文字として認識する文字の配列
   * @param  removeChars 削除対象文字として認識する文字の配列
   * @param  _lintData   lint処理時にlint判定結果を追加する配列。省略可。
   * @return             変換後の行テキスト
   */
  removeSpecificCharsAfterChars(line: string, chars: string[], removeChars: string[], lintData: LintData[] | null = null): string {
    const charsStr = chars.join("");
    const removeCharsStr = removeChars.join("");
    const regex = new RegExp("([" + charsStr +"]+)([" + removeCharsStr + "]+)", "g");

    // lint時のみ行われる処理
    if (this.isLint && lintData !== null) {
      // マッチ文字列とマッチ箇所初めindex数値配列を取得する
      const [matchStrArray, matchIdxArray] = this.regexMatchAll(line, regex);
      // ループ回数
      const loopLen = matchIdxArray.length;

      for (let i = 0; i < loopLen; i++) {
        const matchBeginIdx = matchIdxArray[i];
        const matchStr = matchStrArray[i];
        const matchStrLen = matchStr.length;
        // lint結果をlintData配列に追加する
        lintData.push({
          line: this.lineNumber,
          columnBegin: matchBeginIdx,
          columnEnd: matchBeginIdx + matchStrLen,
          detected: matchStr,
          kind: "SpecificCharAfterOtherSpecificChars"
        })
      }
    }

    return line.replace(regex, "$1");
  }

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
  removeSpecificCharsBeforeChars(line: string, chars: string[], removeChars: string[], lintData: LintData[] | null = null): string {
    const charsStr = chars.join("");
    const removeCharsStr = removeChars.join("");
    const regex = new RegExp("([" + removeCharsStr +"]+)([" + charsStr + "]+)", "g");

    // lint時のみ行われる処理
    if (this.isLint && lintData !== null) {

      // マッチ文字列とマッチ箇所初めindex数値配列を取得する
      const [matchStrArray, matchIdxArray] = this.regexMatchAll(line, regex);

      // ループ回数
      const loopLen = matchIdxArray.length;

      for (let i = 0; i < loopLen; i++) {
        const matchBeginIdx = matchIdxArray[i];
        const matchStr = matchStrArray[i];
        const matchStrLen = matchStr.length;
        // lint結果をlintData配列に追加する
        lintData.push({
          line: this.lineNumber,
          columnBegin: matchBeginIdx,
          columnEnd: matchBeginIdx + matchStrLen,
          detected: matchStr,
          kind: "SpecificCharBeforeOtherSpecificChars"
        })
      }
    }

    return line.replace(regex, "$2");
  }

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
  insertStrToAfterSpecificChars(line: string, chars: string[], insertStr: string, excludeChars: string[] = [], isExcludeLineEnd: boolean = false, lintData: LintData[] | null = null) :string {
    // このboolがtrueの場合はexclude処理を行わない
    const isNeverExclude = excludeChars.length === 0;
    const charsStr = chars.join("");
    const excludeCharsStr = excludeChars.join("");

    const includePartStr = (isNeverExclude && isExcludeLineEnd)
      // exclude処理を行わず、なおかつ行末文字を含まない設定の場合
      ? "[" + charsStr + "]+."
      // そうでない場合のデフォルト設定
      : "[" + charsStr + "]+";

    const excludePartStr = (isExcludeLineEnd)
      // isExcludeLineEndが有効な場合は、exclude設定後に任意一文字を取得する
      ? "(?![" + excludeCharsStr + "])."
      : "(?![" + excludeCharsStr + "])";

    // isNeverExclude ? 除外設定なし正規表現 : 除外設定あり正規表現
    // 除外設定は否定先読みを用いて行う
    const regex = (isNeverExclude)
    ? new RegExp(includePartStr, "g")
    : new RegExp(includePartStr + excludePartStr, "g")

    // マッチ文字列とマッチ箇所初めindex数値配列を取得する
    const [matchStrArray, matchIdxArray] = this.regexMatchAll(line, regex);

    // ループ回数
    const loopLen = matchIdxArray.length;
    const insertStrLen = insertStr.length;

    // 整形し出力するための文字列をクローン
    let result = line;

    for (let i = 0; i < loopLen; i++) {
      // isExcludeLineEnd設定が有効な場合は余分な文字列が一文字ついているので、
      // 一文字分少なく計算しておく
      const matchStrLen = (isExcludeLineEnd)
      ? matchStrArray[i].length - 1
      : matchStrArray[i].length;
      const matchBeginIdx = matchIdxArray[i];
      // 愚直に書き換えして書き換えして書き換えしてを繰り返す
      // マッチ時開始インデックス数値 + マッチ対象の文字数 + 挿入文字列文字数 * 周回数
      // 周回数は0から始まるので、一周目では挿入文字列文字数補正はつけない
      const insertIdx = matchBeginIdx + matchStrLen + insertStrLen * i;

      result = result.slice(0, insertIdx) + insertStr + result.slice(insertIdx);

      if (this.isLint && lintData !== null) {
        // lint結果をlintData配列に追加する
        lintData.push({
          line: this.lineNumber,
          columnBegin: matchBeginIdx,
          columnEnd: matchBeginIdx + matchStrArray[i].length,
          detected: matchStrArray[i],
          kind: "SpecificCharAfterDisallowedChar"
        })
      }
    }

    return result;
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
    const spacesStr = this.chars.spaces.join("|");
    const regex = new RegExp("(?:" + spacesStr  + ")+$");
    if (regex.test(line)) {
      // 行末空白をまとめて削除
      line = line.replace(regex, "");
    }

    return line;
  }

  /**
   * 一行テキスト内に対して、replaceStringsに応じた置換を行う
   * @param  line 行テキスト
   * @return      変換後の行テキスト
   */
  lineReplace(line: string): string {
    for (let [key, value] of this.chars.replaceMap) {
      line = line.replace(key, value);
    }

    return line;
  }

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
  regexMatchAll(text: string, regex: RegExp, excludeRegex?: RegExp): [string[], number[]]  {
    // 結果として返す配列
    const strArray = [];
    const idxArray = [];

    // regex.exec()で生成されるtmp配列
    let tmpArray;
    // マッチする限りはループを回し続ける
    while (tmpArray = regex.exec(text)) {
      if (typeof excludeRegex !== "undefined" && excludeRegex.test(tmpArray[0])) {
        // マッチ内容が除外する正規表現ともマッチするなら除外する
        continue;
      }

      // 文字列操作に用いるインデックス数字とマッチした文字列を保管
      idxArray.push(tmpArray.index);
      strArray.push(tmpArray[0]);
    }

    return [strArray, idxArray]
  }
}
