"use strict";
/**
 * 券種グループマスタコントローラー
 *
 * @namespace controller/master/ticketType
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ttts = require("@motionpicture/ttts-domain");
const _ = require("underscore");
const Message = require("../../../common/Const/Message");
// 基数
const DEFAULT_RADIX = 10;
// 1ページに表示するデータ数
const DEFAULT_LINES = 10;
// 券種グループコード 半角64
const NAME_MAX_LENGTH_CODE = 64;
// 券種グループ名・日本語 全角64
const NAME_MAX_LENGTH_NAME_JA = 64;
/**
 * 一覧
 * @function list
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function index(__, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // 券種グループマスタ画面遷移
        res.render('master/ticketTypeGroup/index', {
            message: '',
            layout: 'layouts/master/layout'
        });
    });
}
exports.index = index;
/**
 * 新規登録
 * @function add
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function add(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let message = '';
        let errors = {};
        if (req.method === 'POST') {
            // バリデーション
            validate(req);
            const validatorResult = yield req.getValidationResult();
            errors = req.validationErrors(true);
            if (validatorResult.isEmpty()) {
                // 券種グループDB登録
                try {
                    const id = req.body._id;
                    const docs = {
                        _id: id,
                        name: {
                            ja: req.body.nameJa,
                            en: ''
                        },
                        ticket_types: req.body.ticketTypes
                    };
                    yield ttts.Models.TicketTypeGroup.create(docs);
                    message = '登録完了';
                    res.redirect(`/master/ticketTypeGroups/${id}/update`);
                }
                catch (error) {
                    message = error.message;
                }
            }
        }
        // 券種マスタから取得
        const ticketTypes = yield ttts.Models.TicketType.find().exec();
        const forms = {
            _id: (_.isEmpty(req.body._id)) ? '' : req.body._id,
            nameJa: (_.isEmpty(req.body.nameJa)) ? '' : req.body.nameJa,
            ticketTypes: (_.isEmpty(req.body.ticketTypes)) ? [] : req.body.ticketTypes,
            descriptionJa: (_.isEmpty(req.body.descriptionJa)) ? '' : req.body.descriptionJa
        };
        res.render('master/ticketTypeGroup/add', {
            message: message,
            errors: errors,
            ticketTypes: ticketTypes,
            layout: 'layouts/master/layout',
            forms: forms
        });
    });
}
exports.add = add;
/**
 * 編集
 * @function update
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function update(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let message = '';
        let errors = {};
        const id = req.params.id;
        if (req.method === 'POST') {
            // バリデーション
            validate(req);
            const validatorResult = yield req.getValidationResult();
            errors = req.validationErrors(true);
            if (validatorResult.isEmpty()) {
                // 券種グループDB登録
                try {
                    // 券種グループDB登録
                    const updateData = {
                        name: {
                            ja: req.body.nameJa,
                            en: ''
                        },
                        ticket_types: req.body.ticketTypes
                    };
                    yield ttts.Models.TicketTypeGroup.findByIdAndUpdate(id, updateData).exec();
                    message = '編集完了';
                }
                catch (error) {
                    message = error.message;
                }
            }
        }
        // 券種マスタから取得
        const ticketTypes = yield ttts.Models.TicketType.find().exec();
        // 券種グループ取得
        const ticketGroup = yield ttts.Models.TicketTypeGroup.findById(id).exec();
        let forms = {};
        if (ticketGroup !== null) {
            forms = {
                _id: (_.isEmpty(req.body._id)) ? ticketGroup.get('_id') : req.body._id,
                nameJa: (_.isEmpty(req.body.nameJa)) ? ticketGroup.get('name').ja : req.body.nameJa,
                ticketTypes: (_.isEmpty(req.body.ticketTypes)) ? ticketGroup.get('ticket_types') : req.body.ticketTypes,
                descriptionJa: (_.isEmpty(req.body.descriptionJa)) ? ticketGroup.get('descriptionJa') : req.body.descriptionJa
            };
        }
        res.render('master/ticketTypeGroup/update', {
            message: message,
            errors: errors,
            ticketTypes: ticketTypes,
            layout: 'layouts/master/layout',
            forms: forms
        });
    });
}
exports.update = update;
/**
 * 一覧データ取得API
 * @function getList
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // 表示件数・表示ページ
        const limit = (!_.isEmpty(req.query.limit)) ? parseInt(req.query.limit, DEFAULT_RADIX) : DEFAULT_LINES;
        const page = (!_.isEmpty(req.query.page)) ? parseInt(req.query.page, DEFAULT_RADIX) : 1;
        // 券種グループコード
        const ticketGroupCode = (!_.isEmpty(req.query.ticketGroupCode)) ? req.query.ticketGroupCode : null;
        // 管理用券種グループ名
        const ticketGroupNameJa = (!_.isEmpty(req.query.ticketGroupNameJa)) ? req.query.ticketGroupNameJa : null;
        // 検索条件を作成
        const conditions = {};
        // 券種グループコード
        if (ticketGroupCode !== null) {
            const key = '_id';
            conditions[key] = ticketGroupCode;
        }
        // 管理用券種グループ名
        if (ticketGroupNameJa !== null) {
            conditions['name.ja'] = { $regex: ticketGroupNameJa };
        }
        try {
            const count = yield ttts.Models.TicketTypeGroup.count(conditions).exec();
            let results = [];
            if (count > 0) {
                const ticketTypeGroups = yield ttts.Models.TicketTypeGroup.find(conditions)
                    .skip(limit * (page - 1))
                    .limit(limit)
                    .exec();
                //検索結果編集
                results = ticketTypeGroups.map((ticketTypeGroup) => {
                    return {
                        _id: ticketTypeGroup._id,
                        ticketGroupCode: ticketTypeGroup._id,
                        ticketGroupNameJa: ticketTypeGroup.get('name').ja
                    };
                });
            }
            res.json({
                success: true,
                count: count,
                results: results
            });
        }
        catch (err) {
            res.json({
                success: false,
                count: 0,
                results: []
            });
        }
    });
}
exports.getList = getList;
/**
 * 券種グループマスタ新規登録画面検証
 * @function validateFormAdd
 */
function validate(req) {
    // 券種グループコード
    let colName = '券種グループコード';
    req.checkBody('_id', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.checkBody('_id', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_CODE });
    // サイト表示用券種グループ名
    colName = 'サイト表示用券種グループ名';
    req.checkBody('nameJa', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.checkBody('nameJa', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_NAME_JA });
}
