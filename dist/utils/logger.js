"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static info(message, data) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
    }
    static error(message, error) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    }
    static warn(message, data) {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
    }
    static debug(message, data) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map