"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = exports.sendResponse = void 0;
const sendResponse = (res, statusCode, message, data, error) => {
    return res.status(statusCode).json({
        success: statusCode < 400,
        message,
        data,
        error,
        timestamp: new Date().toISOString(),
    });
};
exports.sendResponse = sendResponse;
const sendSuccess = (res, message, data, statusCode = 200) => {
    return (0, exports.sendResponse)(res, statusCode, message, data);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, error) => {
    return (0, exports.sendResponse)(res, statusCode, message, undefined, error);
};
exports.sendError = sendError;
//# sourceMappingURL=response.js.map