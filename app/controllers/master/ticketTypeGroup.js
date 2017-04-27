"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chevre_domain_1 = require("@motionpicture/chevre-domain");
const Message = require("../../../common/Const/Message");
const TicketTypeGroupsModel_1 = require("../../models/Master/TicketTypeGroupsModel");
const base_1 = require("./base");
// 基数
const DEFAULT_RADIX = 10;
// 1ページに表示するデータ数
const DEFAULT_LINES = 10;
// 券種グループコード 半角64
const NAME_MAX_LENGTH_CODE = 64;
// 券種グループ名・日本語 全角64
const NAME_MAX_LENGTH_NAME_JA = 64;
/**
 * 券種グループマスタコントローラー
 *
 * @export
 * @class ticketTypeController
 * @extends {MasterBaseController}
 */
class TicketTypeGroupsController extends base_1.default {
    constructor() {
        super(...arguments);
        this.layout = 'layouts/master/layout';
    }
    /**
     * 新規登録
     */
    add() {
        if (!this.req.staffUser) {
            this.next(new Error(Message.Common.unexpectedError));
            return;
        }
        let ticketTypeGroupsModel = new TicketTypeGroupsModel_1.default();
        if (this.req.method === 'POST') {
            // モデルに画面入力値をセット
            ticketTypeGroupsModel = this.parseModel(ticketTypeGroupsModel);
            // 検証
            const errors = this.validateFormAdd();
            const isValid = !errors;
            // 検証
            if (isValid) {
                // 券種グループDB登録プロセス
                this.processAddTicketTypeGroups(ticketTypeGroupsModel, (addErr, ticketType) => {
                    if (ticketType) {
                        //ticketTypeModel.ticketNameJa = '';
                    }
                    if (addErr) {
                        // エラー画面遷移
                        this.next(addErr);
                    }
                    else {
                        // 券種グループマスタ画面遷移
                        ticketTypeGroupsModel.message = Message.Common.add;
                        this.renderDisplayAdd(ticketTypeGroupsModel, errors);
                    }
                });
            }
            else {
                // 券種グループマスタ画面遷移
                this.renderDisplayAdd(ticketTypeGroupsModel, errors);
            }
        }
        else {
            // 券種グループマスタ画面遷移
            this.renderDisplayAdd(ticketTypeGroupsModel, null);
        }
    }
    /**
     * 一覧データ取得API
     */
    getList() {
        if (!this.req.staffUser) {
            this.next(new Error(Message.Common.unexpectedError));
            return;
        }
        // 表示件数・表示ページ
        const limit = (this.req.query.limit) ? parseInt(this.req.query.limit, DEFAULT_RADIX) : DEFAULT_LINES;
        const page = (this.req.query.page) ? parseInt(this.req.query.page, DEFAULT_RADIX) : 1;
        // 券種グループコード
        const ticketGroupCode = (this.req.query.ticketGroupCode) ? this.req.query.ticketGroupCode : null;
        // 管理用券種グループ名
        const ticketGroupNameJa = (this.req.query.ticketGroupNameJa) ? this.req.query.ticketGroupNameJa : null;
        // 検索条件を作成
        const conditions = {};
        // 券種グループコード
        if (ticketGroupCode) {
            const key = '_id';
            conditions[key] = ticketGroupCode;
        }
        // 管理用券種グループ名
        if (ticketGroupNameJa) {
            conditions['name.ja'] = base_1.default.getRegxForwardMatching(ticketGroupNameJa);
        }
        const result = {
            success: false,
            results: [],
            count: 0
        };
        chevre_domain_1.Models.TicketTypeGroup.count(conditions, (err, count) => {
            if (err) {
                this.res.json(result);
            }
            else {
                if (count === 0) {
                    result.success = true;
                    this.res.json(result);
                }
                else {
                    this.findData(conditions, limit, page, count);
                }
            }
        });
    }
    /**
     * 一覧データ取得
     *
     * @param {any} conditions
     * @param {number} limit
     * @param {number} page
     * @param {number} count
     */
    findData(conditions, limit, page, count) {
        const result = {
            success: false,
            results: [],
            count: 0
        };
        chevre_domain_1.Models.TicketTypeGroup.find(conditions)
            .skip(limit * (page - 1))
            .limit(limit)
            .lean(true)
            .exec((findErr, tickets) => {
            if (findErr) {
                this.res.json(result);
            }
            else {
                //検索結果編集
                const results = tickets.map((ticket) => {
                    return {
                        _id: ticket._id,
                        ticketGroupCode: ticket._id,
                        ticketGroupNameJa: ticket.name.ja
                    };
                });
                this.res.json({
                    success: true,
                    count: count,
                    results: results
                });
            }
        });
    }
    /**
     * 一覧
     */
    list() {
        if (!this.req.staffUser) {
            this.next(new Error(Message.Common.unexpectedError));
            return;
        }
        const ticketTypeModel = new TicketTypeGroupsModel_1.default();
        if (this.req.method !== 'POST') {
            // 券種グループマスタ画面遷移
            this.renderDisplayList(ticketTypeModel);
        }
    }
    /**
     * 券種グループDB登録プロセス
     *
     * @param {TicketTypeModel} ticketTypeModel
     */
    processAddTicketTypeGroups(ticketTypeGroupsModel, cb) {
        const digits = 6;
        base_1.default.getId('ticketTypeId', digits, (err, id) => {
            if (err || !id) {
                this.next(new Error(Message.Common.unexpectedError));
                return;
            }
            // 券種グループDB登録
            chevre_domain_1.Models.Film.create({
                _id: id,
                name: {
                    ja: ticketTypeGroupsModel.ticketGroupNameJa,
                    en: ''
                }
            }, (errDb, ticketTypeGroup) => {
                if (errDb) {
                    cb(errDb, ticketTypeGroup);
                }
                else {
                    cb(null, ticketTypeGroup);
                }
            });
        });
    }
    /**
     * 券種グループマスタ新規登録画面遷移
     *
     * @param {TicketTypeGroupsModel} ticketTypeGroupsModel
     */
    renderDisplayAdd(ticketTypeGroupsModel, errors) {
        this.res.locals.displayId = 'Aa-7';
        this.res.locals.title = '券種グループマスタ新規登録';
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
        this.res.render('master/ticketTypegroups/add', {
            ticketTypeGroupsModel: ticketTypeGroupsModel,
            errors: errors,
            layout: 'layouts/master/layout'
        });
    }
    /**
     * 券種グループマスタ一覧画面遷移
     *
     * @param {TicketTypeGroupsModel} ticketTypeGroupsModel
     */
    renderDisplayList(ticketTypeGroupsModel) {
        this.res.locals.displayId = 'Aa-8';
        this.res.locals.title = '券種グループマスタ一覧';
        this.res.render('master/ticketTypeGroup/index', {
            ticketTypeGroupsModel: ticketTypeGroupsModel,
            layout: 'layouts/master/layout'
        });
    }
    /**
     * 券種グループマスタ新規登録画面検証
     *
     * @param {TicketTypeModel} ticketTypeModel
     */
    validateFormAdd() {
        // 券種グループコード
        let colName = '券種グループコード';
        this.req.assert('ticketCode', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        this.req.assert('ticketCode', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_CODE });
        // サイト表示用券種グループ名
        colName = 'サイト表示用券種グループ名';
        this.req.assert('ticketNameJa', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        this.req.assert('ticketNameJa', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_NAME_JA });
        // 検証実行
        return this.req.validationErrors(true);
    }
}
exports.default = TicketTypeGroupsController;
