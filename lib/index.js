'use strict';

var jsMd5 = require('js-md5');
var jsSha256 = require('js-sha256');
var uuid = require('uuid');
var fs = require('node:fs');
var path = require('node:path');
var net = require('node:net');
var cluster = require('node:cluster');
var ms = require('ms');

const CHARS = [
    '0123456789',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    '~!@#$%^*()_+-=[]{}|;:,./<>?',
];
const CryptoUtils = {
    randomString(length = 8, options = {}) {
        let chars = '';
        let result = '';
        if (options === true) {
            chars = CHARS.join('');
        }
        else if (typeof options === 'string') {
            chars = options;
        }
        else {
            if (options.numbers !== false)
                chars += typeof options.numbers === 'string' ? options.numbers : CHARS[0];
            if (options.letters !== false)
                chars += typeof options.letters === 'string' ? options.letters : CHARS[1];
            if (options.specials)
                chars += typeof options.specials === 'string' ? options.specials : CHARS[2];
        }
        while (length > 0) {
            length--;
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    },
    md5(bytes, encoding = 'hex') {
        return jsMd5.md5(bytes);
    },
    sha256(bytes, encoding = 'hex') {
        return jsSha256.sha256(bytes);
    },
    uuid(options) {
        const ver = options?.version || 'v4';
        let id = '';
        if (ver === 'v1')
            id = uuid.v1();
        else
            id = uuid.v4();
        if (options?.removeDash === true)
            id = id.replace(/\-/g, '');
        if (options?.lowerCase === true)
            id = id.toLowerCase();
        return id;
    },
};

const fnMap = new Map();
const fsPromisify = (fn, ...args) => {
    let pfn = fnMap.get(fn);
    if (!pfn) {
        pfn = (...args) => {
            return new Promise((resolve, reject) => {
                fn.apply(fs, [
                    ...args,
                    (err, res) => {
                        if (err === true) {
                            resolve(true);
                        }
                        else {
                            !err ? resolve(res) : reject(err);
                        }
                    },
                ]);
            });
        };
        fnMap.set(fn, pfn);
    }
    return pfn(...args);
};
const FileUtils = {
    async isExist(p) {
        p = path.normalize(p);
        return new Promise((resolve) => fs.access(p, fs.constants.F_OK, (err) => resolve(!err)));
    },
    async isFile(filePath) {
        return new Promise((resolve) => {
            fs.stat(filePath, (err, stats) => resolve(err || !stats ? false : stats.isFile()));
        });
    },
    async isDirectory(dirPath) {
        return new Promise((resolve) => {
            fs.stat(dirPath, (err, stats) => {
                resolve(err || !stats ? false : stats.isDirectory());
            });
        });
    },
    async chmod(p, mode) {
        return new Promise((resolve) => {
            fs.chmod(p, mode, (err) => resolve(!err));
        });
    },
    async mkdir(dir, mode) {
        try {
            await fsPromisify(fs.mkdir, dir, { recursive: true });
        }
        catch (e) {
            return false;
        }
        if (mode)
            await FileUtils.chmod(dir, mode);
        return true;
    },
    async getdirFiles(dir, prefix = '') {
        dir = path.normalize(dir);
        let files;
        try {
            files = (await fsPromisify(fs.readdir, dir));
        }
        catch (e) {
            if (e.code === 'ENOENT')
                return [];
            throw e;
        }
        const result = [];
        for (const item of files) {
            const currentDir = path.join(dir, item);
            const stat = (await fsPromisify(fs.stat, currentDir));
            if (stat.isFile()) {
                result.push(path.join(prefix, item));
            }
            else if (stat.isDirectory()) {
                result.push(...(await FileUtils.getdirFiles(currentDir, path.join(prefix, item))));
            }
        }
        return result;
    },
    getCharCodeLength(charCode) {
        if (charCode <= 0x007f)
            return 1;
        if (charCode <= 0x07ff)
            return 2;
        if (charCode <= 0xffff)
            return 3;
        return 4;
    },
    getPathNameLength(pathName) {
        let total = 0;
        for (let i = 0, len = pathName.length; i < len; i++) {
            total += FileUtils.getCharCodeLength(pathName.charCodeAt(i));
        }
        return total;
    },
    truncatePathName(fileName, maxLength = 180) {
        let ns = '';
        let total = 0;
        for (let i = 0, len = fileName.length; i < len; i++) {
            let add = FileUtils.getCharCodeLength(fileName.charCodeAt(i));
            if (total + add <= maxLength) {
                ns += fileName.charAt(i);
                total += add;
            }
            else {
                break;
            }
        }
        return ns;
    },
    async unlink(p) {
        try {
            await fsPromisify(fs.unlink, p);
        }
        catch (e) {
            return false;
        }
        return true;
    },
    async rmdir(p, reserve = false) {
        if (!(await FileUtils.isDirectory(p)))
            return false;
        let rm = async (dirPath, reserve) => {
            let files = (await fsPromisify(fs.readdir, dirPath));
            for (let item of files) {
                let filepath = path.join(dirPath, item);
                if (await FileUtils.isDirectory(filepath)) {
                    await rm(filepath, false);
                }
                else {
                    await fsPromisify(fs.unlink, filepath);
                }
            }
            if (!reserve)
                await fsPromisify(fs.rm, dirPath, { recursive: true, force: true });
        };
        await rm(p, reserve);
        return true;
    },
    async rename(src, dest, existsPolicy, options = {}) {
        if (src === dest)
            return dest;
        if (options.srcExists === undefined && !(await FileUtils.isExist(src)))
            return;
        if (!(await FileUtils.isExist(dest))) {
            const destParent = path.dirname(dest);
            await FileUtils.mkdir(destParent, 0o777);
            await fsPromisify(fs.rename, src, dest);
            return dest;
        }
        if (existsPolicy === 'raiseExecption')
            throw new Error(`${dest} is exists`);
        if (options.destIsFile === undefined)
            options.destIsFile = await FileUtils.isFile(dest);
        if (existsPolicy === 'replace') {
            await (options.destIsFile ? FileUtils.unlink(dest) : FileUtils.rmdir(dest));
            await fsPromisify(fs.rename, src, dest);
            return dest;
        }
        if (existsPolicy === 'rename') {
            let descNew = '';
            let destParent = path.dirname(dest);
            let destName = path.basename(dest);
            let descExt = options.destIsFile ? path.extname(dest) : '';
            let descCounter = 1;
            while (true) {
                descNew = path.join(destParent, `${destName}_${`${descCounter}`.padStart(2, '0')}${descExt}`);
                if (!(await FileUtils.isExist(descNew)))
                    break;
                descCounter++;
            }
            await fsPromisify(fs.rename, src, descNew);
            return descNew;
        }
        if (!options.destIsFile && existsPolicy.startsWith('merge')) {
            let fileExistsPolicy = existsPolicy.replace('merge', '');
            fileExistsPolicy = `${fileExistsPolicy[0].toLowerCase()}${fileExistsPolicy.substring(1)}`;
            const fileRenameOptions = { srcExists: true, destIsFile: true };
            const all = [];
            for (const srcFile of await FileUtils.getdirFiles(src)) {
                all.push(FileUtils.rename(path.join(src, srcFile), path.join(dest, srcFile), fileExistsPolicy, fileRenameOptions));
            }
            await Promise.all(all);
            await FileUtils.rmdir(src, false);
            return dest;
        }
    },
    async writeFile(p, data, options) {
        let mode;
        if (options && typeof options !== 'string' && options.mode !== undefined)
            mode = options.mode;
        await FileUtils.mkdir(path.dirname(p), mode);
        await fsPromisify(fs.writeFile, p, data, options);
    },
    async writeJSONFile(p, data, jsonSpace, options) {
        return FileUtils.writeFile(p, JSON.stringify(data, undefined, jsonSpace), options);
    },
    async readFile(p, options) {
        return fsPromisify(fs.readFile, p, options);
    },
    async readTxtFile(p, options) {
        return (await fsPromisify(fs.readFile, p, options)).toString();
    },
    async readJSONFile(p, options) {
        const content = (await fsPromisify(fs.readFile, p, options)).toString();
        return content ? JSON.parse(content) : undefined;
    },
};

const NetUtils = {
    isIP: net.isIP,
    isIPv4: net.isIPv4,
    isIPv6: net.isIPv6,
};

const ObjectUtils = {
    objectToString(o) {
        return Object.prototype.toString.call(o);
    },
    hasOwn(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    },
    isArray(arg) {
        if (Array.isArray) {
            return Array.isArray(arg);
        }
        return ObjectUtils.objectToString(arg) === '[object Array]';
    },
    isBoolean(arg) {
        return typeof arg === 'boolean';
    },
    isNull(arg) {
        return arg === null;
    },
    isNullOrUndefined(arg) {
        return arg == null || arg === undefined;
    },
    isNumber(arg) {
        return typeof arg === 'number';
    },
    isInt(value) {
        if (isNaN(value) || ObjectUtils.isString(value)) {
            return false;
        }
        const x = Number.parseFloat(value);
        return (x | 0) === x;
    },
    isString(arg) {
        return typeof arg === 'string';
    },
    isSymbol(arg) {
        return typeof arg === 'symbol';
    },
    isUndefined(arg) {
        return arg === void 0;
    },
    isRegExp(re) {
        return ObjectUtils.objectToString(re) === '[object RegExp]';
    },
    isObject(arg) {
        return typeof arg === 'object' && arg !== null;
    },
    isTrueObject(obj) {
        return toString.call(obj) === '[object Object]';
    },
    isDate(d) {
        return ObjectUtils.objectToString(d) === '[object Date]';
    },
    isError(e) {
        return ObjectUtils.objectToString(e) === '[object Error]' || e instanceof Error;
    },
    isFunction(arg) {
        return typeof arg === 'function';
    },
    isAsyncFcuntion(fn) {
        const AsyncFunction = Object.getPrototypeOf(async () => { }).constructor;
        return fn instanceof AsyncFunction;
    },
    isPrimitive(arg) {
        return (arg === null ||
            typeof arg === 'boolean' ||
            typeof arg === 'number' ||
            typeof arg === 'string' ||
            typeof arg === 'symbol' ||
            typeof arg === 'undefined');
    },
    isBuffer(arg) {
        return Buffer.isBuffer(arg);
    },
    defer() {
        const deferred = {};
        deferred.promise = new Promise((resolve, reject) => {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        return deferred;
    },
    extend(target = {}, ...args) {
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
    },
    isTrueEmpty(obj) {
        if (obj === undefined || obj === null || obj === '')
            return true;
        if (ObjectUtils.isNumber(obj) && isNaN(obj))
            return true;
        return false;
    },
    isEmpty(obj) {
        if (ObjectUtils.isTrueEmpty(obj))
            return true;
        if (ObjectUtils.isRegExp(obj)) {
            return false;
        }
        if (ObjectUtils.isDate(obj)) {
            return false;
        }
        if (ObjectUtils.isError(obj)) {
            return false;
        }
        if (ObjectUtils.isArray(obj)) {
            return obj.length === 0;
        }
        if (ObjectUtils.isString(obj)) {
            return obj.length === 0;
        }
        if (ObjectUtils.isNumber(obj)) {
            return obj === 0;
        }
        if (ObjectUtils.isBoolean(obj)) {
            return !obj;
        }
        if (ObjectUtils.isObject(obj)) {
            for (const key in obj) {
                return false;
            }
            return true;
        }
        return false;
    },
    omit(obj, props) {
        if (ObjectUtils.isString(props)) {
            props = props.split(',');
        }
        const keys = Object.keys(obj);
        const result = {};
        for (const item of keys) {
            if (props.indexOf(item) === -1) {
                result[item] = obj[item];
            }
        }
        return result;
    },
    isShallowEqual(obj1, obj2) {
        if (obj1 === obj2)
            return true;
        if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
            return false;
        }
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length)
            return false;
        for (const key of keys1) {
            if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
                return false;
            }
        }
        return true;
    },
};

