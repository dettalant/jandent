/*!
 *   jandent.js
 * See {@link https://github.com/dettalant/jandent}
 *
 * @author dettalant
 * @version v0.1.0
 * @license MIT License
 */
class JandentError {
    constructor(message) {
        this.message = message;
        this.name = "JandentError";
    }
    toString() {
        return this.name + ": " + this.message;
    }
}

/*!
 *   convert_arabic_num.js
 * See {@link https://github.com/dettalant/convert_arabic_num}
 *
 * @author dettalant
 * @version v0.1.0
 * @license MIT License
 */
// アラビア数字から漢数字への変換機能を提供するクラス
class ConvertArabicNum {
    constructor(initArgs) {
        this.mode = "simple";
        this.charMode = "modern";
        if (typeof initArgs === "undefined") {
            return;
        }
        if (typeof initArgs.mode !== "undefined") {
            this.mode = initArgs.mode;
        }
        if (typeof initArgs.charMode !== "undefined") {
            this.charMode = initArgs.charMode;
        }
    }
    /**
     * 受け取ったテキストを算用数字の部分で分けて、
     * 算用数字の場合は現在選択中の変換モードに合わせた処理を行い、
     * テキストを再結合させる
     *
     * NOTE: mode "dictate"部分は現状作成していないので、
     * simpleモードとして処理する
     *
     * @param  text 受け取る元テキスト
     * @return      変換後テキスト
     */
    convert(text) {
        // "123,456.789"といった文字列とマッチする正規表現
        const regex = /((?:[\d]+[\.,]?)+)/g;
        // 数字文字列とそれ以外の文字列の配列として切り分ける
        const strArray = text.split(regex);
        // 変換結果として出力するテキスト
        let result = "";
        for (let str of strArray) {
            const isNumStr = regex.test(str);
            if (!isNumStr) {
                // 非数字文字列の場合は結合して早期終了
                result += str;
                continue;
            }
            // 数字テキストからコンマを除去
            str = this.removeComma(str);
            if (this.mode === "verbose") {
                str = this.convert_verbose(str);
            }
            else if (this.mode === "moderate") {
                str = this.convert_moderate(str);
            }
            else {
                // mode simple
                str = this.convert_simple(str);
            }
            result += str;
        }
        return result;
    }
    /**
     * 主に`123456.789`のような数字のみのstringを受け取って、
     * それをsimple modeで変換する変数
     * @param  text 変換元テキスト
     * @return      変換後テキスト
     */
    convert_simple(text) {
        const replaceMap = (this.charMode === "retro") ? this.retroCharMap : this.modernCharMap;
        for (let [key, value] of replaceMap) {
            // "."のエスケープ
            const matchStr = (key === ".") ? "\." : key;
            const regex = new RegExp("[" + matchStr + "]", "g");
            text = text.replace(regex, value);
        }
        return text;
    }
    /**
     * 詳細に単位をつけて数字を常用漢字表記の文字列に変換する
     * 数字以外が残った文章が入れられた際の動作は保証しない
     * @param  text 変換元テキスト
     * @return      変換後テキスト
     */
    convert_verbose(text) {
        //
        const splitStrArray = text.split(".");
        let result = "";
        // IE非対応スクリプトなのでArray.from()で切り分ける
        const intStrArray = Array.from(splitStrArray[0]);
        const intStrLen = intStrArray.length;
        const moderateUnitsArray = this.moderateUnitsArray;
        const moderateUnitsArrayLen = moderateUnitsArray.length;
        const verboseUnitsArray = this.verboseUnitsArray;
        const verboseUnitsArrayLen = verboseUnitsArray.length;
        for (let i = 0; i < intStrLen; i++) {
            // 後ろからテキストを結合していくので、
            // 最大値から下がっていく反転インデックス数値を生成
            const reverseIdx = (intStrLen - 1) - i;
            let intChar = intStrArray[reverseIdx];
            if (intChar === "0") {
                // その周回での文字が"0"の場合は処理スキップ
                continue;
            }
            const verboseUnitIdx = i % verboseUnitsArrayLen;
            const verboseUnitStr = verboseUnitsArray[verboseUnitIdx];
            const moderateUnitStr = (i !== 0 && verboseUnitIdx === 0)
                // 要するに無量大数までいったら万に戻ってループするようにしている
                ? moderateUnitsArray[Math.floor((i - 4) / 4) % moderateUnitsArrayLen]
                : "";
            if (intChar === "1" && i !== 0 && moderateUnitStr === "") {
                // その周回での文字が"1"であり、ひと桁目の数字ではなく、また万進の単位名がつかない桁なら、
                // 十、百、千のみをつけて一は除外する
                intChar = "";
            }
            // 後ろから結合していく
            result = intChar + verboseUnitStr + moderateUnitStr + result;
        }
        if (splitStrArray.length > 1) {
            // 小数点処理を入れる
            // 中黒を挟んで、小数点以下には同じように長ったらしく単位を付ける
            // TODO: 小数点以下単位つけ処理も付ける
            result += "・" + splitStrArray[1];
        }
        return this.convert_simple(result);
    }
    /**
     * 万以降の単位は付けるが、千、百、十については単位省略
     * また、小数点以下についても単位省略。漢数字を使う記法のなかで一般的な書き方に変換する。
     * @param  text 変換元テキスト
     * @return      変換後テキスト
     */
    convert_moderate(text) {
        const splitStrArray = text.split(".");
        // 変換後テキストを空欄状態で変数束縛
        let result = "";
        const intStr = splitStrArray[0];
        const intStrLen = intStr.length;
        if (intStrLen <= 4) {
            // 四桁以下なら単位をつけず、そのまま処理する
            result += this.convert_simple(intStr);
        }
        else {
            // 五桁以上の場合は単位をつけていく
            // 四文字づつ処理するのが良さそうなので
            // ループ回数は四で割った数字を切り上げたものを使う
            const loopLen = Math.ceil(intStrLen / 4);
            let strEndIdx = intStrLen;
            const unitsArray = this.moderateUnitsArray;
            const unitsArrayLen = unitsArray.length;
            for (let i = 0; i < loopLen; i++) {
                // 後ろから切り出して結合させていく
                const processCharLen = 4;
                // マイナス値にならないよう調整
                const strBeginIdx = (strEndIdx > processCharLen)
                    ? strEndIdx - processCharLen
                    : 0;
                // ループ一周目では単位を付け足さない
                const insertUnitStr = (i !== 0)
                    // もし無量大数以上の数値になったら万に戻して無限ループさせる
                    ? unitsArray[(i - 1) % unitsArrayLen]
                    : "";
                result = text.slice(strBeginIdx, strEndIdx) + insertUnitStr + result;
                // 周回の終わりでstrEndIdxの数値を処理した文字数分だけ引いておく
                strEndIdx -= processCharLen;
            }
        }
        if (splitStrArray.length > 1) {
            // 小数点処理を入れる
            const floatStr = splitStrArray[1];
            // 中黒を挟んで、小数点以下はsimple modeで処理
            // 小数点が二つある数字は入力ミスとして扱い、文字配列2番以降はまるっと無視
            result += "・" + floatStr;
        }
        return this.convert_simple(result);
    }
    /**
     * 算用数字から常用漢字への変換マップ
     * @return 常用漢字変換マップ
     */
    get modernCharMap() {
        return new Map([
            ["1", "一"],
            ["2", "二"],
            ["3", "三"],
            ["4", "四"],
            ["5", "五"],
            ["6", "六"],
            ["7", "七"],
            ["8", "八"],
            ["9", "九"],
            // 0は〇に（難しくない方のゼロ）
            ["0", "〇"],
            // 小数点は中黒にする
            [".", "・"],
        ]);
    }
    /**
     * 古めかしい大字での変換マップ
     * @return 大字変換マップ
     */
    get retroCharMap() {
        return new Map([
            ["1", "壱"],
            ["2", "弐"],
            ["3", "参"],
            ["4", "肆"],
            ["5", "伍"],
            ["6", "陸"],
            ["7", "漆"],
            ["8", "捌"],
            ["9", "玖"],
            // 0は零に
            ["0", "零"],
            // 小数点は中黒にする
            [".", "・"],
            // 十、百、千、万も大字に変換する
            ["十", "拾"],
            ["百", "佰"],
            ["千", "仟"],
            ["万", "萬"],
        ]);
    }
    // verbose表示に必要な単位を配列として取得
    get verboseUnitsArray() {
        return [
            // 配列0番は単位無しとして空欄を指定
            "",
            "十",
            "百",
            "千"
        ];
    }
    /**
     * moderate表示に必要な単位をまとめた配列。
     * ちなみに日本で広く使われている万進方式を採用していますが、
     * 「無量大数」の次には「万」が再び来て、以降無限ループするようにしています。
     *
     * 不可説不可説転まで延々やるのはさすがにやってられなかった。
     *
     * @return 大数の単位配列
     */
    get moderateUnitsArray() {
        return [
            "万",
            "億",
            "兆",
            "京",
            "垓",
            "𥝱",
            "穣",
            "溝",
            "正",
            "載",
            "極",
            "恒河沙",
            "阿僧祇",
            "那由他",
            "不可思議",
            "無量大数",
        ];
    }
    /**
     * 文字列からコンマを除去する
     * @param  text 元テキスト
     * @return      変換後のテキスト
     */
    removeComma(text) {
        const regex = /[,]/g;
        return text.replace(regex, "");
    }
}

