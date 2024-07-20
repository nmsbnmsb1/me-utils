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

import { ObjectUtils } from './ObjectUtils';
import ms from 'ms';

export class TimeUtils {
	public static timeout(time: number = 1000) {
		return new Promise((resolve) => {
			setTimeout(resolve, time);
		});
	}

	public static async sleep(time: number) {
		await new Promise((resolve) => setTimeout(resolve, time));
	}

	public static datetime(date: Date | string = new Date(), format: string) {
		if (date && ObjectUtils.isString(date)) {
			const dateString = date as string;
			date = new Date(Date.parse(dateString));

			if (isNaN(date.getTime()) && !format) {
				format = dateString;
				date = new Date();
			}
		}
		format = format || 'YYYY-MM-DD HH:mm:ss';

		const fn = (d: number) => {
			return ('0' + d).slice(-2);
		};

		const d = new Date(date);
		const formats: any = {
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

	public static ms(time: any) {
		if (typeof time === 'number') return time;
		const result = ms(time);
		if (result === undefined) {
			throw new Error(`ms('${time}') result is undefined`);
		}
		return result;
	}
}
