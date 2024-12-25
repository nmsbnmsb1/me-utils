import { md5 } from 'js-md5';
import { sha256 } from 'js-sha256';
import { v1, v4 } from 'uuid';

/**
 * 生成随机字符串
 * https://github.com/maichong/string-random
 */
// biome-ignore format: 分开列出
const CHARS = [
	'0123456789',
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	'~!@#$%^*()_+-=[]{}|;:,./<>?',
];

export const CryptoUtils = {
	randomString(
		length = 8,
		options:
			| true
			| string
			| {
					numbers?: boolean | string;
					letters?: boolean | string;
					specials?: boolean | string;
			  } = {}
	) {
		let chars = '';
		let result = '';

		if (options === true) {
			chars = CHARS.join('');
		} else if (typeof options === 'string') {
			chars = options;
		} else {
			if (options.numbers !== false) chars += typeof options.numbers === 'string' ? options.numbers : CHARS[0];
			if (options.letters !== false) chars += typeof options.letters === 'string' ? options.letters : CHARS[1];
			if (options.specials) chars += typeof options.specials === 'string' ? options.specials : CHARS[2];
		}

		while (length > 0) {
			length--;
			result += chars[Math.floor(Math.random() * chars.length)];
		}
		return result;
	},

	//
	md5(bytes: string | number[] | ArrayBuffer | Uint8Array, encoding = 'hex') {
		// if (Array.isArray(bytes)) {
		// 	bytes = Buffer.from(bytes);
		// } else if (typeof bytes === 'string') {
		// 	bytes = Buffer.from(bytes, 'utf8');
		// }
		// return crypto.createHash('md5').update(bytes).digest(encoding);
		return md5(bytes);
	},
	sha256(bytes: string | number[] | ArrayBuffer | Uint8Array, encoding = 'hex') {
		// if (Array.isArray(bytes)) {
		// 	bytes = Buffer.from(bytes);
		// } else if (typeof bytes === 'string') {
		// 	bytes = Buffer.from(bytes, 'utf8');
		// }
		// return crypto.createHash('sha256').update(bytes).digest(encoding);
		return sha256(bytes);
	},

	//
	uuid(options?: {
		version?: string;
		removeDash?: boolean;
		lowerCase?: boolean;
	}) {
		const ver = options?.version || 'v4';
		let id = '';
		if (ver === 'v1') id = v1();
		else id = v4();
		//
		if (options?.removeDash === true) id = id.replace(/\-/g, '');
		if (options?.lowerCase === true) id = id.toLowerCase();
		//
		return id;
	},
};
