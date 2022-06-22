// https://github.com/ElemeFE/element
// The MIT License (MIT)

// Copyright (c) 2016-present ElemeFE

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
const ieVersion = function () {
	return document ? Number(document.DOCUMENT_NODE || 0) : 0;
};

export class DomUtils {
	public static trim(str: string) {
		return (str || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
	}

	public static camelCase(name: string) {
		return name
			.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
				return offset ? letter.toUpperCase() : letter;
			})
			.replace(MOZ_HACK_REGEXP, 'Moz$1');
	}

	public static on(el: any, event: any, handler: any) {
		if (document.addEventListener) {
			el.addEventListener(event, handler, false);
		} else {
			el.attachEvent('on' + event, handler);
		}
	}

	public static off(el: any, event: any, handler: any) {
		if (document.removeEventListener) {
			el.removeEventListener(event, handler, false);
		} else {
			el.detachEvent('on' + event, handler);
		}
	}

	public static once(el: any, event: any, fn: any, ...args: any[]) {
		let listener = function () {
			fn(...args);
			DomUtils.off(el, event, listener);
		};
		DomUtils.on(el, event, listener);
	}

	public static hasClass(el: any, cls: any) {
		if (!el || !cls) return false;
		if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
		if (el.classList) {
			return el.classList.contains(cls);
		} else {
			return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
		}
	}

	public static addClass(el: any, cls: any) {
		if (!el) return;
		var curClass = el.className;
		var classes = (cls || '').split(' ');

		for (var i = 0, j = classes.length; i < j; i++) {
			var clsName = classes[i];
			if (!clsName) continue;

			if (el.classList) {
				el.classList.add(clsName);
			} else if (!DomUtils.hasClass(el, clsName)) {
				curClass += ' ' + clsName;
			}
		}
		if (!el.classList) {
			el.className = curClass;
		}
	}

	public static removeClass(el: any, cls: any) {
		if (!el || !cls) return;
		var classes = cls.split(' ');
		var curClass = ' ' + el.className + ' ';

		for (var i = 0, j = classes.length; i < j; i++) {
			var clsName = classes[i];
			if (!clsName) continue;

			if (el.classList) {
				el.classList.remove(clsName);
			} else if (DomUtils.hasClass(el, clsName)) {
				curClass = curClass.replace(' ' + clsName + ' ', ' ');
			}
		}
		if (!el.classList) {
			el.className = DomUtils.trim(curClass);
		}
	}

	public static getStyle(element: any, styleName: any) {
		if (ieVersion() < 9) {
			if (!element || !styleName) return null;
			styleName = DomUtils.camelCase(styleName);
			if (styleName === 'float') {
				styleName = 'styleFloat';
			}
			try {
				switch (styleName) {
					case 'opacity':
						try {
							return element.filters.item('alpha').opacity / 100;
						} catch (e) {
							return 1.0;
						}
					default:
						return element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null;
				}
			} catch (e) {
				return element.style[styleName];
			}
		} else {
			if (!element || !styleName) return null;
			styleName = DomUtils.camelCase(styleName);
			if (styleName === 'float') {
				styleName = 'cssFloat';
			}
			try {
				var computed = document.defaultView.getComputedStyle(element, '');
				return element.style[styleName] || computed ? computed[styleName] : null;
			} catch (e) {
				return element.style[styleName];
			}
		}
	}

	public static setStyle(element: any, styleName: any, value: any) {
		if (!element || !styleName) return;

		if (typeof styleName === 'object') {
			for (var prop in styleName) {
				if (styleName.hasOwnProperty(prop)) {
					DomUtils.setStyle(element, prop, styleName[prop]);
				}
			}
		} else {
			styleName = DomUtils.camelCase(styleName);
			if (styleName === 'opacity' && ieVersion() < 9) {
				element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
			} else {
				element.style[styleName] = value;
			}
		}
	}

	public static isScroll(el: any, vertical: any) {
		const determinedDirection = vertical !== null || vertical !== undefined;
		const overflow = determinedDirection
			? vertical
				? DomUtils.getStyle(el, 'overflow-y')
				: DomUtils.getStyle(el, 'overflow-x')
			: DomUtils.getStyle(el, 'overflow');

		return overflow.match(/(scroll|auto)/);
	}

	public static getScrollContainer(el: any, vertical: any) {
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

	public static isInContainer(el: any, container: any) {
		if (!el || !container) return false;

		const elRect = el.getBoundingClientRect();
		let containerRect;

		if ([window, document, document.documentElement, null, undefined].includes(container)) {
			containerRect = {
				top: 0,
				right: window.innerWidth,
				bottom: window.innerHeight,
				left: 0,
			};
		} else {
			containerRect = container.getBoundingClientRect();
		}

		return elRect.top < containerRect.bottom && elRect.bottom > containerRect.top && elRect.right > containerRect.left && elRect.left < containerRect.right;
	}

	private static scrollBarWidth: number = -1;

	public static calcNativeScrollBarWidth() {
		if (DomUtils.scrollBarWidth >= 0) return DomUtils.scrollBarWidth;

		let e = document.createElement('div');
		let sw: number;
		e.style.position = 'absolute';
		e.style.top = '-9999px';
		e.style.width = '100px';
		e.style.height = '100px';
		e.style.overflow = 'scroll';
		(e.style as any).msOverflowStyle = 'scrollbar';
		document.body.appendChild(e);
		sw = e.offsetWidth - e.clientWidth;
		document.body.removeChild(e);
		DomUtils.scrollBarWidth = sw;
		return sw;
	}
}
