"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeUtils = void 0;
const ObjectUtils_1 = require("./ObjectUtils");
const ms_1 = __importDefault(require("ms"));
class TimeUtils {
    static timeout(time = 1000) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }
    static async sleep(time) {
        await new Promise((resolve) => setTimeout(resolve, time));
    }
    static datetime(date = new Date(), format) {
        if (date && ObjectUtils_1.ObjectUtils.isString(date)) {
            const dateString = date;
            date = new Date(Date.parse(dateString));
            if (isNaN(date.getTime()) && !format) {
                format = dateString;
                date = new Date();
            }
        }
        format = format || 'YYYY-MM-DD HH:mm:ss';
        const fn = (d) => {
            return ('0' + d).slice(-2);
        };
        const d = new Date(date);
        const formats = {
            YYYY: d.getFullYear(),
            MM: fn(d.getMonth() + 1),
            DD: fn(d.getDate()),
            HH: fn(d.getHours()),
            mm: fn(d.getMinutes()),
            ss: fn(d.getSeconds()),
        };
        return format.replace(/([a-z])\1+/gi, (a) => {
            return formats[a] || a;
        });
    }
    static ms(time) {
        if (typeof time === 'number')
            return time;
        const result = (0, ms_1.default)(time);
        if (result === undefined) {
            throw new Error(`ms('${time}') result is undefined`);
        }
        return result;
    }
}
exports.TimeUtils = TimeUtils;
//# sourceMappingURL=TimeUtils.js.map