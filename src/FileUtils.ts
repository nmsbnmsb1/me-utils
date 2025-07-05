import type fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';

export const FileUtils = {
	//获取文件类型
	async getFileType(
		p: string,
		resolveSymlink = false
	): Promise<
		| 'not-exist'
		| 'symlink'
		| 'symlink-not-exist'
		| 'symlink-file'
		| 'symlink-directory'
		| 'symlink-socket'
		| 'symlink-fifo'
		| 'symlink-character-device'
		| 'symlink-block-device'
		| 'symlink-unknown'
		| 'file'
		| 'directory'
		| 'socket'
		| 'fifo'
		| 'character-device'
		| 'block-device'
		| 'unknown'
	> {
		try {
			const stats = await fsPromises.lstat(p);

			// 如果是符号链接
			if (stats.isSymbolicLink()) {
				if (!resolveSymlink) return 'symlink';
				// 如果需要跟踪符号链接，获取目标文件的信息
				try {
					const targetStats = await fsPromises.stat(p);
					if (targetStats.isFile()) return 'symlink-file';
					if (targetStats.isDirectory()) return 'symlink-directory';
					if (targetStats.isSocket()) return 'symlink-socket';
					if (targetStats.isFIFO()) return 'symlink-fifo';
					if (targetStats.isCharacterDevice()) return 'symlink-character-device';
					if (targetStats.isBlockDevice()) return 'symlink-block-device';
					return 'symlink-unknown';
				} catch (err) {
					if (err.code === 'ENOENT') return 'symlink-not-exist';
					throw err;
				}
			}

			// 如果不是符号链接，直接返回文件类型

			if (stats.isFile()) return 'file';
			if (stats.isDirectory()) return 'directory';
			if (stats.isSocket()) return 'socket';
			if (stats.isFIFO()) return 'fifo';
			if (stats.isCharacterDevice()) return 'character-device';
			if (stats.isBlockDevice()) return 'block-device';
			return 'unknown';
		} catch (err) {
			if (err.code === 'ENOENT') return 'not-exist';
			throw err;
		}
	},
	async isSymLink(p: string): Promise<boolean | null> {
		let fileType = await FileUtils.getFileType(p, false);
		if (fileType === 'not-exist') return null;
		if (fileType === 'symlink') return true;
		return false;
	},
	async isFile(p: string, resolveSymlink = true): Promise<boolean | null> {
		let fileType = await FileUtils.getFileType(p, true);
		if (fileType === 'not-exist') return null;
		if (fileType === 'symlink-not-exist') return resolveSymlink ? null : false;
		if (fileType === 'file') return true;
		//biome-ignore lint/complexity/noUselessTernary:
		if (fileType === 'symlink-file') return resolveSymlink ? true : false;
		return false;
	},
	async isDirectory(p: string, resolveSymlink = true): Promise<boolean | null> {
		let fileType = await FileUtils.getFileType(p, true);
		if (fileType === 'not-exist') return null;
		if (fileType === 'symlink-not-exist') return resolveSymlink ? null : false;
		if (fileType === 'directory') return true;
		//biome-ignore lint/complexity/noUselessTernary:
		if (fileType === 'symlink-directory') return resolveSymlink ? true : false;
		return false;
	},
	async isExist(p: string, resolveSymlink = true): Promise<boolean> {
		let fileType = await FileUtils.getFileType(p, true);
		if (fileType === 'not-exist') return false;
		//biome-ignore lint/complexity/noUselessTernary:
		if (fileType === 'symlink-not-exist') return resolveSymlink ? false : true;
		return true;
	},
	//
	async chmod(p: string, mode: string | number): Promise<boolean> {
		try {
			await fsPromises.chmod(p, mode);
			return true;
		} catch (e) {}
		return false;
	},
	async mkdir(p: string, mode?: string | number): Promise<boolean> {
		try {
			await fsPromises.mkdir(p, { recursive: true });
		} catch (e) {
			return false;
		}
		//
		if (mode) await FileUtils.chmod(p, mode);
		//
		return true;
	},
	async getdirFiles(
		p: string,
		prefix = '',
		ignores: any = undefined,
		maxDepth = Number.POSITIVE_INFINITY,
		depth = 1
	): Promise<string[]> {
		let files: string[];
		try {
			files = await fsPromises.readdir(p);
		} catch (e) {
			if (e.code === 'ENOENT') return [];
			throw e;
		}
		//
		let result: string[] = [];
		for (let f of files) {
			let currentDir = path.join(p, f);
			let stat = await fsPromises.lstat(currentDir);
			if (stat.isDirectory()) {
				if (depth < maxDepth) {
					result.push(...(await FileUtils.getdirFiles(currentDir, path.join(prefix, f), ignores, maxDepth, depth + 1)));
				}
			} else {
				if (ignores?.length) {
					let shouldIgnore = false;
					for (let ignore of ignores) {
						if (typeof ignore === 'string') {
							if (f === ignore || f.endsWith(ignore)) {
								shouldIgnore = true;
								break;
							}
						} else if (ignore instanceof RegExp) {
							if (ignore.test(f)) {
								shouldIgnore = true;
								break;
							}
						}
					}
					if (shouldIgnore) continue;
				}
				result.push(path.join(prefix, f));
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
	//删除文件/文件夹
	async rm(p: string, rmEmptyDirOnly = false): Promise<boolean> {
		const fileType = await this.getFileType(p, false);

		// 1. 目录 & 只删空目录 模式
		if (fileType === 'directory' && rmEmptyDirOnly) {
			try {
				// rmdir 只会删除空目录，目录非空则抛 ENOTEMPTY
				await fsPromises.rmdir(p);
				return true;
			} catch (err: any) {
				// 删除失败（可能非空、权限等），都返回 false
				return false;
			}
		}

		// 2. 其它情况：文件、链接，或递归强制删除目录
		try {
			await fsPromises.rm(p, { recursive: true, force: true });
			return true;
		} catch (err: any) {
			return false;
		}
	},
	async rename(
		src: string, //可能是文件或者文件夹
		dest: string,
		existsPolicy: 'replace' | 'rename' | 'raiseExecption' | 'mergeReplace' | 'mergeRename' | 'mergeRaiseExecption',
		{ srcType, destType }: { srcType: any; destType: any } = {} as any
	): Promise<string | undefined> {
		//如果来源和目标相同
		if (src === dest) return dest;
		//如果src不存在，则直接退出
		if (srcType === undefined) srcType = await FileUtils.getFileType(src, false);
		if (srcType === 'not-exist') return;
		//如果目标位置不存在，直接移动即可
		if (destType === undefined) destType = await FileUtils.getFileType(dest, false);
		if (destType === 'not-exist') {
			await FileUtils.mkdir(path.dirname(dest), 0o777);
			await fsPromises.rename(src, dest);
			return dest;
		}
		//dest路径已存在
		if (existsPolicy === 'raiseExecption') throw new Error(`${dest} is exists`);
		if (existsPolicy === 'replace') {
			await FileUtils.rm(dest, false);
			await fsPromises.rename(src, dest);
			return dest;
		}
		if (existsPolicy === 'rename') {
			let descNew = '';
			//
			let destPathObject = path.parse(dest);
			let destCombinds = [];
			if (srcType !== 'directory') {
				destCombinds[0] = `${destPathObject.name}`;
				destCombinds[2] = `${destPathObject.ext}`;
			} else {
				destCombinds[0] = `${destPathObject.base}`;
			}
			let descCounter = 1;
			while (true) {
				destCombinds[1] = `_${`${descCounter}`.padStart(2, '0')}`;
				descNew = path.join(destPathObject.dir, destCombinds.join(''));
				if (!(await FileUtils.isExist(descNew))) break;
				descCounter++;
			}
			await fsPromises.rename(src, descNew);
			return descNew;
		}
		//
		if (srcType === 'directory' && srcType === destType && existsPolicy.startsWith('merge')) {
			let fileExistsPolicy: any = existsPolicy.replace('merge', '');
			fileExistsPolicy = `${fileExistsPolicy[0].toLowerCase()}${fileExistsPolicy.substring(1)}`;
			//
			for (let file of await fsPromises.readdir(src)) {
				let srcPath = path.resolve(src, file);
				let destPath = path.resolve(dest, file);
				let options = {
					srcType: await FileUtils.getFileType(srcPath),
					destType: await FileUtils.getFileType(destPath),
				};
				let policy = fileExistsPolicy;
				if (options.srcType === 'directory' && options.srcType === options.destType) policy = existsPolicy;
				//console.log(srcPath, destPath, policy, options);
				await FileUtils.rename(srcPath, destPath, policy, options);
			}
			//删除原始文件夹
			await FileUtils.rm(src, false);
			//
			return dest;
		}
	},
	//文件读写
	async writeFile(p: string, data: any, options?: fs.WriteFileOptions) {
		let mode: any;
		if (options && typeof options !== 'string' && options.mode !== undefined) mode = options.mode;
		await FileUtils.mkdir(path.dirname(p), mode);
		await fsPromises.writeFile(p, data, options);
	},
	async writeJSONFile(p: string, data: any, jsonSpace?: number, options?: fs.WriteFileOptions) {
		return FileUtils.writeFile(p, JSON.stringify(data, undefined, jsonSpace), options);
	},
	async readFile(p: string, options?: { encoding?: null; flag?: string }): Promise<any> {
		return fsPromises.readFile(p, options);
	},
	async readTxtFile(p: string, options?: { encoding?: null; flag?: string }) {
		return (await fsPromises.readFile(p, options)).toString();
	},
	async readJSONFile(p: string, options?: { encoding?: null; flag?: string }): Promise<any> {
		const content = (await fsPromises.readFile(p, options)).toString();
		return content ? JSON.parse(content) : undefined;
	},
};
