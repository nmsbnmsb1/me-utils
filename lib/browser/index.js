import { md5 } from 'js-md5';
import { sha256 } from 'js-sha256';
import { v1, v4 } from 'uuid';
import ms from 'ms';

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
        return md5(bytes);
    },
    sha256(bytes, encoding = 'hex') {
        return sha256(bytes);
    },
    uuid(options) {
        const ver = options?.version || 'v4';
        let id = '';
        if (ver === 'v1')
            id = v1();
        else
            id = v4();
        if (options?.removeDash === true)
            id = id.replace(/\-/g, '');
        if (options?.lowerCase === true)
            id = id.toLowerCase();
        return id;
    },
};

const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
const ieVersion = () => (document ? Number(document.DOCUMENT_NODE || 0) : 0);
let ScrollBarWidth = -1;
const DomUtils = {
    trim(str) {
        return (str || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
    },
    camelCase(name) {
        return name
            .replace(SPECIAL_CHARS_REGEXP, (_, separator, letter, offset) => {
            return offset ? letter.toUpperCase() : letter;
        })
            .replace(MOZ_HACK_REGEXP, 'Moz$1');
    },
    on(el, event, handler) {
        if (el.addEventListener) {
            el.addEventListener(event, handler, false);
        }
        else {
            el.attachEvent(`on${event}`, handler);
        }
    },
    off(el, event, handler) {
        if (el.removeEventListener) {
            el.removeEventListener(event, handler, false);
        }
        else {
            el.detachEvent(`on${event}`, handler);
        }
    },
    once(el, event, fn, ...args) {
        const listener = () => {
            fn(...args);
            DomUtils.off(el, event, listener);
        };
        DomUtils.on(el, event, listener);
    },
    hasClass(el, cls) {
        if (!el || !cls)
            return false;
        if (cls.indexOf(' ') !== -1)
            throw new Error('className should not contain space.');
        if (el.classList) {
            return el.classList.contains(cls);
        }
        return ` ${el.className} `.indexOf(` ${cls} `) > -1;
    },
    addClass(el, cls) {
        if (!el)
            return;
        let curClass = el.className;
        const classes = (cls || '').split(' ');
        for (let i = 0, j = classes.length; i < j; i++) {
            const clsName = classes[i];
            if (!clsName)
                continue;
            if (el.classList) {
                el.classList.add(clsName);
            }
            else if (!DomUtils.hasClass(el, clsName)) {
                curClass += ` ${clsName}`;
            }
        }
        if (!el.classList) {
            el.className = curClass;
        }
    },
    removeClass(el, cls) {
        if (!el || !cls)
            return;
        const classes = cls.split(' ');
        let curClass = ` ${el.className} `;
        for (let i = 0, j = classes.length; i < j; i++) {
            const clsName = classes[i];
            if (!clsName)
                continue;
            if (el.classList) {
                el.classList.remove(clsName);
            }
            else if (DomUtils.hasClass(el, clsName)) {
                curClass = curClass.replace(` ${clsName} `, ' ');
            }
        }
        if (!el.classList) {
            el.className = DomUtils.trim(curClass);
        }
    },
    getStyle(el, styleName, options) {
        if (ieVersion() < 9) {
            if (!el || !styleName)
                return null;
            styleName = DomUtils.camelCase(styleName);
            if (styleName === 'float') {
                styleName = 'styleFloat';
            }
            try {
                switch (styleName) {
                    case 'opacity':
                        try {
                            return el.filters.item('alpha').opacity / 100;
                        }
                        catch (e) {
                            return 1.0;
                        }
                    default:
                        return el.style[styleName] || el.currentStyle ? el.currentStyle[styleName] : null;
                }
            }
            catch (e) {
                return el.style[styleName];
            }
        }
        else {
            if (!el || !styleName)
                return null;
            styleName = DomUtils.camelCase(styleName);
            if (styleName === 'float') {
                styleName = 'cssFloat';
            }
            try {
                const doc = options?.window?.document || document;
                const computed = doc.defaultView.getComputedStyle(el, '');
                return el.style[styleName] || computed ? computed[styleName] : null;
            }
            catch (e) {
                return el.style[styleName];
            }
        }
    },
    setStyle(el, styleName, value) {
        if (!el || !styleName)
            return;
        if (typeof styleName === 'object') {
            for (const prop in styleName) {
                if (styleName.hasOwnProperty(prop)) {
                    DomUtils.setStyle(el, prop, styleName[prop]);
                }
            }
        }
        else {
            styleName = DomUtils.camelCase(styleName);
            if (styleName === 'opacity' && ieVersion() < 9) {
                el.style.filter = isNaN(value) ? '' : `alpha(opacity=${value * 100})`;
            }
            else {
                el.style[styleName] = value;
            }
        }
    },
    isScroll(el, vertical) {
        const determinedDirection = vertical !== null || vertical !== undefined;
        const overflow = determinedDirection
            ? vertical
                ? DomUtils.getStyle(el, 'overflow-y')
                : DomUtils.getStyle(el, 'overflow-x')
            : DomUtils.getStyle(el, 'overflow');
        return overflow.match(/(scroll|auto)/);
    },
    getScrollContainer(el, vertical, options) {
        const win = options?.window || window;
        let parent = el;
        while (parent) {
            if ([win, win.document, win.document.documentElement].includes(parent)) {
                return window;
            }
            if (DomUtils.isScroll(parent, vertical)) {
                return parent;
            }
            parent = parent.parentNode;
        }
        return parent;
    },
    isInContainer(el, container, options) {
        if (!el || !container)
            return false;
        const win = options?.window || window;
        const elRect = el.getBoundingClientRect();
        let containerRect;
        if ([win, win.document, win.document.documentElement, null, undefined].includes(container)) {
            containerRect = {
                top: 0,
                right: win.innerWidth,
                bottom: win.innerHeight,
                left: 0,
            };
        }
        else {
            containerRect = container.getBoundingClientRect();
        }
        return (elRect.top < containerRect.bottom &&
            elRect.bottom > containerRect.top &&
            elRect.right > containerRect.left &&
            elRect.left < containerRect.right);
    },
    calcNativeScrollBarWidth(options) {
        if (ScrollBarWidth >= 0)
            return ScrollBarWidth;
        const doc = options?.window?.document || document;
        const e = doc.createElement('div');
        e.style.position = 'absolute';
        e.style.top = '-9999px';
        e.style.width = '100px';
        e.style.height = '100px';
        e.style.overflow = 'scroll';
        e.style.msOverflowStyle = 'scrollbar';
        doc.body.appendChild(e);
        const sw = e.offsetWidth - e.clientWidth;
        doc.body.removeChild(e);
        ScrollBarWidth = sw;
        return sw;
    },
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
        return arg === undefined;
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
    promisify(fn, receiver) {
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

export { CryptoUtils, DomUtils, ObjectUtils, StringUtils, TimeUtils };
//# sourceMappingURL=index.js.map
