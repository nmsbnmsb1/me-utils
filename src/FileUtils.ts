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

import path from 'path';
import fs from 'fs';
import { ObjectUtils } from './ObjectUtils';

const fsRmdir = ObjectUtils.promisify(fs.rmdir, fs);
const fsUnlink = ObjectUtils.promisify(fs.unlink, fs);
const fsReaddir = ObjectUtils.promisify(fs.readdir, fs);

export class FileUtils {
	public static isExist(dir: string) {
		dir = path.normalize(dir);
		try {
			fs.accessSync(dir, fs.constants.R_OK);
			return true;
		} catch (e) {
			return false;
		}
	}

	public static isFile(filePath: string) {
		if (!FileUtils.isExist(filePath)) return false;
		try {
			const stat = fs.statSync(filePath);
			return stat.isFile();
		} catch (e) {
			return false;
		}
	}

	public static isDirectory(filePath: string) {
		if (!FileUtils.isExist(filePath)) return false;
		try {
			const stat = fs.statSync(filePath);
			return stat.isDirectory();
		} catch (e) {
			return false;
		}
	}

	public static chmod(p: fs.PathLike, mode: string | number) {
		try {
			fs.chmodSync(p, mode);
			return true;
		} catch (e) {
			return false;
		}
	}

	public static mkdir(dir: string, mode?: string | number): boolean {
		if (FileUtils.isExist(dir)) {
			if (mode) return FileUtils.chmod(dir, mode);
			return true;
		}
		const pp = path.dirname(dir);
		if (FileUtils.isExist(pp)) {
			try {
				fs.mkdirSync(dir, mode);
				if (mode) FileUtils.chmod(dir, mode);
				return true;
			} catch (e) {
				return false;
			}
		}
		if (FileUtils.mkdir(pp, mode)) return FileUtils.mkdir(dir, mode);
		return false;
	}

	public static getdirFiles(dir: string, prefix = '') {
		dir = path.normalize(dir);
		if (!fs.existsSync(dir)) return [];
		const files = fs.readdirSync(dir);
		let result: any[] = [];
		files.forEach((item) => {
			const currentDir = path.join(dir, item);
			const stat = fs.statSync(currentDir);
			if (stat.isFile()) {
				result.push(path.join(prefix, item));
			} else if (stat.isDirectory()) {
				const cFiles = FileUtils.getdirFiles(currentDir, path.join(prefix, item));
				result = result.concat(cFiles);
			}
		});
		return result;
	}

	public static rmdir(p: string, reserve: any = false) {
		if (!FileUtils.isDirectory(p)) return Promise.resolve();
		return fsReaddir(p).then((files: any) => {
			const promises = files.map((item: any) => {
				const filepath = path.join(p, item);
				if (FileUtils.isDirectory(filepath)) return FileUtils.rmdir(filepath, false);
				return fsUnlink(filepath);
			});
			return Promise.all(promises).then(() => {
				if (!reserve) return fsRmdir(p);
			});
		});
	}

	public static rm(p: string, reserve: any = false) {
		if (FileUtils.isDirectory(p)) return Promise.resolve();
		return fsUnlink(p).then(() => {
			if (!reserve) {
				let dirname = path.dirname(p);
				let dirs = fs.readdirSync(dirname);
				if (dirs.length <= 0) return fsUnlink(dirname);
			}
		});
	}

	public static writeFile(p: string, data: any, options?: fs.WriteFileOptions) {
		let mode;
		if (options && typeof options !== 'string' && options.mode !== undefined) mode = options.mode;
		FileUtils.mkdir(path.dirname(p), mode);
		fs.writeFileSync(p, data, options);
	}
	public static writeJSONFile(p: string, data: any, jsonSpace?: number, options?: fs.WriteFileOptions) {
		FileUtils.writeFile(p, JSON.stringify(data, undefined, jsonSpace), options);
	}

	public static readFile(p: string, options?: { encoding?: null; flag?: string }) {
		return fs.readFileSync(p, options);
	}
	public static readTxtFile(p: string, options?: { encoding?: null; flag?: string }) {
		return fs.readFileSync(p, options).toString();
	}
	public static readJSONFile(p: string, options?: { encoding?: null; flag?: string }) {
		let content = fs.readFileSync(p, options).toString();
		return content ? JSON.parse(content) : undefined;
	}
}
