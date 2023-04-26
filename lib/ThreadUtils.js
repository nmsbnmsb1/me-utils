"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadUtils = void 0;
const cluster_1 = __importDefault(require("cluster"));
class ThreadUtils {
}
ThreadUtils.isMaster = cluster_1.default.isMaster;
exports.ThreadUtils = ThreadUtils;
//# sourceMappingURL=ThreadUtils.js.map