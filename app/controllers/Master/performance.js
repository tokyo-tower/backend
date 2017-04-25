"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @namespace performance
 * @desc パフォーマンスマスタコントローラー
 */
const createDebug = require("debug");
const debug = createDebug('chevre-backend:controllers:performance');
/**
 * パフォーマンスマスタ管理表示
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
function index(_req, res, _next) {
    debug('パフォーマンスマスタ管理表示');
    res.render('master/performance/', { layout: 'layouts/master/layout' });
}
exports.index = index;
//# sourceMappingURL=performance.js.map