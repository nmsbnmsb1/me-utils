// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking export functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

// https://github.com/thinkjs/think-helper#43d7b132a47248ebb403a01901936c480906e8a0
// The MIT License(MIT)

// Copyright(c) 2017 ThinkJS

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
//     in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export const ObjectUtils = {
	objectToString(o: any) {
		return Object.prototype.toString.call(o);
	},

	hasOwn(obj: any, key: any) {
		return Object.prototype.hasOwnProperty.call(obj, key);
	},

	isArray(arg: any) {
		if (Array.isArray) {
			return Array.isArray(arg);
		}
		return ObjectUtils.objectToString(arg) === '[object Array]';
	},
	isBoolean(arg: any) {
		return typeof arg === 'boolean';
	},
	isNull(arg: any) {
		return arg === null;
	},
	isNullOrUndefined(arg: any) {
		return arg == null || arg === undefined;
	},
	isNumber(arg: any) {
		return typeof arg === 'number';
	},
	isInt(value: any) {
		if (isNaN(value) || ObjectUtils.isString(value)) {
			return false;
		}
		const x = Number.parseFloat(value);
		return (x | 0) === x;
	},
	isString(arg: any) {
		return typeof arg === 'string';
	},
	isSymbol(arg: any) {
		return typeof arg === 'symbol';
	},
	isUndefined(arg: any) {
		return arg === void 0;
	},
	isRegExp(re: any) {
		return ObjectUtils.objectToString(re) === '[object RegExp]';
	},
	isObject(arg: any) {
		return typeof arg === 'object' && arg !== null;
	},
	isTrueObject(obj: any) {
		return toString.call(obj) === '[object Object]';
	},
	isDate(d: any) {
		return ObjectUtils.objectToString(d) === '[object Date]';
	},
	isError(e: any) {
		return ObjectUtils.objectToString(e) === '[object Error]' || e instanceof Error;
	},
	isFunction(arg: any) {
		return typeof arg === 'function';
	},
	isAsyncFcuntion(fn: any) {
		const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
		return fn instanceof AsyncFunction;
	},
	isPrimitive(arg: any) {
		return (
			arg === null ||
			typeof arg === 'boolean' ||
			typeof arg === 'number' ||
			typeof arg === 'string' ||
			typeof arg === 'symbol' || // ES6 symbol
			typeof arg === 'undefined'
		);
	},
	isBuffer(arg: any): any {
		return Buffer.isBuffer(arg);
	},

	// 把一个方法Promise化
	defer() {
		const deferred: any = {};
		deferred.promise = new Promise((resolve, reject) => {
			deferred.resolve = resolve;
			deferred.reject = reject;
		});
		return deferred;
	},

	extend(target: any = {}, ...args: any) {
		let i = 0;
		const length = args.length;
		let options: any;
		let name: any;
		let src: any;
		let copy: any;
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
				} else if (ObjectUtils.isTrueObject(copy)) {
					target[name] = ObjectUtils.extend(src && ObjectUtils.isTrueObject(src) ? src : {}, copy);
				} else {
					target[name] = copy;
				}
			}
		}
		return target;
	},

	isTrueEmpty(obj: any) {
		if (obj === undefined || obj === null || obj === '') return true;
		if (ObjectUtils.isNumber(obj) && isNaN(obj)) return true;
		return false;
	},
	isEmpty(obj: any) {
		if (ObjectUtils.isTrueEmpty(obj)) return true;
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
				return false && key; // only for eslint
			}
			return true;
		}
		return false;
	},

	omit(obj: any, props: any[] | string) {
		if (ObjectUtils.isString(props)) {
			props = (props as string).split(',');
		}
		const keys = Object.keys(obj);
		const result: any = {};
		for (const item of keys) {
			if (props.indexOf(item) === -1) {
				result[item] = obj[item];
			}
		}
		return result;
	},

	isShallowEqual(obj1: any, obj2: any): boolean {
		if (obj1 === obj2) return true;

		if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
			return false;
		}

		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		if (keys1.length !== keys2.length) return false;

		for (const key of keys1) {
			if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
				return false;
			}
		}

		return true;
	},
};
