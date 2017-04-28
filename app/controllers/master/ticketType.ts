/**
 * 券種マスタコントローラー
 *
 * @namespace controller/master/ticketType
 */

import { Models } from '@motionpicture/chevre-domain';
import { Request, Response } from 'express';
import * as _ from 'underscore';
import * as Message from '../../../common/Const/Message';

// 基数
const DEFAULT_RADIX = 10;
// 1ページに表示するデータ数
const DEFAULT_LINES = 10;
// 券種コード 半角64
const NAME_MAX_LENGTH_CODE = 64;
// 券種名・日本語 全角64
const NAME_MAX_LENGTH_NAME_JA = 64;
// 券種名・英語 半角128
const NAME_MAX_LENGTH_NAME_EN = 64;
// 金額
const CHAGE_MAX_LENGTH = 10;

/**
 * 新規登録
 * @function add
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function add(req: Request, res: Response): Promise<void> {
    const view = 'master/ticketType/add';
    const layout = 'layouts/master/layout';
    let message = '';
    let errors: any = {};
    res.locals.displayId = 'Aa-5';
    res.locals.title = '券種マスタ新規登録';
    if (req.method === 'POST') {
        // 検証
        validateFormAdd(req);
        const validatorResult = await req.getValidationResult();
        errors = req.validationErrors(true);
        // 検証
        if (validatorResult.isEmpty()) {
            // 券種DB登録プロセス
            try {
                await Models.TicketType.create(
                    {
                        _id: req.body.ticketCode,
                        name: {
                            ja: req.body.ticketNameJa,
                            en: ''
                        },
                        charge: req.body.ticketCharge
                    }
                );
                message = '登録完了';
            } catch (error) {
                message = error.message;
            }
        }
    }

    res.render(view, {
        message: message,
        errors: errors,
        layout: layout
    });
}
/**
 * 一覧データ取得API
 * @function getList
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getList(req: Request, res: Response): Promise<void> {
    // 表示件数・表示ページ
    const limit: number = (!_.isEmpty(req.query.limit)) ? parseInt(req.query.limit, DEFAULT_RADIX) : DEFAULT_LINES;
    const page: number = (!_.isEmpty(req.query.page)) ? parseInt(req.query.page, DEFAULT_RADIX) : 1;
    // 券種コード
    const ticketCode: string = (!_.isEmpty(req.query.ticketCode)) ? req.query.ticketCode : null;
    // 管理用券種名
    const managementTypeName: string = (!_.isEmpty(req.query.managementTypeName)) ? req.query.managementTypeName : null;
    // 金額
    const ticketCharge: string = (!_.isEmpty(req.query.ticketCharge)) ? req.query.ticketCharge : null;

    // 検索条件を作成
    const conditions: any = {};
    // 券種コード
    if (ticketCode) {
        const key: string = '_id';
        conditions[key] = ticketCode;
    }
    // 管理用券種名
    if (managementTypeName !== null) {
        conditions['name.ja'] = { $regex: managementTypeName };
    }
    // 金額
    if (ticketCharge) {
        const key: string = 'charge';
        conditions[key] = ticketCharge;
    }

    try {
        const count = await Models.TicketType.count(conditions).exec();
        let results: any[] = [];

        if (count > 0) {
            const ticketTypes = await Models.TicketType.find(conditions)
                .skip(limit * (page - 1))
                .limit(limit)
                .exec();

            //検索結果編集
            results = ticketTypes.map((ticketType) => {
                return {
                    _id: ticketType._id,
                    ticketCode: ticketType._id,
                    managementTypeName: ticketType.get('name').ja,
                    ticketCharge: ticketType.get('charge')
                };
            });
        }

        res.json({
            success: true,
            count: count,
            results: results
        });
        return;
    } catch (err) {
        res.json({
            success: false,
            count: 0,
            results: []
        });
        return;
    }
}

/**
 * 一覧
 * @function list
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(__: Request, res: Response): Promise<void> {
    // 券種グループマスタ画面遷移
    res.render('master/ticketType/index', {
        message: '',
        displayId: 'Aa-6',
        title: '券種マスタ一覧',
        ticketTypeGroupsModel: {},
        layout: 'layouts/master/layout'
    });
}

/**
 * 券種マスタ新規登録画面検証
 * @function validateFormAdd
 * @param {req} req
 * @returns {void}
 */
function validateFormAdd(req: Request): void {
    // 券種コード
    let colName: string = '券種コード';
    req.checkBody('ticketCode', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.checkBody('ticketCode', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_CODE });
    // サイト表示用券種名
    colName = 'サイト表示用券種名';
    req.checkBody('ticketNameJa', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.checkBody('ticketNameJa', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_NAME_JA });
    // サイト表示用券種名英
    colName = 'サイト表示用券種名英';
    req.checkBody('ticketNameEn', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.checkBody('ticketNameEn', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_EN))
        .len({ max: NAME_MAX_LENGTH_NAME_EN });
    // 管理用券種名
    colName = '管理用券種名';
    req.checkBody('managementTypeName', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.checkBody(
        'managementTypeName',
        Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_EN)).len({ max: NAME_MAX_LENGTH_NAME_JA }
    );
    // 金額
    colName = '金額';
    req.checkBody('ticketCharge', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.checkBody('ticketCharge', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_EN)).len({ max: CHAGE_MAX_LENGTH });
}
