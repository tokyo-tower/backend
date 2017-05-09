"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basicAuth = require("basic-auth");
const createDebug = require("debug");
const http_status_1 = require("http-status");
const debug = createDebug('ttts-backend:middlewares:basicAuth');
/**
 * ベーシック認証ミドルウェア
 */
exports.default = (req, res, next) => {
    // ベーシック認証のための環境変数設定なければスルー
    if (process.env.TTTS_BACKEND_BASIC_AUTH_NAME === undefined || process.env.TTTS_BACKEND_BASIC_AUTH_PASS === undefined) {
        next();
        return;
    }
    const user = basicAuth(req);
    if (user !== undefined
        && user.name === process.env.TTTS_BACKEND_BASIC_AUTH_NAME
        && user.pass === process.env.TTTS_BACKEND_BASIC_AUTH_PASS) {
        debug('authenticated!');
        // 認証情報が正しければOK
        next();
        return;
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="ttts-backend Authentication"');
    res.status(http_status_1.UNAUTHORIZED).end('Unauthorized');
};
