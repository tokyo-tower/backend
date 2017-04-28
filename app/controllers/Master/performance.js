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
 * @memberof performance
 * @function search
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function search(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        searchValidation(req);
        const validatorResult = yield req.getValidationResult();
        const validations = req.validationErrors(true);
        if (!validatorResult.isEmpty()) {
            res.json({
                validation: validations,
                error: null
            });
        }
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
            const ticketGroups = yield chevre_domain_1.Models.TicketTypeGroup.find();
            res.json({
                validation: null,
                error: null,
                performances: performances,
                screens: screens,
                ticketGroups: ticketGroups
            });
            return;
        }
        catch (err) {
            debug('search error', err);
            res.json({
                validation: null,
                error: err.message
            });
            return;
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
        filmSearchValidation(req);
        const validatorResult = yield req.getValidationResult();
        const validations = req.validationErrors(true);
        if (!validatorResult.isEmpty()) {
            res.json({
                validation: validations,
                error: null
            });
        }
        try {
            const id = req.body.id;
            const film = yield chevre_domain_1.Models.Film.findById(id).exec();
            res.json({
                validation: null,
                error: null,
                film: film
            });
            return;
        }
        catch (err) {
            debug('filmSearch error', err);
            res.json({
                validation: null,
                error: err.message
            });
            return;
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
        addValidation(req);
        const validatorResult = yield req.getValidationResult();
        const validations = req.validationErrors(true);
        if (!validatorResult.isEmpty()) {
            res.json({
                validation: validations,
                error: null
            });
        }
        try {
            const theater = yield chevre_domain_1.Models.Theater.findById(req.body.theater).exec();
            const screen = yield chevre_domain_1.Models.Screen.findById(req.body.screen).exec();
            const docs = {
                theater: req.body.theater,
                screen: req.body.screen,
                film: req.body.film,
                day: req.body.day,
                open_time: req.body.openTime,
                start_time: req.body.startTime,
                end_time: req.body.endTime,
                ticket_type_group: req.body.ticketTypeGroup,
                theater_name: theater.get('name'),
                screen_name: screen.get('name')
            };
            yield chevre_domain_1.Models.Performance.create(docs);
            res.json({
                validation: null,
                error: null
            });
            return;
        }
        catch (err) {
            debug('regist error', err);
            res.json({
                validation: null,
                error: err.message
            });
            return;
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
        updateValidation(req);
        const validatorResult = yield req.getValidationResult();
        const validations = req.validationErrors(true);
        if (!validatorResult.isEmpty()) {
            res.json({
                validation: validations,
                error: null
            });
        }
        try {
            const id = req.body.performance;
            const update = {
                screen: req.body.screen,
                ticket_type_group: req.body.ticketTypeGroup,
                open_time: req.body.openTime,
                start_time: req.body.startTime,
                end_time: req.body.endTime
            };
            yield chevre_domain_1.Models.Performance.findByIdAndUpdate(id, update).exec();
            res.json({
                validation: null,
                error: null
            });
            return;
        }
        catch (err) {
            debug('update error', err);
            res.json({
                validation: null,
                error: err.message
            });
            return;
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
    req.checkBody('券種グループ', '券種グループが未選択です').notEmpty();
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
    req.checkBody('券種グループ', '券種グループが未選択です').notEmpty();
}
