export declare class ObjectUtils {
    static objectToString(o: any): any;
    static hasOwn(obj: any, key: any): any;
    static isArray(arg: any): boolean;
    static isBoolean(arg: any): boolean;
    static isNull(arg: any): boolean;
    static isNullOrUndefined(arg: any): boolean;
    static isNumber(arg: any): boolean;
    static isInt(value: any): boolean;
    static isString(arg: any): boolean;
    static isSymbol(arg: any): boolean;
    static isUndefined(arg: any): boolean;
    static isRegExp(re: any): boolean;
    static isObject(arg: any): boolean;
    static isTrueObject(obj: any): boolean;
    static isDate(d: any): boolean;
    static isError(e: any): boolean;
    static isFunction(arg: any): boolean;
    static isAsyncFcuntion(fn: any): boolean;
    static isPrimitive(arg: any): boolean;
    static isBuffer(arg: any): boolean;
    static promisify(fn: any, receiver: any): (...args: any) => Promise<unknown>;
    static extend(target?: {}, ...args: any): {};
    static isTrueEmpty(obj: any): boolean;
    static isEmpty(obj: any): boolean;
    static defer(): any;
    static omit(obj: any, props: any[] | string): {};
}
