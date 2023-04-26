export declare class CryptoUtils {
    private static chars;
    static randomString(length?: number, options?: true | string | {
        numbers?: boolean | string;
        letters?: boolean | string;
        specials?: boolean | string;
    }): string;
    static md5(bytes: any, encoding?: any): string;
    static sha256(bytes: any, encoding?: any): string;
    static uuid(version?: string, options?: {
        removeDash?: boolean;
        lowerCase?: boolean;
    }): string;
}
