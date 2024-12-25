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

import fs from 'node:fs';
import path from 'node:path';
import { ObjectUtils } from './ObjectUtils';

const fsRmdir = ObjectUtils.promisify(fs.rmdir, fs);
const fsUnlink = ObjectUtils.promisify(fs.unlink, fs);
const fsReaddir = ObjectUtils.promisify(fs.readdir, fs);

export const FileUtils = {
	isExist(dir: string) {
		dir = path.normalize(dir);
		try {
			fs.accessSync(dir, fs.constants.R_OK);
			return true;
		} catch (e) {
			return false;
		}
	},
	isFile(filePath: string) {
		if (!FileUtils.isExist(filePath)) return false;
		try {
			const stat = fs.statSync(filePath);
			return stat.isFile();
		} catch (e) {
			return false;
		}
	},
	isDirectory(filePath: string) {
		if (!FileUtils.isExist(filePath)) return false;
		try {
			const stat = fs.statSync(filePath);
			return stat.isDirectory();
		} catch (e) {
			return false;
		}
	},

	chmod(p: fs.PathLike, mode: string | number) {
		try {
			fs.chmodSync(p, mode);
			return true;
		} catch (e) {
			return false;
		}
	},

	mkdir(dir: string, mode?: string | number): boolean {
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
	},

	getdirFiles(dir: string, prefix = '') {
		dir = path.normalize(dir);
		if (!fs.existsSync(dir)) return [];
		const files = fs.readdirSync(dir);
		let result: any[] = [];
		for (const item of files) {
			const currentDir = path.join(dir, item);
			const stat = fs.statSync(currentDir);
			if (stat.isFile()) {
				result.push(path.join(prefix, item));
			} else if (stat.isDirectory()) {
				const cFiles = FileUtils.getdirFiles(currentDir, path.join(prefix, item));
				result = result.concat(cFiles);
			}
		}
		return result;
	},

	rmdir(p: string, reserve: any = false) {
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
	},

	rm(p: string, reserve: any = false) {
		if (FileUtils.isDirectory(p)) return Promise.resolve();
		return fsUnlink(p).then(() => {
			if (!reserve) {
				const dirname = path.dirname(p);
				const dirs = fs.readdirSync(dirname);
				if (dirs.length <= 0) return fsUnlink(dirname);
			}
		});
	},

	writeFile(p: string, data: any, options?: fs.WriteFileOptions) {
		let mode: any;
		if (options && typeof options !== 'string' && options.mode !== undefined) mode = options.mode;
		FileUtils.mkdir(path.dirname(p), mode);
		fs.writeFileSync(p, data, options);
	},
	writeJSONFile(p: string, data: any, jsonSpace?: number, options?: fs.WriteFileOptions) {
		FileUtils.writeFile(p, JSON.stringify(data, undefined, jsonSpace), options);
	},

	readFile(p: string, options?: { encoding?: null; flag?: string }) {
		return fs.readFileSync(p, options);
	},
	readTxtFile(p: string, options?: { encoding?: null; flag?: string }) {
		return fs.readFileSync(p, options).toString();
	},
	readJSONFile(p: string, options?: { encoding?: null; flag?: string }) {
		const content = fs.readFileSync(p, options).toString();
		return content ? JSON.parse(content) : undefined;
	},
};
