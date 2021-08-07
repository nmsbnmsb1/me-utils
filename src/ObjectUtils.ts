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

export class ObjectUtils {
	public static objectToString(o: any) {
		return Object.prototype.toString.call(o);
	}

	public static hasOwn(obj: any, key: any) {
		return Object.prototype.hasOwnProperty.call(obj, key);
	}

	public static isArray(arg: any) {
		if (Array.isArray) {
			return Array.isArray(arg);
		}
		return ObjectUtils.objectToString(arg) === '[object Array]';
	}

	public static isBoolean(arg: any) {
		return typeof arg === 'boolean';
	}

	public static isNull(arg: any) {
		return arg === null;
	}

	public static isNullOrUndefined(arg: any) {
		return arg == null || arg == undefined;
	}

	public static isNumber(arg: any) {
		return typeof arg === 'number';
	}

	public static isInt(value: any) {
		if (isNaN(value) || ObjectUtils.isString(value)) {
			return false;
		}
		var x = parseFloat(value);
		return (x | 0) === x;
	}

	public static isString(arg: any) {
		return typeof arg === 'string';
	}

	public static isSymbol(arg: any) {
		return typeof arg === 'symbol';
	}

	public static isUndefined(arg: any) {
		return arg === void 0;
	}

	public static isRegExp(re: any) {
		return ObjectUtils.objectToString(re) === '[object RegExp]';
	}

	public static isObject(arg: any) {
		return typeof arg === 'object' && arg !== null;
	}

	public static isTrueObject(obj: any) {
		return toString.call(obj) === '[object Object]';
	}

	public static isDate(d: any) {
		return ObjectUtils.objectToString(d) === '[object Date]';
	}

	public static isError(e: any) {
		return ObjectUtils.objectToString(e) === '[object Error]' || e instanceof Error;
	}

	public static isFunction(arg: any) {
		return typeof arg === 'function';
	}

	public static isAsyncFcuntion(fn: any) {
		const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
		return fn instanceof AsyncFunction;
	}

	public static isPrimitive(arg: any) {
		return (
			arg === null ||
			typeof arg === 'boolean' ||
			typeof arg === 'number' ||
			typeof arg === 'string' ||
			typeof arg === 'symbol' || // ES6 symbol
			typeof arg === 'undefined'
		);
	}

	public static isBuffer(arg: any) {
		return Buffer.isBuffer(arg);
	}

	// 把一个方法Promise化
	public static promisify(fn: any, receiver: any) {
		return (...args: any) => {
			return new Promise((resolve, reject) => {
				fn.apply(receiver, [
					...args,
					(err: any, res: any) => {
						return err ? reject(err) : resolve(res);
					},
				]);
			});
		};
	}

	public static extend(target = {}, ...args: any) {
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
				} else if (ObjectUtils.isTrueObject(copy)) {
					target[name] = ObjectUtils.extend(src && ObjectUtils.isTrueObject(src) ? src : {}, copy);
				} else {
					target[name] = copy;
				}
			}
		}
		return target;
	}

	public static isTrueEmpty(obj: any) {
		if (obj === undefined || obj === null || obj === '') return true;
		if (ObjectUtils.isNumber(obj) && isNaN(obj)) return true;
		return false;
	}

	public static isEmpty(obj: any) {
		if (ObjectUtils.isTrueEmpty(obj)) return true;
		if (ObjectUtils.isRegExp(obj)) {
			return false;
		} else if (ObjectUtils.isDate(obj)) {
			return false;
		} else if (ObjectUtils.isError(obj)) {
			return false;
		} else if (ObjectUtils.isArray(obj)) {
			return obj.length === 0;
		} else if (ObjectUtils.isString(obj)) {
			return obj.length === 0;
		} else if (ObjectUtils.isNumber(obj)) {
			return obj === 0;
		} else if (ObjectUtils.isBoolean(obj)) {
			return !obj;
		} else if (ObjectUtils.isObject(obj)) {
			for (const key in obj) {
				return false && key; // only for eslint
			}
			return true;
		}
		return false;
	}

	public static defer() {
		const deferred: any = {};
		deferred.promise = new Promise((resolve, reject) => {
			deferred.resolve = resolve;
			deferred.reject = reject;
		});
		return deferred;
	}

	public static omit(obj: any, props: any[] | string) {
		if (ObjectUtils.isString(props)) {
			props = (props as string).split(',');
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