const numberReg = /^((-?(\d+\.|\d+|\.\d)\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
const StringUtils = {
    camelCase(str) {
        if (str.indexOf('_') > -1) {
            str = str.replace(/_(\w)/g, (a, b) => {
                return b.toUpperCase();
            });
        }
        return str;
    },
    snakeCase(str) {
        return str.replace(/([^A-Z])([A-Z])/g, ($0, $1, $2) => {
            return `${$1}_${$2.toLowerCase()}`;
        });
    },
    isNumberString(obj) {
        if (!obj)
            return false;
        return numberReg.test(obj);
    },
    fillZero(s, bits) {
        s = s.toString();
        while (s.length < bits)
            s = `0${s}`;
        return s;
    },
};

const ThreadUtils = {
    isMaster: cluster.isPrimary,
    isPrimary: cluster.isPrimary,
};

const TimeUtils = {
    timeout(time = 1000) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    },
    async sleep(time) {
        await new Promise((resolve) => setTimeout(resolve, time));
    },
    datetime(date, format) {
        if (!date) {
            date = new Date();
        }
        else if (ObjectUtils.isString(date)) {
            const dateString = date;
            date = new Date(Date.parse(dateString));
            if (isNaN(date.getTime()) && !format) {
                format = dateString;
                date = new Date();
            }
        }
        format = format || 'YYYY-MM-DD HH:mm:ss';
        const fn = (d) => `0${d}`.slice(-2);
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
    },
    ms(time) {
        if (typeof time === 'number')
            return time;
        const result = ms(time);
        if (result === undefined) {
            throw new Error(`ms('${time}') result is undefined`);
        }
        return result;
    },
};

exports.CryptoUtils = CryptoUtils;
exports.FileUtils = FileUtils;
exports.NetUtils = NetUtils;
exports.ObjectUtils = ObjectUtils;
exports.StringUtils = StringUtils;
exports.ThreadUtils = ThreadUtils;
exports.TimeUtils = TimeUtils;
exports.fsPromisify = fsPromisify;
//# sourceMappingURL=index.js.map
