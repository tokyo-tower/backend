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
            res.render('master/performance/', {
                theaters: theaters,
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
 * @function search
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
            }).populate('film', 'name').exec();
            res.json({
                performances: performances,
                screens: screens
            });
            return;
        }
        catch (err) {
            debug('search error', err);
            res.json(null);
            return;
        }
    });
}
exports.search = search;
/**
 * 作品検索
 * @function filmSearch
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function filmSearch(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.body.id;
            const film = yield chevre_domain_1.Models.Film.findById(id).exec();
            res.json({
                film: film
            });
            return;
        }
        catch (err) {
            debug('filmSearch error', err);
            res.json(null);
            return;
        }
    });
}
exports.filmSearch = filmSearch;
/**
 * 新規登録
 * @function regist
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function regist(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const theater = yield chevre_domain_1.Models.Theater.findById(req.body.theater).exec();
            const screen = yield chevre_domain_1.Models.Screen.findById(req.body.screen).exec();
            yield chevre_domain_1.Models.Performance.create({
                theater: req.body.theater,
                screen: req.body.screen,
                film: req.body.film,
                day: req.body.day,
                open_time: req.body.openTime,
                start_time: req.body.startTime,
                end_time: req.body.endTime,
                theater_name: theater.get('name'),
                screen_name: screen.get('name')
            });
            res.json({
                error: null
            });
            return;
        }
        catch (err) {
            debug('regist error', err);
            res.json({
                error: err.message
            });
            return;
        }
    });
}
exports.regist = regist;
/**
 * 更新
 * @function update
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function update(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.body.performance;
            yield chevre_domain_1.Models.Performance.findByIdAndUpdate(id, {
                screen: req.body.screen,
                open_time: req.body.openTime,
                start_time: req.body.startTime,
                end_time: req.body.endTime
            }).exec();
            res.json({
                error: null
            });
            return;
        }
        catch (err) {
            debug('update error', err);
            res.json({
                error: err.message
            });
            return;
        }
    });
}
exports.update = update;
//# sourceMappingURL=performance.js.map