'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crypto = require('crypto');
var uuid = require('uuid');
var path = require('path');
var fs = require('fs');
var net = require('net');
var cluster = require('cluster');
var ms = require('ms');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var net__default = /*#__PURE__*/_interopDefaultLegacy(net);
var cluster__default = /*#__PURE__*/_interopDefaultLegacy(cluster);
var ms__default = /*#__PURE__*/_interopDefaultLegacy(ms);

class CryptoUtils {
    static randomString(length = 8, options = {}) {
        let chars = '';
        let result = '';
        if (options === true) {
            chars = CryptoUtils.chars.join('');
        }
        else if (typeof options == 'string') {
            chars = options;
        }
        else {
            if (options.numbers !== false)
                chars += typeof options.numbers == 'string' ? options.numbers : CryptoUtils.chars[0];
            if (options.letters !== false)
                chars += typeof options.letters == 'string' ? options.letters : CryptoUtils.chars[1];
            if (options.specials)
                chars += typeof options.specials == 'string' ? options.specials : CryptoUtils.chars[2];
        }
        while (length > 0) {
            length--;
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }
    static md5(bytes, encoding = 'hex') {
        if (Array.isArray(bytes)) {
            bytes = Buffer.from(bytes);
        }
        else if (typeof bytes === 'string') {
            bytes = Buffer.from(bytes, 'utf8');
        }
        return crypto__default["default"].createHash('md5').update(bytes).digest(encoding);
    }
    static sha256(bytes, encoding = 'hex') {
        if (Array.isArray(bytes)) {
            bytes = Buffer.from(bytes);
        }
        else if (typeof bytes === 'string') {
            bytes = Buffer.from(bytes, 'utf8');
        }
        return crypto__default["default"].createHash('sha256').update(bytes).digest(encoding);
    }
    static uuid(version) {
        if (version === 'v1')
            return uuid.v1();
        return uuid.v4();
    }
}
CryptoUtils.chars = ['0123456789', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', '~!@#$%^*()_+-=[]{}|;:,./<>?'];

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
                return false ;
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

const fsRmdir = ObjectUtils.promisify(fs__default["default"].rmdir, fs__default["default"]);
const fsUnlink = ObjectUtils.promisify(fs__default["default"].unlink, fs__default["default"]);
const fsReaddir = ObjectUtils.promisify(fs__default["default"].readdir, fs__default["default"]);
class FileUtils {
    static isExist(dir) {
        dir = path__default["default"].normalize(dir);
        try {
            fs__default["default"].accessSync(dir, fs__default["default"].constants.R_OK);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    static isFile(filePath) {
        if (!FileUtils.isExist(filePath))
            return false;
        try {
            const stat = fs__default["default"].statSync(filePath);
            return stat.isFile();
        }
        catch (e) {
            return false;
        }
    }
    static isDirectory(filePath) {
        if (!FileUtils.isExist(filePath))
            return false;
        try {
            const stat = fs__default["default"].statSync(filePath);
            return stat.isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    static chmod(p, mode) {
        try {
            fs__default["default"].chmodSync(p, mode);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    static mkdir(dir, mode) {
        if (FileUtils.isExist(dir)) {
            if (mode)
                return FileUtils.chmod(dir, mode);
            return true;
        }
        const pp = path__default["default"].dirname(dir);
        if (FileUtils.isExist(pp)) {
            try {
                fs__default["default"].mkdirSync(dir, mode);
                if (mode)
                    FileUtils.chmod(dir, mode);
                return true;
            }
            catch (e) {
                return false;
            }
        }
        if (FileUtils.mkdir(pp, mode))
            return FileUtils.mkdir(dir, mode);
        return false;
    }
    static getdirFiles(dir, prefix = '') {
        dir = path__default["default"].normalize(dir);
        if (!fs__default["default"].existsSync(dir))
            return [];
        const files = fs__default["default"].readdirSync(dir);
        let result = [];
        files.forEach((item) => {
            const currentDir = path__default["default"].join(dir, item);
            const stat = fs__default["default"].statSync(currentDir);
            if (stat.isFile()) {
                result.push(path__default["default"].join(prefix, item));
            }
            else if (stat.isDirectory()) {
                const cFiles = FileUtils.getdirFiles(currentDir, path__default["default"].join(prefix, item));
                result = result.concat(cFiles);
            }
        });
        return result;
    }
    static rmdir(p, reserve = false) {
        if (!FileUtils.isDirectory(p))
            return Promise.resolve();
        return fsReaddir(p).then((files) => {
            const promises = files.map((item) => {
                const filepath = path__default["default"].join(p, item);
                if (FileUtils.isDirectory(filepath))
                    return FileUtils.rmdir(filepath, false);
                return fsUnlink(filepath);
            });
            return Promise.all(promises).then(() => {
                if (!reserve)
                    return fsRmdir(p);
            });
        });
    }
    static rm(p, reserve = false) {
        if (FileUtils.isDirectory(p))
            return Promise.resolve();
        return fsUnlink(p).then(() => {
            if (!reserve) {
                let dirname = path__default["default"].dirname(p);
                let dirs = fs__default["default"].readdirSync(dirname);
                if (dirs.length <= 0)
                    return fsUnlink(dirname);
            }
        });
    }
    static writeFile(p, data, options) {
        let mode;
        if (options && typeof options !== 'string' && options.mode !== undefined)
            mode = options.mode;
        FileUtils.mkdir(path__default["default"].dirname(p), mode);
        fs__default["default"].writeFileSync(p, data, options);
    }
    static readFile(p, options) {
        if (FileUtils.isExist(p)) {
            let buffer = fs__default["default"].readFileSync(p, options);
            return buffer;
        }
        return '';
    }
    static readTxtFile(p, options) {
        let content = FileUtils.readFile(p, options);
        if (content)
            return content.toString();
        return content;
    }
}

class NetUtils {
}
NetUtils.isIP = net__default["default"].isIP;
NetUtils.isIPv4 = net__default["default"].isIPv4;
NetUtils.isIPv6 = net__default["default"].isIPv6;

const numberReg = /^((-?(\d+\.|\d+|\.\d)\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
class StringUtils {
    static camelCase(str) {
        if (str.indexOf('_') > -1) {
            str = str.replace(/_(\w)/g, (a, b) => {
                return b.toUpperCase();
            });
        }
        return str;
    }
    static snakeCase(str) {
        return str.replace(/([^A-Z])([A-Z])/g, function ($0, $1, $2) {
            return $1 + '_' + $2.toLowerCase();
        });
    }
    static isNumberString(obj) {
        if (!obj)
            return false;
        return numberReg.test(obj);
    }
}

class ThreadUtils {
}
ThreadUtils.isMaster = cluster__default["default"].isMaster;

class TimeUtils {
    static timeout(time = 1000) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }
    static async sleep(time) {
        await new Promise((resolve) => setTimeout(resolve, time));
    }
    static datetime(date = new Date(), format) {
        if (date && ObjectUtils.isString(date)) {
            const dateString = date;
            date = new Date(Date.parse(dateString));
            if (isNaN(date.getTime()) && !format) {
                format = dateString;
                date = new Date();
            }
        }
        format = format || 'YYYY-MM-DD HH:mm:ss';
        const fn = (d) => {
            return ('0' + d).slice(-2);
        };
        const d = new Date(date);
        const formats = {
            YYYY: d.getFullYear(),
            MM: fn(d.getMonth() + 1),
            DD: fn(d.getDate()),
            HH: fn(d.getHours()),
            mm: fn(d.getMinutes()),
            ss: fn(d.getSeconds()),
        };
        return format.replace(/([a-z])\1+/gi, (a) => {
            return formats[a] || a;
        });
    }
    static ms(time) {
        if (typeof time === 'number')
            return time;
        const result = ms__default["default"](time);
        if (result === undefined) {
            throw new Error(`ms('${time}') result is undefined`);
        }
        return result;
    }
}

exports.CryptoUtils = CryptoUtils;
exports.FileUtils = FileUtils;
exports.NetUtils = NetUtils;
exports.ObjectUtils = ObjectUtils;
exports.StringUtils = StringUtils;
exports.ThreadUtils = ThreadUtils;
exports.TimeUtils = TimeUtils;
//# sourceMappingURL=index.js.map
