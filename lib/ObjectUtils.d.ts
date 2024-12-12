export declare class ObjectUtils {
    static objectToString(o: any): any;
    static hasOwn(obj: any, key: any): any;
    static isArray(arg: any): boolean;
    static isBoolean(arg: any): arg is boolean;
    static isNull(arg: any): boolean;
    static isNullOrUndefined(arg: any): boolean;
    static isNumber(arg: any): arg is number;
    static isInt(value: any): boolean;
    static isString(arg: any): arg is string;
    static isSymbol(arg: any): arg is symbol;
    static isUndefined(arg: any): boolean;
    static isRegExp(re: any): boolean;
    static isObject(arg: any): boolean;
    static isTrueObject(obj: any): boolean;
    static isDate(d: any): boolean;
    static isError(e: any): boolean;
    static isFunction(arg: any): boolean;
    static isAsyncFcuntion(fn: any): boolean;
    static isPrimitive(arg: any): boolean;
    static isBuffer(arg: any): arg is Buffer<ArrayBufferLike>;
    static promisify(fn: any, receiver: any): (...args: any) => Promise<unknown>;
    static extend(target?: any, ...args: any): any;
    static isTrueEmpty(obj: any): boolean;
    static isEmpty(obj: any): boolean;
    static defer(): any;
    static omit(obj: any, props: any[] | string): any;
    static isShallowEqual(obj1: any, obj2: any): boolean;
}