/**
 * JandentスクリプトのRoot Classとなるやつ
 */
class Jandent {
    constructor(args) {
        this.convertArabicNum = new ConvertArabicNum();
        // constructor内ではclassに属するgetterを呼び出せないので、
        // 泥臭く初期値を入力
        this.states = {
            isLint: false,
            lineNumber: 1
        };
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
    run(text) {
        const lintResult = this.lint(text);
        const convertResult = this.convert(text);
        return [convertResult, lintResult];
    }
    /**
     * 文字列を受け取って、それを適切な形に整形して返す
     * @param  text 受け取る小説文字列
     * @return      変換した文字列を含んだResult型
     */
    convert(text) {
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
    lint(text) {
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
    process(text) {
        const resultType = (this.isLint) ? "lint" : "convert";
        const resultSome = (this.isLint) ? this.lintProcess(text) : this.convertProcess(text);
        // 処理用stateの初期化
        this.states = this.defaultJandentStates;
        return {
            type: resultType,
            some: resultSome
        };
    }
    convertProcess(text) {
        // 正規表現を用いて改行ごとのstring配列として切り分ける
        const textArray = text.split(/\n|\r|\r\n/);
        let result = "";
        for (let line of textArray) {
            // 変換結果に改行コードを付け足して文字列結合
            result += this.lineConvert(line) + this.chars.newline;
        }
        return result;
    }
    lintProcess(text) {
        // 正規表現を用いて改行ごとのstring配列として切り分ける
        const textArray = text.split(/\n|\r|\r\n/);
        const textArrayLen = textArray.length;
        const lintData = [];
        for (let i = 0; i < textArrayLen; i++) {
            const line = textArray[i];
            // ループ回数 + 1を行番号として扱う
            this.lineNumber = i + 1;
            // result配列に対して、lineLint結果を破壊的結合
            this.lineLint(line, lintData);
        }
        return lintData;
    }
    lineLint(line, lintData) {
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
            this.insertStrToAfterSpecificChars(line, 
            // 疑問符・感嘆符を判定
            this.chars.exclams, 
            // 全角スペースを挿入
            "　", 
            // 終わり鉤括弧 + 空白文字が続く場合は判定除外対象とする
            this.chars.rightBrackets.concat(this.chars.spaces, this.chars.puncs), true, lintData);
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
    lineConvert(line) {
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
            line = this.removeSpecificCharsBeforeChars(line, this.chars.rightBrackets, this.chars.puncs);
        }
        // 単体ダッシュ記号"―"を二つに統一する処理
        if (this.options.isUnifyDoubleDash) {
            line = this.unifyDoubleChars(line, this.chars.dashs);
        }
        if (this.options.isUnifyDoubleLeaders) {
            // 単体三点リーダ記号"…"を二つに統一
            line = this.unifyDoubleChars(line, this.chars.leaders);
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
            line = this.insertStrToAfterSpecificChars(line, 
            // 疑問符・感嘆符を判定
            this.chars.exclams, 
            // 全角スペースを挿入
            "　", 
            // 終わり鉤括弧 + 空白文字が続く場合は判定除外対象とする
            this.chars.rightBrackets.concat(this.chars.spaces), true);
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
    get jandentOptions() {
        return this.options;
    }
    /**
     * 主に外部からTargetCharsを取得するためのgetter
     * @return インスタンス内のTargetChars
     */
    get targetChars() {
        return this.chars;
    }
    /**
     * JandentOptionsの初期値を返す
     * @see JandentOptions
     * @return JandentOptionsの初期値
     */
    get defaultJandentOptions() {
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
        };
    }
    /**
     * TargetCharsの初期値を返す
     * @see TargetChars
     * @return TargetCharsの初期値
     */
    get defaultTargetChars() {
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
        };
    }
    /**
     * JandentStatesの初期値を返す。主に処理開始時の初期化に用いる。
     * @return JandentStatesの初期値として想定されるオブジェクト
     */
    get defaultJandentStates() {
        return {
            isLint: false,
            lineNumber: 1
        };
    }
    /**
     * lint処理を行うか否かのboolを取得する
     *
     * @return lint処理中であるならtrue
     */
    get isLint() {
        return this.states.isLint;
    }
    /**
     * 現在処理中行番号を取得する
     * @return JandentStates.lineNumber
     */
    get lineNumber() {
        return this.states.lineNumber;
    }
    /**
     * 現在処理中行番号を変更する
     * この行番号はlint時の行番号表示にのみ用いるので、
     * 非ゼロ整数値であるかわざわざ確認せずとも良いかと処理を手抜き
     *
     * @param  num 非ゼロ整数値であることが望ましい数値
     */
    set lineNumber(num) {
        this.states.lineNumber = num;
    }
    get replaceMap() {
        return this.chars.replaceMap;
    }
    /**
     * 受け取った引数がJandentLintResultであるかのboolを返す関数。type guardとして用いる。
     * @param  result 詳細が不明なJandentResult
     * @return        JandentLintResultであればtrue
     */
    isLintResult(result) {
        return result.type === "lint";
    }
    /**
     * 受け取った引数がJandentConvertResultであるかのboolを返す関数。type guardとして用いる。
     * @param  result 詳細が不明なJandentResult
     * @return        JandentConvertResultであればtrue
     */
    isConvertResult(result) {
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
    getOptionsHandler() {
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
            set(_obj, prop, value) {
                if (prop === "isConvertHarfExclam" && value) {
                    // `options.isConvertHarfExclam = true`がなされれば
                    // 半角感嘆符・疑問符置換設定を追加
                    that.appendHarfExclamReplaceSetting();
                }
                else if (prop === "isConvertHarfExclam") {
                    // `options.isConvertHarfExclam = false`がなされれば
                    // 半角感嘆符・疑問符置換設定を削除
                    that.removeHarfExclamReplaceSetting();
                }
                if (prop === "isConvertArabicNum" && value) {
                    // `options.isConvertArabicNum = true`がなされれば
                    // 全角数字置換設定を追加
                    that.appendFullNumeralReplaceSetting();
                }
                else if (prop === "isConvertArabicNum") {
                    that.removeFullNumeralReplaceSetting();
                }
                return true;
            }
        };
    }
    /**
     * 行頭字下げが行われておらず、また行頭次の文字が左鉤括弧でない場合に字下げを行う
     * @param  line     行テキスト
     * @param  lintData lint処理時にlint判定結果を追加する配列。省略可。
     * @return          変換後の行テキスト
     */
    insertLineHeadSpace(line, lintData = null) {
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
                });
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
    unifyDoubleChars(line, chars, lintData = null) {
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
                });
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
    removeConsecSpecificChars(line, chars, isStrict, lintData = null) {
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
            line = line.slice(0, idx) + matchStr.slice(0, 1) + line.slice(idx + matchStrLen);
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
                });
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
    removeSpecificCharsAfterChars(line, chars, removeChars, lintData = null) {
        const charsStr = chars.join("");
        const removeCharsStr = removeChars.join("");
        const regex = new RegExp("([" + charsStr + "]+)([" + removeCharsStr + "]+)", "g");
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
                });
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
    removeSpecificCharsBeforeChars(line, chars, removeChars, lintData = null) {
        const charsStr = chars.join("");
        const removeCharsStr = removeChars.join("");
        const regex = new RegExp("([" + removeCharsStr + "]+)([" + charsStr + "]+)", "g");
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
                });
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
    insertStrToAfterSpecificChars(line, chars, insertStr, excludeChars = [], isExcludeLineEnd = false, lintData = null) {
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
            : new RegExp(includePartStr + excludePartStr, "g");
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
                });
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
    removeTrailingSpaces(line) {
        const spacesStr = this.chars.spaces.join("|");
        const regex = new RegExp("(?:" + spacesStr + ")+$");
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
    lineReplace(line) {
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
    regexMatchAll(text, regex, excludeRegex) {
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
        return [strArray, idxArray];
    }
}

export { Jandent };
