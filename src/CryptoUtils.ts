import { md5 } from 'js-md5';
import { sha256 } from 'js-sha256';
import { v1, v4 } from 'uuid';

export class CryptoUtils {
	/**
	 * 生成随机字符串
	 * https://github.com/maichong/string-random
	 */
	private static chars = ['0123456789', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', '~!@#$%^*()_+-=[]{}|;:,./<>?'];
	public static randomString(
		length: number = 8,
		options: true | string | { numbers?: boolean | string; letters?: boolean | string; specials?: boolean | string } = {}
	) {
		let chars = '';
		let result = '';

		if (options === true) {
			chars = CryptoUtils.chars.join('');
		} else if (typeof options == 'string') {
			chars = options;
		} else {
			if (options.numbers !== false) chars += typeof options.numbers == 'string' ? options.numbers : CryptoUtils.chars[0];
			if (options.letters !== false) chars += typeof options.letters == 'string' ? options.letters : CryptoUtils.chars[1];
			if (options.specials) chars += typeof options.specials == 'string' ? options.specials : CryptoUtils.chars[2];
		}

		while (length > 0) {
			length--;
			result += chars[Math.floor(Math.random() * chars.length)];
		}
		return result;
	}

	//
	public static md5(bytes: any, encoding: any = 'hex') {
		// if (Array.isArray(bytes)) {
		// 	bytes = Buffer.from(bytes);
		// } else if (typeof bytes === 'string') {
		// 	bytes = Buffer.from(bytes, 'utf8');
		// }
		// return crypto.createHash('md5').update(bytes).digest(encoding);
		return md5(bytes);
	}
	public static sha256(bytes: any, encoding: any = 'hex') {
		// if (Array.isArray(bytes)) {
		// 	bytes = Buffer.from(bytes);
		// } else if (typeof bytes === 'string') {
		// 	bytes = Buffer.from(bytes, 'utf8');
		// }
		// return crypto.createHash('sha256').update(bytes).digest(encoding);
		return sha256(bytes);
	}

	//
	public static uuid(options?: { version?: string; removeDash?: boolean; lowerCase?: boolean }) {
		let ver = options && options.version ? options.version : 'v4';
		let id = '';
		if (ver === 'v1') id = v1();
		else id = v4();
		//
		if (options && options.removeDash == true) id = id.replace(/\-/g, '');
		if (options && options.lowerCase === true) id = id.toLowerCase();
		//
		return id;
	}
}
