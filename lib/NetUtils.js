"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetUtils = void 0;
const net_1 = __importDefault(require("net"));
class NetUtils {
}
exports.NetUtils = NetUtils;
NetUtils.isIP = net_1.default.isIP;
NetUtils.isIPv4 = net_1.default.isIPv4;
NetUtils.isIPv6 = net_1.default.isIPv6;
//# sourceMappingURL=NetUtils.js.map