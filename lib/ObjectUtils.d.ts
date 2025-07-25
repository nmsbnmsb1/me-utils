export declare const ObjectUtils: {
    objectToString(o: any): any;
    hasOwn(obj: any, key: any): any;
    isArray(arg: any): boolean;
    isBoolean(arg: any): arg is boolean;
    isNull(arg: any): boolean;
    isNullOrUndefined(arg: any): boolean;
    isNumber(arg: any): arg is number;
    isInt(value: any): boolean;
    isString(arg: any): arg is string;
    isSymbol(arg: any): arg is symbol;
    isUndefined(arg: any): boolean;
    isRegExp(re: any): boolean;
    isObject(arg: any): boolean;
    isTrueObject(obj: any): boolean;
    isDate(d: any): boolean;
    isError(e: any): boolean;
    isFunction(arg: any): boolean;
    isAsyncFcuntion(fn: any): boolean;
    isPrimitive(arg: any): boolean;
    isBuffer(arg: any): any;
    defer(): any;
    extend(target?: any, ...args: any): any;
    isTrueEmpty(obj: any): boolean;
    isEmpty(obj: any): boolean;
    omit(obj: any, props: any[] | string): any;
    isShallowEqual(obj1: any, obj2: any): boolean;
};
