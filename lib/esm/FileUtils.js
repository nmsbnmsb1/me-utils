import path from 'path';
import fs from 'fs';
import { ObjectUtils } from './ObjectUtils';
const fsRmdir = ObjectUtils.promisify(fs.rmdir, fs);
const fsUnlink = ObjectUtils.promisify(fs.unlink, fs);
const fsReaddir = ObjectUtils.promisify(fs.readdir, fs);
export class FileUtils {
    static isExist(dir) {
        dir = path.normalize(dir);
        try {
            fs.accessSync(dir, fs.constants.R_OK);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    static isFile(filePath) {
        if (!FileUtils.isExist(filePath))
            return false;
        try {
            const stat = fs.statSync(filePath);
            return stat.isFile();
        }
        catch (e) {
            return false;
        }
    }
    static isDirectory(filePath) {
        if (!FileUtils.isExist(filePath))
            return false;
        try {
            const stat = fs.statSync(filePath);
            return stat.isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    static chmod(p, mode) {
        try {
            fs.chmodSync(p, mode);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    static mkdir(dir, mode) {
        if (FileUtils.isExist(dir)) {
            if (mode)
                return FileUtils.chmod(dir, mode);
            return true;
        }
        const pp = path.dirname(dir);
        if (FileUtils.isExist(pp)) {
            try {
                fs.mkdirSync(dir, mode);
                if (mode)
                    FileUtils.chmod(dir, mode);
                return true;
            }
            catch (e) {
                return false;
            }
        }
        if (FileUtils.mkdir(pp, mode))
            return FileUtils.mkdir(dir, mode);
        return false;
    }
    static getdirFiles(dir, prefix = '') {
        dir = path.normalize(dir);
        if (!fs.existsSync(dir))
            return [];
        const files = fs.readdirSync(dir);
        let result = [];
        files.forEach((item) => {
            const currentDir = path.join(dir, item);
            const stat = fs.statSync(currentDir);
            if (stat.isFile()) {
                result.push(path.join(prefix, item));
            }
            else if (stat.isDirectory()) {
                const cFiles = FileUtils.getdirFiles(currentDir, path.join(prefix, item));
                result = result.concat(cFiles);
            }
        });
        return result;
    }
    static rmdir(p, reserve = false) {
        if (!FileUtils.isDirectory(p))
            return Promise.resolve();
        return fsReaddir(p).then((files) => {
            const promises = files.map((item) => {
                const filepath = path.join(p, item);
                if (FileUtils.isDirectory(filepath))
                    return FileUtils.rmdir(filepath, false);
                return fsUnlink(filepath);
            });
            return Promise.all(promises).then(() => {
                if (!reserve)
                    return fsRmdir(p);
            });
        });
    }
    static rm(p, reserve = false) {
        if (FileUtils.isDirectory(p))
            return Promise.resolve();
        return fsUnlink(p).then(() => {
            if (!reserve) {
                let dirname = path.dirname(p);
                let dirs = fs.readdirSync(dirname);
                if (dirs.length <= 0)
                    return fsUnlink(dirname);
            }
        });
    }
    static writeFile(p, data, options) {
        let mode;
        if (options && typeof options !== 'string' && options.mode !== undefined)
            mode = options.mode;
        FileUtils.mkdir(path.dirname(p), mode);
        fs.writeFileSync(p, data, options);
    }
    static readFile(p, options) {
        if (FileUtils.isExist(p)) {
            let buffer = fs.readFileSync(p, options);
            return buffer;
        }
        return '';
    }
    static readTxtFile(p, options) {
        let content = FileUtils.readFile(p, options);
        if (content)
            return content.toString();
        return content;
    }
}
//# sourceMappingURL=FileUtils.js.map