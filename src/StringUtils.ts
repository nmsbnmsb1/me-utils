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

const numberReg = /^((-?(\d+\.|\d+|\.\d)\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;

export class StringUtils {
	public static camelCase(str: string) {
		if (str.indexOf('_') > -1) {
			str = str.replace(/_(\w)/g, (a, b) => {
				return b.toUpperCase();
			});
		}
		return str;
	}

	public static snakeCase(str: string) {
		return str.replace(/([^A-Z])([A-Z])/g, function ($0, $1, $2) {
			return $1 + '_' + $2.toLowerCase();
		});
	}

	public static isNumberString(obj: string) {
		if (!obj) return false;
		return numberReg.test(obj);
	}

	// public static escapeHtml(str: string) {
	//     return (str + '').replace(/[<>'"]/g, a => {
	//         switch (a) {
	//             case '<':
	//                 return '&lt;';
	//             case '>':
	//                 return '&gt;';
	//             case '"':
	//                 return '&quote;';
	//             case '\'':
	//                 return '&#39;';
	//         }
	//     });
	// }
}
