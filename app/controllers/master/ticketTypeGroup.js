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
 * 券種グループマスタコントローラー
 * @namespace ticketType
 */
const chevre_domain_1 = require("@motionpicture/chevre-domain");
const Message = require("../../../common/Const/Message");
const TicketTypeGroupsModel_1 = require("../../models/Master/TicketTypeGroupsModel");
const masterBaseController = require("./base");
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
function list(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.staffUser === undefined) {
            next(new Error(Message.Common.unexpectedError));
            return;
        }
        const ticketTypeModel = new TicketTypeGroupsModel_1.default();
        // 券種グループマスタ画面遷移
        res.locals.displayId = 'Aa-8';
        res.locals.title = '券種グループマスタ一覧';
        res.render('master/ticketTypeGroup/index', {
            ticketTypeGroupsModel: ticketTypeModel,
            layout: 'layouts/master/layout'
        });
        return;
    });
}
exports.list = list;
/**
 * 新規登録
 * @function add
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
function add(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.staffUser === undefined) {
            next(new Error(Message.Common.unexpectedError));
            return;
        }
        let ticketTypeGroupsModel = new TicketTypeGroupsModel_1.default();
        if (req.method === 'GET') {
            renderDisplayAdd(res, ticketTypeGroupsModel, null);
            return;
        }
        try {
            // モデルに画面入力値をセット
            ticketTypeGroupsModel = req.body;
            // 検証
            const errors = validateFormAdd(req);
            const isValid = !errors;
            // 検証
            if (isValid) {
                // 券種グループDB登録プロセス
                const ticketType = yield processAddTicketTypeGroups(ticketTypeGroupsModel);
                if (ticketType) {
                    //ticketTypeModel.ticketNameJa = '';
                }
                // 券種グループマスタ画面遷移
                ticketTypeGroupsModel.message = Message.Common.add;
                renderDisplayAdd(res, ticketTypeGroupsModel, errors);
            }
            else {
                // 券種グループマスタ画面遷移
                renderDisplayAdd(res, ticketTypeGroupsModel, errors);
            }
        }
        catch (err) {
            next(err);
            return;
        }
    });
}
exports.add = add;
/**
 * 一覧データ取得API
 * @function getList
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
function getList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = {
            success: false,
            results: [],
            count: 0
        };
        if (req.staffUser === undefined) {
            res.json(result);
            return;
        }
        // 表示件数・表示ページ
        const limit = (req.query.limit) ? parseInt(req.query.limit, DEFAULT_RADIX) : DEFAULT_LINES;
        const page = (req.query.page) ? parseInt(req.query.page, DEFAULT_RADIX) : 1;
        // 券種グループコード
        const ticketGroupCode = (req.query.ticketGroupCode) ? req.query.ticketGroupCode : null;
        // 管理用券種グループ名
        const ticketGroupNameJa = (req.query.ticketGroupNameJa) ? req.query.ticketGroupNameJa : null;
        // 検索条件を作成
        const conditions = {};
        // 券種グループコード
        if (ticketGroupCode) {
            const key = '_id';
            conditions[key] = ticketGroupCode;
        }
        // 管理用券種グループ名
        if (ticketGroupNameJa) {
            conditions['name.ja'] = new RegExp('^' + ticketGroupNameJa);
        }
        try {
            const count = yield chevre_domain_1.Models.TicketTypeGroup.count(conditions).exec();
            if (count === 0) {
                result.success = true;
                res.json(result);
                return;
            }
            else {
                const data = yield findData(conditions, limit, page, count);
                res.json(data);
            }
        }
        catch (err) {
            res.json(result);
            return;
        }
    });
}
exports.getList = getList;
/**
 * 一覧データ取得
 * @function findData
 * @param {any} conditions
 * @param {number} limit
 * @param {number} page
 * @param {number} count
 * @returns {Promise<{}>}
 */
function findData(conditions, limit, page, count) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = {
            success: false,
            results: [],
            count: 0
        };
        try {
            const tickets = yield chevre_domain_1.Models.TicketTypeGroup.find(conditions)
                .skip(limit * (page - 1))
                .limit(limit)
                .lean(true)
                .exec();
            //検索結果編集
            const results = tickets.map((ticket) => {
                return {
                    _id: ticket._id,
                    ticketGroupCode: ticket._id,
                    ticketGroupNameJa: ticket.name.ja
                };
            });
            return {
                success: true,
                count: count,
                results: results
            };
        }
        catch (err) {
            return result;
        }
    });
}
exports.findData = findData;
/**
 * 券種グループDB登録プロセス
 * @function processAddTicketTypeGroups
 * @param {Response} res
 * @param {TicketTypeModel} ticketTypeModel
 * @returns {Promise<mongoose.Document>}
 */
function processAddTicketTypeGroups(ticketTypeGroupsModel) {
    return __awaiter(this, void 0, void 0, function* () {
        const digits = 6;
        const id = yield masterBaseController.getId('ticketTypeId', digits);
        // 券種グループDB登録
        return yield chevre_domain_1.Models.Film.create({
            _id: id,
            name: {
                ja: ticketTypeGroupsModel.ticketGroupNameJa,
                en: ''
            }
        });
    });
}
/**
 * 券種グループマスタ新規登録画面遷移
 * @function renderDisplayAdd
 * @param {TicketTypeGroupsModel} ticketTypeGroupsModel
 */
function renderDisplayAdd(res, ticketTypeGroupsModel, errors) {
    res.locals.displayId = 'Aa-7';
    res.locals.title = '券種グループマスタ新規登録';
    //券種マスタから取得???
    ticketTypeGroupsModel.listTargetTicketName = [
        { value: '01', text: '一般1800円' },
        { value: '02', text: '大・専1500円' },
        { value: '03', text: '高校生1000円' },
        { value: '04', text: '中・小1000円' },
        { value: '05', text: '幼児1000円' },
        { value: '06', text: 'シニア1100円' },
        { value: '07', text: '夫婦50割1100円' }
    ];
    res.render('master/ticketTypeGroup/add', {
        ticketTypeGroupsModel: ticketTypeGroupsModel,
        errors: errors,
        layout: 'layouts/master/layout'
    });
}
/**
 * 券種グループマスタ新規登録画面検証
 * @function validateFormAdd
 */
function validateFormAdd(req) {
    // 券種グループコード
    let colName = '券種グループコード';
    req.assert('ticketCode', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.assert('ticketCode', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_CODE });
    // サイト表示用券種グループ名
    colName = 'サイト表示用券種グループ名';
    req.assert('ticketNameJa', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.assert('ticketNameJa', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_NAME_JA });
    // 検証実行
    return req.validationErrors(true);
}
