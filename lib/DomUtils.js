"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomUtils = void 0;
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
        if (el.addEventListener) {
            el.addEventListener(event, handler, false);
        }
        else {
            el.attachEvent('on' + event, handler);
        }
    }
    static off(el, event, handler) {
        if (el.removeEventListener) {
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
    static getStyle(el, styleName, options) {
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
                let doc = options && options.window ? options.window.document : document;
                let computed = doc.defaultView.getComputedStyle(el, '');
                return el.style[styleName] || computed ? computed[styleName] : null;
            }
            catch (e) {
                return el.style[styleName];
            }
        }
    }
    static setStyle(el, styleName, value) {
        if (!el || !styleName)
            return;
        if (typeof styleName === 'object') {
            for (var prop in styleName) {
                if (styleName.hasOwnProperty(prop)) {
                    DomUtils.setStyle(el, prop, styleName[prop]);
                }
            }
        }
        else {
            styleName = DomUtils.camelCase(styleName);
            if (styleName === 'opacity' && ieVersion() < 9) {
                el.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
            }
            else {
                el.style[styleName] = value;
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
    static getScrollContainer(el, vertical, options) {
        let win = options && options.window ? options.window : window;
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
    }
    static isInContainer(el, container, options) {
        if (!el || !container)
            return false;
        const win = options && options.window ? options.window : window;
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
        return elRect.top < containerRect.bottom && elRect.bottom > containerRect.top && elRect.right > containerRect.left && elRect.left < containerRect.right;
    }
    static calcNativeScrollBarWidth(options) {
        if (DomUtils.scrollBarWidth >= 0)
            return DomUtils.scrollBarWidth;
        let doc = options && options.window ? options.window.document : document;
        let e = doc.createElement('div');
        let sw;
        e.style.position = 'absolute';
        e.style.top = '-9999px';
        e.style.width = '100px';
        e.style.height = '100px';
        e.style.overflow = 'scroll';
        e.style.msOverflowStyle = 'scrollbar';
        doc.body.appendChild(e);
        sw = e.offsetWidth - e.clientWidth;
        doc.body.removeChild(e);
        DomUtils.scrollBarWidth = sw;
        return sw;
    }
}
exports.DomUtils = DomUtils;
DomUtils.scrollBarWidth = -1;
//# sourceMappingURL=DomUtils.js.map