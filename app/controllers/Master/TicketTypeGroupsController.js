"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chevre_domain_1 = require("@motionpicture/chevre-domain");
//import * as mongoose from 'mongoose';
const Message = require("../../../common/Const/Message");
const TicketTypeGroupsModel_1 = require("../../models/Master/TicketTypeGroupsModel");
const MasterBaseController_1 = require("./MasterBaseController");
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
class TicketTypeGroupsController extends MasterBaseController_1.default {
    constructor() {
        super(...arguments);
        this.layout = 'layouts/master/layout';
    }
    /**
     * 新規登録
     */
    add() {
        if (!this.req.staffUser)
            return this.next(new Error(Message.Common.unexpectedError));
        let ticketTypeGroupsModel = new TicketTypeGroupsModel_1.default();
        if (this.req.method === 'POST') {
            // モデルに画面入力値をセット
            ticketTypeGroupsModel = this.parseModel(ticketTypeGroupsModel);
            // 検証
            const errors = this.validateFormAdd();
            const isValid = !errors;
            // 検証
            if (isValid) {
                // // 券種グループDB登録プロセス
                // this.processAddTicketType(ticketTypeModel, (addErr: Error | null, ticketType: mongoose.Document | null) => {
                //     if (ticketType) {
                //         //ticketTypeModel.ticketNameJa = '';
                //     }
                //     if (addErr) {
                //         // エラー画面遷移
                //         this.next(addErr);
                //     } else {
                //         // 券種グループマスタ画面遷移
                //         ticketTypeModel.message = Message.Common.add;
                //         this.renderDisplayAdd(ticketTypeModel, errors);
                //     }
                // });
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
        if (!this.req.staffUser)
            return this.next(new Error(Message.Common.unexpectedError));
        // 表示件数・表示ページ
        const limit = (this.req.query.limit) ? parseInt(this.req.query.limit, DEFAULT_RADIX) : DEFAULT_LINES;
        const page = (this.req.query.page) ? parseInt(this.req.query.page, DEFAULT_RADIX) : 1;
        // 券種グループコード
        const ticketCode = (this.req.query.ticketCode) ? this.req.query.ticketCode : null;
        // 管理用券種グループ名
        const managementTypeName = (this.req.query.managementTypeName) ? this.req.query.managementTypeName : null;
        // 金額
        const ticketCharge = (this.req.query.ticketCharge) ? this.req.query.ticketCharge : null;
        // 検索条件を作成
        const conditions = {};
        // 券種グループコード
        if (ticketCode) {
            const key = '_id';
            conditions[key] = ticketCode;
        }
        // 管理用券種グループ名
        if (managementTypeName) {
            conditions['name.ja'] = MasterBaseController_1.default.getRegxForwardMatching(managementTypeName);
        }
        // 金額
        if (ticketCharge) {
            const key = 'charge';
            conditions[key] = ticketCharge;
        }
        const result = {
            success: false,
            results: [],
            count: 0
        };
        chevre_domain_1.Models.Film.count(conditions, (err, count) => {
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
        // @@@@@@@@@@@@@@ ticketTypeに変更 @@@@@@@@@@@@@
        chevre_domain_1.Models.Film.find(conditions)
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
                        ticketCode: ticket._id,
                        ticketNameJa: ticket.name.ja,
                        managementTypeName: '管理用券種グループ名',
                        ticketCharge: ticket.minutes
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
        if (!this.req.staffUser)
            return this.next(new Error(Message.Common.unexpectedError));
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
    //private processAddTicketType(ticketTypeModel: TicketTypeModel, cb: (err: Error | null, ticket: mongoose.Document) => void): void {
    // const digits: number = 6;
    // MasterBaseController.getId('ticketTypeId', digits, (err, id) => {
    //     if (err || !id) return this.next(new Error(Message.Common.unexpectedError));
    //     // 券種グループDB登録
    //     Models.Film.create(
    //         {
    //             _id: id,
    //             name: {
    //                 ja: ticketTypeModel.ticketNameJa,
    //                 en: ticketTypeModel.managementTypeName
    //             },
    //             is_mx4d: true
    //         },
    //         (errDb: any, ticketType: any) => {
    //             if (errDb) {
    //                 cb(errDb, ticketType);
    //             } else {
    //                 cb(null, ticketType);
    //             }
    //         }
    //     );
    // });
    //}
    /**
     * 券種グループマスタ新規登録画面遷移
     *
     * @param {TicketTypeGroupsModel} ticketTypeGroupsModel
     */
    renderDisplayAdd(ticketTypeGroupsModel, errors) {
        this.res.locals.displayId = 'Aa-7';
        this.res.locals.title = '券種グループマスタ新規登録';
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
        this.res.render('master/ticketTypegroups/list', {
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
//# sourceMappingURL=TicketTypeGroupsController.js.map