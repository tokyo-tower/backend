"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const masterAdmin_1 = require("../models/user/masterAdmin");
const debug = createDebug('chevre-backend:middlewares:userAuthentication');
/**
 * ユーザー認証ミドルウェア
 */
exports.default = (req, res, next) => {
    res.locals.req = req;
    req.staffUser = masterAdmin_1.default.PARSE(req.session);
    debug('req.staffUser:', req.staffUser);
    next();
};
