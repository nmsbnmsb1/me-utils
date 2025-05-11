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

// export const fsMkdir = ObjectUtils.promisify(fs.mkdir, fs);
// export const fsStat = ObjectUtils.promisify(fs.stat, fs);
// export const fsUnlink = ObjectUtils.promisify(fs.unlink, fs);
// export const fsRm = ObjectUtils.promisify(fs.rm, fs);
// export const fsReaddir = ObjectUtils.promisify(fs.readdir, fs);
// export const fsRename = ObjectUtils.promisify(fs.rename, fs);
// export const fsReadFile = ObjectUtils.promisify(fs.readFile, fs);
// export const fsWriteFile = ObjectUtils.promisify(fs.writeFile, fs);
const fnMap = new Map();
export const fsPromisify = (fn: any, ...args: any) => {
	let pfn = fnMap.get(fn);
	if (!pfn) {
		pfn = (...args: any) => {
			return new Promise((resolve, reject) => {
				fn.apply(fs, [
					...args,
					(err: any, res: any) => {
						//fs.exists API 会返回true
						if (err === true) {
							resolve(true);
						} else {
							!err ? resolve(res) : reject(err);
						}
					},
				]);
			});
		};
		fnMap.set(fn, pfn);
	}
	return pfn(...args);
};

export const FileUtils = {
	async isExist(p: string): Promise<boolean> {
		p = path.normalize(p);
		return new Promise((resolve) => fs.access(p, fs.constants.F_OK, (err) => resolve(!err)));
	},
	async isFile(filePath: string): Promise<boolean> {
		return new Promise((resolve) => {
			fs.stat(filePath, (err, stats) => resolve(err || !stats ? false : stats.isFile()));
		});
	},
	async isDirectory(dirPath: string): Promise<boolean> {
		return new Promise((resolve) => {
			fs.stat(dirPath, (err, stats) => {
				resolve(err || !stats ? false : stats.isDirectory());
			});
		});
	},
	//
	async chmod(p: fs.PathLike, mode: string | number): Promise<boolean> {
		return new Promise((resolve) => {
			fs.chmod(p, mode, (err) => resolve(!err));
		});
	},
	async mkdir(dir: string, mode?: string | number): Promise<boolean> {
		try {
			await fsPromisify(fs.mkdir, dir, { recursive: true });
		} catch (e) {
			return false;
		}
		//
		if (mode) await FileUtils.chmod(dir, mode);
		//
		return true;
	},
	async getdirFiles(dir: string, prefix = ''): Promise<string[]> {
		dir = path.normalize(dir);
		//
		let files: string[];
		try {
			files = (await fsPromisify(fs.readdir, dir)) as string[];
		} catch (e) {
			if (e.code === 'ENOENT') return [];
			throw e;
		}
		//
		const result: any[] = [];
		for (const item of files) {
			const currentDir = path.join(dir, item);
			const stat = (await fsPromisify(fs.stat, currentDir)) as fs.Stats;
			if (stat.isFile()) {
				result.push(path.join(prefix, item));
			} else if (stat.isDirectory()) {
				result.push(...(await FileUtils.getdirFiles(currentDir, path.join(prefix, item))));
			}
		}
		return result;
	},
	//处理文件名
	getCharCodeLength(charCode: number) {
		if (charCode <= 0x007f) return 1;
		if (charCode <= 0x07ff) return 2;
		if (charCode <= 0xffff) return 3;
		return 4;
	},
	getPathNameLength(pathName: string) {
		let total = 0;
		for (let i = 0, len = pathName.length; i < len; i++) {
			total += FileUtils.getCharCodeLength(pathName.charCodeAt(i));
		}
		return total;
	},
	truncatePathName(fileName: string, maxLength = 180) {
		//最多maxLength个字节
		let ns = '';
		let total = 0;
		for (let i = 0, len = fileName.length; i < len; i++) {
			let add = FileUtils.getCharCodeLength(fileName.charCodeAt(i));
			if (total + add <= maxLength) {
				ns += fileName.charAt(i);
				total += add;
			} else {
				break;
			}
		}
		return ns;
	},
	//移动文件/文件夹
	async unlink(p: string) {
		try {
			await fsPromisify(fs.unlink, p);
		} catch (e) {
			return false;
		}
		return true;
	},
	async rmdir(p: string, reserve = false): Promise<boolean> {
		if (!(await FileUtils.isDirectory(p))) return false;
		//
		let rm = async (dirPath: string, reserve: boolean) => {
			let files = (await fsPromisify(fs.readdir, dirPath)) as string[];
			for (let item of files) {
				let filepath = path.join(dirPath, item);
				if (await FileUtils.isDirectory(filepath)) {
					await rm(filepath, false);
				} else {
					await fsPromisify(fs.unlink, filepath);
				}
			}
			if (!reserve) await fsPromisify(fs.rm, dirPath, { recursive: true, force: true });
		};
		await rm(p, reserve);
		//
		return true;
	},
	async rename(
		src: string, //可能是文件或者文件夹
		dest: string,
		existsPolicy: 'replace' | 'rename' | 'raiseExecption' | 'mergeReplace' | 'mergeRename' | 'mergeRaiseExecption',
		options: { srcExists: boolean; destIsFile: boolean } = {} as any
	): Promise<string | undefined> {
		//如果来源和目标相同
		if (src === dest) return dest;
		//如果src不存在，则直接退出
		if (options.srcExists === undefined && !(await FileUtils.isExist(src))) return;
		//如果目标位置不存在，直接移动即可
		if (!(await FileUtils.isExist(dest))) {
			const destParent = path.dirname(dest);
			await FileUtils.mkdir(destParent, 0o777);
			await fsPromisify(fs.rename, src, dest);
			return dest;
		}
		//dest路径已存在
		if (existsPolicy === 'raiseExecption') throw new Error(`${dest} is exists`);
		if (options.destIsFile === undefined) options.destIsFile = await FileUtils.isFile(dest);
		if (existsPolicy === 'replace') {
			await (options.destIsFile ? FileUtils.unlink(dest) : FileUtils.rmdir(dest));
			await fsPromisify(fs.rename, src, dest);
			return dest;
		}
		if (existsPolicy === 'rename') {
			let descNew = '';
			let destParent = path.dirname(dest);
			let destName = path.basename(dest);
			let descExt = options.destIsFile ? path.extname(dest) : '';
			let descCounter = 1;
			while (true) {
				descNew = path.join(destParent, `${destName}_${`${descCounter}`.padStart(2, '0')}${descExt}`);
				if (!(await FileUtils.isExist(descNew))) break;
				descCounter++;
			}
			await fsPromisify(fs.rename, src, descNew);
			return descNew;
		}
		//只有文件夹才能合并
		if (!options.destIsFile && existsPolicy.startsWith('merge')) {
			let fileExistsPolicy: any = existsPolicy.replace('merge', '');
			fileExistsPolicy = `${fileExistsPolicy[0].toLowerCase()}${fileExistsPolicy.substring(1)}`;
			const fileRenameOptions = { srcExists: true, destIsFile: true };
			const all = [];
			for (const srcFile of await FileUtils.getdirFiles(src)) {
				all.push(
					FileUtils.rename(path.join(src, srcFile), path.join(dest, srcFile), fileExistsPolicy, fileRenameOptions)
				);
			}
			await Promise.all(all);
			//删除原始文件夹
			await FileUtils.rmdir(src, false);
			//
			return dest;
		}
	},
	//文件读写
	async writeFile(p: string, data: any, options?: fs.WriteFileOptions) {
		let mode: any;
		if (options && typeof options !== 'string' && options.mode !== undefined) mode = options.mode;
		await FileUtils.mkdir(path.dirname(p), mode);
		await fsPromisify(fs.writeFile, p, data, options);
	},
	async writeJSONFile(p: string, data: any, jsonSpace?: number, options?: fs.WriteFileOptions) {
		return FileUtils.writeFile(p, JSON.stringify(data, undefined, jsonSpace), options);
	},
	async readFile(p: string, options?: { encoding?: null; flag?: string }): Promise<any> {
		return fsPromisify(fs.readFile, p, options);
	},
	async readTxtFile(p: string, options?: { encoding?: null; flag?: string }) {
		return (await fsPromisify(fs.readFile, p, options)).toString();
	},
	async readJSONFile(p: string, options?: { encoding?: null; flag?: string }): Promise<any> {
		const content = (await fsPromisify(fs.readFile, p, options)).toString();
		return content ? JSON.parse(content) : undefined;
	},
};
