export declare class ConvertArabicNum {
    mode: ConvertDecimalMode;
    charMode: ConvertCharMode;
    constructor(initArgs?: ConvertArabicNumInitArgs);
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
    convert(text: string): string;
    /**
     * 主に`123456.789`のような数字のみのstringを受け取って、
     * それをsimple modeで変換する変数
     * @param  text 変換元テキスト
     * @return      変換後テキスト
     */
    convert_simple(text: string): string;
    /**
     * 詳細に単位をつけて数字を常用漢字表記の文字列に変換する
     * 数字以外が残った文章が入れられた際の動作は保証しない
     * @param  text 変換元テキスト
     * @return      変換後テキスト
     */
    convert_verbose(text: string): string;
    /**
     * 万以降の単位は付けるが、千、百、十については単位省略
     * また、小数点以下についても単位省略。漢数字を使う記法のなかで一般的な書き方に変換する。
     * @param  text 変換元テキスト
     * @return      変換後テキスト
     */
    convert_moderate(text: string): string;
    /**
     * 算用数字から常用漢字への変換マップ
     * @return 常用漢字変換マップ
     */
    readonly modernCharMap: Map<string, string>;
    /**
     * 古めかしい大字での変換マップ
     * @return 大字変換マップ
     */
    readonly retroCharMap: Map<string, string>;
    readonly verboseUnitsArray: string[];
    /**
     * moderate表示に必要な単位をまとめた配列。
     * ちなみに日本で広く使われている万進方式を採用していますが、
     * 「無量大数」の次には「万」が再び来て、以降無限ループするようにしています。
     *
     * 不可説不可説転まで延々やるのはさすがにやってられなかった。
     *
     * @return 大数の単位配列
     */
    readonly moderateUnitsArray: string[];
    /**
     * 文字列からコンマを除去する
     * @param  text 元テキスト
     * @return      変換後のテキスト
     */
    removeComma(text: string): string;
}
/**
 * 十進法の桁をどういう単位表記で記述するかのモード選択
 *
 * + verbose: 詳細な命数法として単位表示
 * + simple: 数字をそのまま漢数字にするだけで単位はつけない
 * + moderate: 万以上の単位から記述する
 * + dictate: 基本的にverboseと同じだが、ゼロについては「〜〜とんで」と表記する（未実装）
 */
export declare type ConvertDecimalMode = "verbose" | "simple" | "moderate" | "dictate";
/**
 * 漢数字の字体選択
 *
 * + modern: 一般的に用いられる常用漢字で表記
 * + retro: 時代小説のような大字で表記
 */
export declare type ConvertCharMode = "modern" | "retro";
/**
 * convertArabicNumクラスの初期化時引数として取るinterface。
 * 省略可。
 */
export interface ConvertArabicNumInitArgs {
    mode?: ConvertDecimalMode;
    charMode?: ConvertCharMode;
}
