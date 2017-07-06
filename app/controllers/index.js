"use strict";
/**
 * インデックスコントローラー
 *
 * @namespace controller/index
 */
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const http_status_1 = require("http-status");
const debug = createDebug('ttts-backend:controllers:index');
function index(req, res, next) {
    debug('query:', req.query);
    if (req.query.next !== undefined) {
        next(new Error(req.param('next')));
        return;
    }
    //res.redirect(MOVED_PERMANENTLY, 'master/films');
    res.redirect(http_status_1.MOVED_PERMANENTLY, 'master/report');
}
exports.index = index;
