"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
const numberReg = /^((-?(\d+\.|\d+|\.\d)\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
class StringUtils {
    static camelCase(str) {
        if (str.indexOf('_') > -1) {
            str = str.replace(/_(\w)/g, (a, b) => {
                return b.toUpperCase();
            });
        }
        return str;
    }
    static snakeCase(str) {
        return str.replace(/([^A-Z])([A-Z])/g, function ($0, $1, $2) {
            return $1 + '_' + $2.toLowerCase();
        });
    }
    static isNumberString(obj) {
        if (!obj)
            return false;
        return numberReg.test(obj);
    }
    static fillZero(s, bits) {
        s = s.toString();
        while (s.length < bits)
            s = `0${s}`;
        return s;
    }
}
exports.StringUtils = StringUtils;
//# sourceMappingURL=StringUtils.js.map