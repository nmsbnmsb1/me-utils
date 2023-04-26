"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoUtils = void 0;
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
class CryptoUtils {
    static randomString(length = 8, options = {}) {
        let chars = '';
        let result = '';
        if (options === true) {
            chars = CryptoUtils.chars.join('');
        }
        else if (typeof options == 'string') {
            chars = options;
        }
        else {
            if (options.numbers !== false)
                chars += typeof options.numbers == 'string' ? options.numbers : CryptoUtils.chars[0];
            if (options.letters !== false)
                chars += typeof options.letters == 'string' ? options.letters : CryptoUtils.chars[1];
            if (options.specials)
                chars += typeof options.specials == 'string' ? options.specials : CryptoUtils.chars[2];
        }
        while (length > 0) {
            length--;
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }
    static md5(bytes, encoding = 'hex') {
        if (Array.isArray(bytes)) {
            bytes = Buffer.from(bytes);
        }
        else if (typeof bytes === 'string') {
            bytes = Buffer.from(bytes, 'utf8');
        }
        return crypto_1.default.createHash('md5').update(bytes).digest(encoding);
    }
    static sha256(bytes, encoding = 'hex') {
        if (Array.isArray(bytes)) {
            bytes = Buffer.from(bytes);
        }
        else if (typeof bytes === 'string') {
            bytes = Buffer.from(bytes, 'utf8');
        }
        return crypto_1.default.createHash('sha256').update(bytes).digest(encoding);
    }
    static uuid(version = 'v4', options = {}) {
        let id = '';
        if (version === 'v1')
            id = (0, uuid_1.v1)();
        else
            id = (0, uuid_1.v4)();
        if (options.removeDash == true)
            id = id.replace(/\-/g, '');
        if (options.lowerCase === true)
            id = id.toLowerCase();
        return id;
    }
}
CryptoUtils.chars = ['0123456789', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', '~!@#$%^*()_+-=[]{}|;:,./<>?'];
exports.CryptoUtils = CryptoUtils;
//# sourceMappingURL=CryptoUtils.js.map