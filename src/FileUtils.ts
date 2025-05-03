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

// const fsRmdir = ObjectUtils.promisify(fs.rmdir, fs);
// const fsUnlink = ObjectUtils.promisify(fs.unlink, fs);
// const fsReaddir = ObjectUtils.promisify(fs.readdir, fs);

export const FileUtils = {
	isExist(p: string) {
		p = path.normalize(p);
		try {
			fs.accessSync(p, fs.constants.R_OK);
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
	isDirectory(dirPath: string) {
		if (!FileUtils.isExist(dirPath)) return false;
		try {
			const stat = fs.statSync(dirPath);
			return stat.isDirectory();
		} catch (e) {
			return false;
		}
	},
	//
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
	chmod(p: fs.PathLike, mode: string | number) {
		try {
			fs.chmodSync(p, mode);
			return true;
		} catch (e) {
			return false;
		}
	},
	getdirFiles(dir: string, prefix = '') {
		dir = path.normalize(dir);
		if (!fs.existsSync(dir)) return [];
		let files = fs.readdirSync(dir);
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
	rename(
		src: string, //可能是文件或者文件夹
		dest: string,
		existsPolicy: 'replace' | 'rename' | 'raiseExecption' | 'mergeReplace' | 'mergeRename' | 'mergeRaiseExecption',
		options: { srcExists: boolean; destIsFile: boolean } = {} as any
	) {
		//如果来源和目标相同
		if (src === dest) return dest;
		//如果src不存在，则直接退出
		if (options.srcExists === undefined && !FileUtils.isExist(src)) return;
		//如果目标位置不存在，直接移动即可
		if (!FileUtils.isExist(dest)) {
			let destParent = path.dirname(dest);
			if (!FileUtils.isExist(destParent)) FileUtils.mkdir(destParent, 0o777);
			fs.renameSync(src, dest);
			return dest;
		}
		//dest路径已存在
		if (existsPolicy === 'raiseExecption') throw new Error(`${dest} is exists`);
		if (options.destIsFile === undefined) options.destIsFile = FileUtils.isFile(dest);
		if (existsPolicy === 'replace') {
			fs.rmSync(dest, { recursive: true, force: true });
			fs.renameSync(src, dest);
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
				if (!FileUtils.isExist(descNew)) break;
				descCounter++;
			}
			fs.renameSync(src, descNew);
			return descNew;
		}
		//只有文件夹才能合并
		if (!options.destIsFile && existsPolicy.startsWith('merge')) {
			let fileExistsPolicy: any = existsPolicy.replace('merge', '');
			fileExistsPolicy = `${fileExistsPolicy[0].toLowerCase()}${fileExistsPolicy.substring(1)}`;
			let fileRenameOptions = { srcExists: true, destIsFile: true };
			for (let srcFile of FileUtils.getdirFiles(src)) {
				FileUtils.rename(path.join(src, srcFile), path.join(dest, srcFile), fileExistsPolicy, fileRenameOptions);
			}
			//删除原始文件夹
			fs.rmSync(src, { recursive: true, force: true });
			//
			return dest;
		}
	},
	//删除
	rm(p: string, reserve: any = false) {
		if (FileUtils.isDirectory(p)) return;
		fs.unlinkSync(p);
		if (!reserve) {
			let dirname = path.dirname(p);
			if (fs.readdirSync(dirname).length <= 0) {
				fs.unlinkSync(dirname);
			}
		}
	},
	rmdir(p: string, reserve: any = false) {
		if (!FileUtils.isDirectory(p)) return;
		fs.readdirSync(p).map((item: any) => {
			let filepath = path.join(p, item);
			if (FileUtils.isDirectory(filepath)) {
				FileUtils.rmdir(filepath, false);
			} else {
				fs.unlinkSync(filepath);
			}
		});
		if (!reserve) return fs.rmdirSync(p);
	},
	//文件读写
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
