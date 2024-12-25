export declare const CryptoUtils: {
    randomString(length?: number, options?: true | string | {
        numbers?: boolean | string;
        letters?: boolean | string;
        specials?: boolean | string;
    }): string;
    md5(bytes: string | number[] | ArrayBuffer | Uint8Array, encoding?: string): string;
    sha256(bytes: string | number[] | ArrayBuffer | Uint8Array, encoding?: string): string;
    uuid(options?: {
        version?: string;
        removeDash?: boolean;
        lowerCase?: boolean;
    }): string;
};
