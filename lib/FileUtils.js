"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ObjectUtils_1 = require("./ObjectUtils");
const fsRmdir = ObjectUtils_1.ObjectUtils.promisify(fs_1.default.rmdir, fs_1.default);
const fsUnlink = ObjectUtils_1.ObjectUtils.promisify(fs_1.default.unlink, fs_1.default);
const fsReaddir = ObjectUtils_1.ObjectUtils.promisify(fs_1.default.readdir, fs_1.default);
class FileUtils {
    static isExist(dir) {
        dir = path_1.default.normalize(dir);
        try {
            fs_1.default.accessSync(dir, fs_1.default.constants.R_OK);
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
            const stat = fs_1.default.statSync(filePath);
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
            const stat = fs_1.default.statSync(filePath);
            return stat.isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    static chmod(p, mode) {
        try {
            fs_1.default.chmodSync(p, mode);
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
        const pp = path_1.default.dirname(dir);
        if (FileUtils.isExist(pp)) {
            try {
                fs_1.default.mkdirSync(dir, mode);
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
        dir = path_1.default.normalize(dir);
        if (!fs_1.default.existsSync(dir))
            return [];
        const files = fs_1.default.readdirSync(dir);
        let result = [];
        files.forEach((item) => {
            const currentDir = path_1.default.join(dir, item);
            const stat = fs_1.default.statSync(currentDir);
            if (stat.isFile()) {
                result.push(path_1.default.join(prefix, item));
            }
            else if (stat.isDirectory()) {
                const cFiles = FileUtils.getdirFiles(currentDir, path_1.default.join(prefix, item));
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
                const filepath = path_1.default.join(p, item);
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
                let dirname = path_1.default.dirname(p);
                let dirs = fs_1.default.readdirSync(dirname);
                if (dirs.length <= 0)
                    return fsUnlink(dirname);
            }
        });
    }
    static writeFile(p, data, options) {
        let mode;
        if (options && typeof options !== 'string' && options.mode !== undefined)
            mode = options.mode;
        FileUtils.mkdir(path_1.default.dirname(p), mode);
        fs_1.default.writeFileSync(p, data, options);
    }
    static writeJSONFile(p, data, jsonSpace, options) {
        FileUtils.writeFile(p, JSON.stringify(data, undefined, jsonSpace), options);
    }
    static readFile(p, options) {
        return fs_1.default.readFileSync(p, options);
    }
    static readTxtFile(p, options) {
        return fs_1.default.readFileSync(p, options).toString();
    }
    static readJSONFile(p, options) {
        let content = fs_1.default.readFileSync(p, options).toString();
        return content ? JSON.parse(content) : undefined;
    }
}
exports.FileUtils = FileUtils;
//# sourceMappingURL=FileUtils.js.map