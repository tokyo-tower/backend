"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @namespace performance
 * @desc パフォーマンスマスタコントローラー
 */
const chevre_domain_1 = require("@motionpicture/chevre-domain");
const createDebug = require("debug");
const moment = require("moment");
const debug = createDebug('chevre-backend:controllers:performance');
/**
 * パフォーマンスマスタ管理表示
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function index(_, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('パフォーマンスマスタ管理表示');
        try {
            const theaters = yield chevre_domain_1.Models.Theater.find().exec();
            if (theaters.length === 0) {
                throw new Error('not theaters');
            }
            const films = yield chevre_domain_1.Models.Film.find().exec();
            if (theaters.length === 0) {
                throw new Error('not theaters');
            }
            if (films.length === 0) {
                throw new Error('not theaters');
            }
            res.render('master/performance/', {
                theaters: theaters,
                films: JSON.stringify(films),
                moment: moment,
                layout: 'layouts/master/layout'
            });
            return;
        }
        catch (err) {
            next(err);
            return;
        }
    });
}
exports.index = index;
/**
 * パフォーマンス検索
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function search(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const theater = req.body.theater;
            const day = req.body.day;
            const screens = yield chevre_domain_1.Models.Screen.find({
                theater: theater
            }).exec();
            const performances = yield chevre_domain_1.Models.Performance.find({
                theater: theater,
                day: day
            }).exec();
            res.json({
                performances: performances,
                screens: screens
            });
            return;
        }
        catch (err) {
            res.json(null);
            return;
        }
    });
}
exports.search = search;
//# sourceMappingURL=performance.js.map