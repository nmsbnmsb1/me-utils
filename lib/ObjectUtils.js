"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectUtils = void 0;
class ObjectUtils {
    static objectToString(o) {
        return Object.prototype.toString.call(o);
    }
    static hasOwn(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }
    static isArray(arg) {
        if (Array.isArray) {
            return Array.isArray(arg);
        }
        return ObjectUtils.objectToString(arg) === '[object Array]';
    }
    static isBoolean(arg) {
        return typeof arg === 'boolean';
    }
    static isNull(arg) {
        return arg === null;
    }
    static isNullOrUndefined(arg) {
        return arg == null || arg == undefined;
    }
    static isNumber(arg) {
        return typeof arg === 'number';
    }
    static isInt(value) {
        if (isNaN(value) || ObjectUtils.isString(value)) {
            return false;
        }
        var x = parseFloat(value);
        return (x | 0) === x;
    }
    static isString(arg) {
        return typeof arg === 'string';
    }
    static isSymbol(arg) {
        return typeof arg === 'symbol';
    }
    static isUndefined(arg) {
        return arg === void 0;
    }
    static isRegExp(re) {
        return ObjectUtils.objectToString(re) === '[object RegExp]';
    }
    static isObject(arg) {
        return typeof arg === 'object' && arg !== null;
    }
    static isTrueObject(obj) {
        return toString.call(obj) === '[object Object]';
    }
    static isDate(d) {
        return ObjectUtils.objectToString(d) === '[object Date]';
    }
    static isError(e) {
        return ObjectUtils.objectToString(e) === '[object Error]' || e instanceof Error;
    }
    static isFunction(arg) {
        return typeof arg === 'function';
    }
    static isAsyncFcuntion(fn) {
        const AsyncFunction = Object.getPrototypeOf(async () => { }).constructor;
        return fn instanceof AsyncFunction;
    }
    static isPrimitive(arg) {
        return (arg === null ||
            typeof arg === 'boolean' ||
            typeof arg === 'number' ||
            typeof arg === 'string' ||
            typeof arg === 'symbol' ||
            typeof arg === 'undefined');
    }
    static isBuffer(arg) {
        return Buffer.isBuffer(arg);
    }
    static promisify(fn, receiver) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                fn.apply(receiver, [
                    ...args,
                    (err, res) => {
                        return err ? reject(err) : resolve(res);
                    },
                ]);
            });
        };
    }
    static extend(target = {}, ...args) {
        let i = 0;
        const length = args.length;
        let options;
        let name;
        let src;
        let copy;
        if (!target) {
            target = ObjectUtils.isArray(args[0]) ? [] : {};
        }
        for (; i < length; i++) {
            options = args[i];
            if (!options) {
                continue;
            }
            for (name in options) {
                src = target[name];
                copy = options[name];
                if (src && src === copy) {
                    continue;
                }
                if (ObjectUtils.isArray(copy)) {
                    target[name] = ObjectUtils.extend([], copy);
                }
                else if (ObjectUtils.isTrueObject(copy)) {
                    target[name] = ObjectUtils.extend(src && ObjectUtils.isTrueObject(src) ? src : {}, copy);
                }
                else {
                    target[name] = copy;
                }
            }
        }
        return target;
    }
    static isTrueEmpty(obj) {
        if (obj === undefined || obj === null || obj === '')
            return true;
        if (ObjectUtils.isNumber(obj) && isNaN(obj))
            return true;
        return false;
    }
    static isEmpty(obj) {
        if (ObjectUtils.isTrueEmpty(obj))
            return true;
        if (ObjectUtils.isRegExp(obj)) {
            return false;
        }
        else if (ObjectUtils.isDate(obj)) {
            return false;
        }
        else if (ObjectUtils.isError(obj)) {
            return false;
        }
        else if (ObjectUtils.isArray(obj)) {
            return obj.length === 0;
        }
        else if (ObjectUtils.isString(obj)) {
            return obj.length === 0;
        }
        else if (ObjectUtils.isNumber(obj)) {
            return obj === 0;
        }
        else if (ObjectUtils.isBoolean(obj)) {
            return !obj;
        }
        else if (ObjectUtils.isObject(obj)) {
            for (const key in obj) {
                return false && key;
            }
            return true;
        }
        return false;
    }
    static defer() {
        const deferred = {};
        deferred.promise = new Promise((resolve, reject) => {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        return deferred;
    }
    static omit(obj, props) {
        if (ObjectUtils.isString(props)) {
            props = props.split(',');
        }
        const keys = Object.keys(obj);
        const result = {};
        keys.forEach((item) => {
            if (props.indexOf(item) === -1) {
                result[item] = obj[item];
            }
        });
        return result;
    }
}
exports.ObjectUtils = ObjectUtils;
//# sourceMappingURL=ObjectUtils.js.map