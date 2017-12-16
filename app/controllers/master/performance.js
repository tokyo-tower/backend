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
const ttts = require("@motionpicture/ttts-domain");
const createDebug = require("debug");
const moment = require("moment");
const debug = createDebug('ttts-backend:controllers:performance');
/**
 * パフォーマンスマスタ管理表示
 * @memberof performance
 * @function index
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function index(_, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const theaters = yield ttts.Models.Theater.find().exec();
            if (theaters.length === 0) {
                throw new Error('not theaters');
            }
            res.render('master/performance/', {
                theaters: theaters,
                moment: moment,
                layout: 'layouts/master/layout'
            });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.index = index;
/**
 * パフォーマンス検索
 * @memberof performance
 * @function search
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function search(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            searchValidation(req);
            const validatorResult = yield req.getValidationResult();
            const validations = req.validationErrors(true);
            if (!validatorResult.isEmpty()) {
                res.json({
                    validation: validations,
                    error: null
                });
                return;
            }
            const theater = req.body.theater;
            const day = req.body.day;
            const screens = yield ttts.Models.Screen.find({
                theater: theater
            }).exec();
            const performanceRepo = new ttts.repository.Performance(ttts.mongoose.connection);
            const performances = yield performanceRepo.performanceModel.find({
                theater: theater,
                day: day
            }).populate('film', 'name').exec();
            const ticketGroups = yield ttts.Models.TicketTypeGroup.find().exec();
            res.json({
                validation: null,
                error: null,
                performances: performances,
                screens: screens,
                ticketGroups: ticketGroups
            });
        }
        catch (err) {
            debug('search error', err);
            res.json({
                validation: null,
                error: err.message
            });
        }
    });
}
exports.search = search;
/**
 * 作品検索
 * @memberof performance
 * @function filmSearch
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function filmSearch(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            filmSearchValidation(req);
            const validatorResult = yield req.getValidationResult();
            const validations = req.validationErrors(true);
            if (!validatorResult.isEmpty()) {
                res.json({
                    validation: validations,
                    error: null
                });
                return;
            }
            const id = req.body.id;
            const film = yield ttts.Models.Film.findById(id).exec();
            res.json({
                validation: null,
                error: null,
                film: film
            });
        }
        catch (err) {
            debug('filmSearch error', err);
            res.json({
                validation: null,
                error: err.message
            });
        }
    });
}
exports.filmSearch = filmSearch;
/**
 * 新規登録
 * @memberof performance
 * @function regist
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function regist(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            addValidation(req);
            const validatorResult = yield req.getValidationResult();
            const validations = req.validationErrors(true);
            if (!validatorResult.isEmpty()) {
                res.json({
                    validation: validations,
                    error: null
                });
                return;
            }
            const theater = yield ttts.Models.Theater.findById(req.body.theater).exec();
            const screen = yield ttts.Models.Screen.findById(req.body.screen).exec();
            const docs = {
                theater: req.body.theater,
                screen: req.body.screen,
                film: req.body.film,
                day: req.body.day,
                open_time: req.body.openTime,
                start_time: req.body.startTime,
                end_time: req.body.endTime,
                ticket_type_group: req.body.ticketTypeGroup,
                theater_name: (theater !== null) ? theater.get('name') : '',
                screen_name: (screen !== null) ? screen.get('name') : ''
            };
            const performanceRepo = new ttts.repository.Performance(ttts.mongoose.connection);
            yield performanceRepo.performanceModel.create(docs);
            res.json({
                validation: null,
                error: null
            });
        }
        catch (err) {
            debug('regist error', err);
            res.json({
                validation: null,
                error: err.message
            });
        }
    });
}
exports.regist = regist;
/**
 * 更新
 * @memberof performance
 * @function update
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function update(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            updateValidation(req);
            const validatorResult = yield req.getValidationResult();
            const validations = req.validationErrors(true);
            if (!validatorResult.isEmpty()) {
                res.json({
                    validation: validations,
                    error: null
                });
                return;
            }
            const id = req.body.performance;
            const updateData = {
                screen: req.body.screen,
                ticket_type_group: req.body.ticketTypeGroup,
                open_time: req.body.openTime,
                start_time: req.body.startTime,
                end_time: req.body.endTime
            };
            const performanceRepo = new ttts.repository.Performance(ttts.mongoose.connection);
            yield performanceRepo.performanceModel.findByIdAndUpdate(id, updateData).exec();
            res.json({
                validation: null,
                error: null
            });
        }
        catch (err) {
            debug('update error', err);
            res.json({
                validation: null,
                error: err.message
            });
        }
    });
}
exports.update = update;
/**
 * 検索バリデーション
 * @function searchValidation
 * @param {Request} req
 * @returns {void}
 */
function searchValidation(req) {
    req.checkBody('theater', '作品が未選択です').notEmpty();
    req.checkBody('day', '上映日が未選択です').notEmpty();
}
/**
 * 作品検索バリデーション
 * @function filmSearchValidation
 * @param {Request} req
 * @returns {void}
 */
function filmSearchValidation(req) {
    req.checkBody('id', '作品Idが未選択です').notEmpty();
}
/**
 * 新規登録バリデーション
 * @function addValidation
 * @param {Request} req
 * @returns {void}
 */
function addValidation(req) {
    req.checkBody('film', '作品が未選択です').notEmpty();
    req.checkBody('day', '上映日が未選択です').notEmpty();
    req.checkBody('openTime', '開場時間が未選択です').notEmpty();
    req.checkBody('startTime', '開始時間が未選択です').notEmpty();
    req.checkBody('endTime', '終了時間が未選択です').notEmpty();
    req.checkBody('screen', 'スクリーンが未選択です').notEmpty();
    req.checkBody('ticketTypeGroup', '券種グループが未選択です').notEmpty();
}
/**
 * 編集バリデーション
 * @function updateValidation
 * @param {Request} req
 * @returns {void}
 */
function updateValidation(req) {
    req.checkBody('performance', 'パフォーマンスが未選択です').notEmpty();
    req.checkBody('openTime', '開場時間が未選択です').notEmpty();
    req.checkBody('startTime', '開始時間が未選択です').notEmpty();
    req.checkBody('endTime', '終了時間が未選択です').notEmpty();
    req.checkBody('screen', 'スクリーンが未選択です').notEmpty();
    req.checkBody('ticketTypeGroup', '券種グループが未選択です').notEmpty();
}
