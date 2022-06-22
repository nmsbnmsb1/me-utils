import crypto from 'crypto';
import { v1, v4 } from 'uuid';
import ms from 'ms';

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
        return crypto.createHash('md5').update(bytes).digest(encoding);
    }
    static sha256(bytes, encoding = 'hex') {
        if (Array.isArray(bytes)) {
            bytes = Buffer.from(bytes);
        }
        else if (typeof bytes === 'string') {
            bytes = Buffer.from(bytes, 'utf8');
        }
        return crypto.createHash('sha256').update(bytes).digest(encoding);
    }
    static uuid(version) {
        if (version === 'v1')
            return v1();
        return v4();
    }
}
CryptoUtils.chars = ['0123456789', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', '~!@#$%^*()_+-=[]{}|;:,./<>?'];

const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
const ieVersion = function () {
    return document ? Number(document.DOCUMENT_NODE || 0) : 0;
};
class DomUtils {
    static trim(str) {
        return (str || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
    }
    static camelCase(name) {
        return name
            .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        })
            .replace(MOZ_HACK_REGEXP, 'Moz$1');
    }
    static on(el, event, handler) {
        if (document.addEventListener) {
            el.addEventListener(event, handler, false);
        }
        else {
            el.attachEvent('on' + event, handler);
        }
    }
    static off(el, event, handler) {
        if (document.removeEventListener) {
            el.removeEventListener(event, handler, false);
        }
        else {
            el.detachEvent('on' + event, handler);
        }
    }
    static once(el, event, fn, ...args) {
        let listener = function () {
            fn(...args);
            DomUtils.off(el, event, listener);
        };
        DomUtils.on(el, event, listener);
    }
    static hasClass(el, cls) {
        if (!el || !cls)
            return false;
        if (cls.indexOf(' ') !== -1)
            throw new Error('className should not contain space.');
        if (el.classList) {
            return el.classList.contains(cls);
        }
        else {
            return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
        }
    }
    static addClass(el, cls) {
        if (!el)
            return;
        var curClass = el.className;
        var classes = (cls || '').split(' ');
        for (var i = 0, j = classes.length; i < j; i++) {
            var clsName = classes[i];
            if (!clsName)
                continue;
            if (el.classList) {
                el.classList.add(clsName);
            }
            else if (!DomUtils.hasClass(el, clsName)) {
                curClass += ' ' + clsName;
            }
        }
        if (!el.classList) {
            el.className = curClass;
        }
    }
    static removeClass(el, cls) {
        if (!el || !cls)
            return;
        var classes = cls.split(' ');
        var curClass = ' ' + el.className + ' ';
        for (var i = 0, j = classes.length; i < j; i++) {
            var clsName = classes[i];
            if (!clsName)
                continue;
            if (el.classList) {
                el.classList.remove(clsName);
            }
            else if (DomUtils.hasClass(el, clsName)) {
                curClass = curClass.replace(' ' + clsName + ' ', ' ');
            }
        }
        if (!el.classList) {
            el.className = DomUtils.trim(curClass);
        }
    }
    static getStyle(element, styleName) {
        if (ieVersion() < 9) {
            if (!element || !styleName)
                return null;
            styleName = DomUtils.camelCase(styleName);
            if (styleName === 'float') {
                styleName = 'styleFloat';
            }
            try {
                switch (styleName) {
                    case 'opacity':
                        try {
                            return element.filters.item('alpha').opacity / 100;
                        }
                        catch (e) {
                            return 1.0;
                        }
                    default:
                        return element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null;
                }
            }
            catch (e) {
                return element.style[styleName];
            }
        }
        else {
            if (!element || !styleName)
                return null;
            styleName = DomUtils.camelCase(styleName);
            if (styleName === 'float') {
                styleName = 'cssFloat';
            }
            try {
                var computed = document.defaultView.getComputedStyle(element, '');
                return element.style[styleName] || computed ? computed[styleName] : null;
            }
            catch (e) {
                return element.style[styleName];
            }
        }
    }
    static setStyle(element, styleName, value) {
        if (!element || !styleName)
            return;
        if (typeof styleName === 'object') {
            for (var prop in styleName) {
                if (styleName.hasOwnProperty(prop)) {
                    DomUtils.setStyle(element, prop, styleName[prop]);
                }
            }
        }
        else {
            styleName = DomUtils.camelCase(styleName);
            if (styleName === 'opacity' && ieVersion() < 9) {
                element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
            }
            else {
                element.style[styleName] = value;
            }
        }
    }
    static isScroll(el, vertical) {
        const determinedDirection = vertical !== null || vertical !== undefined;
        const overflow = determinedDirection
            ? vertical
                ? DomUtils.getStyle(el, 'overflow-y')
                : DomUtils.getStyle(el, 'overflow-x')
            : DomUtils.getStyle(el, 'overflow');
        return overflow.match(/(scroll|auto)/);
    }
    static getScrollContainer(el, vertical) {
        let parent = el;
        while (parent) {
            if ([window, document, document.documentElement].includes(parent)) {
                return window;
            }
            if (DomUtils.isScroll(parent, vertical)) {
                return parent;
            }
            parent = parent.parentNode;
        }
        return parent;
    }
    static isInContainer(el, container) {
        if (!el || !container)
            return false;
        const elRect = el.getBoundingClientRect();
        let containerRect;
        if ([window, document, document.documentElement, null, undefined].includes(container)) {
            containerRect = {
                top: 0,
                right: window.innerWidth,
                bottom: window.innerHeight,
                left: 0,
            };
        }
        else {
            containerRect = container.getBoundingClientRect();
        }
        return elRect.top < containerRect.bottom && elRect.bottom > containerRect.top && elRect.right > containerRect.left && elRect.left < containerRect.right;
    }
    static calcNativeScrollBarWidth() {
        if (DomUtils.scrollBarWidth >= 0)
            return DomUtils.scrollBarWidth;
        let e = document.createElement('div');
        let sw;
        e.style.position = 'absolute';
        e.style.top = '-9999px';
        e.style.width = '100px';
        e.style.height = '100px';
        e.style.overflow = 'scroll';
        e.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(e);
        sw = e.offsetWidth - e.clientWidth;
        document.body.removeChild(e);
        DomUtils.scrollBarWidth = sw;
        return sw;
    }
}
DomUtils.scrollBarWidth = -1;

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
        const result = ms(time);
        if (result === undefined) {
            throw new Error(`ms('${time}') result is undefined`);
        }
        return result;
    }
}

export { CryptoUtils, DomUtils, ObjectUtils, StringUtils, TimeUtils };
//# sourceMappingURL=index.esm.browser.js.map
