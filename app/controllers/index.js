/**
 * インデックスコントローラー
 *
 * @namespace controller/index
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const debug = createDebug('chevre-backend:controllers:index');
function index(req, res, next) {
    debug('query:', req.query);
    if (req.query.next !== undefined) {
        next(new Error(req.param('next')));
        return;
    }
    res.render('index', { layout: false });
}
exports.index = index;
