/**
 * 券種グループマスタコントローラー
 * @namespace ticketType
 */
import { Models } from '@motionpicture/chevre-domain';
import { NextFunction, Request, Response } from 'express';
import * as mongoose from 'mongoose';
import * as Message from '../../../common/Const/Message';
import TicketTypeGroupsModel from '../../models/Master/TicketTypeGroupsModel';

// 基数
const DEFAULT_RADIX: number = 10;
// 1ページに表示するデータ数
const DEFAULT_LINES: number = 10;
// 券種グループコード 半角64
const NAME_MAX_LENGTH_CODE: number = 64;
// 券種グループ名・日本語 全角64
const NAME_MAX_LENGTH_NAME_JA: number = 64;

/**
 * 一覧
 * @function list
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.staffUser === undefined) {
        next(new Error(Message.Common.unexpectedError));
        return;
    }
    const ticketTypeModel: TicketTypeGroupsModel = new TicketTypeGroupsModel();
    // 券種グループマスタ画面遷移
    res.locals.displayId = 'Aa-8';
    res.locals.title = '券種グループマスタ一覧';
    res.render('master/ticketTypeGroup/index', {
        ticketTypeGroupsModel: ticketTypeModel,
        layout: 'layouts/master/layout'
    });
    return;
}

/**
 * 新規登録
 * @function add
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function add(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.staffUser === undefined) {
        next(new Error(Message.Common.unexpectedError));
        return;
    }
    let ticketTypeGroupsModel: TicketTypeGroupsModel = new TicketTypeGroupsModel();
    if (req.method === 'GET') {
        renderDisplayAdd(res, ticketTypeGroupsModel, null);
        return;
    }
    try {
        // モデルに画面入力値をセット
        ticketTypeGroupsModel = req.body;
        // 検証
        const errors = validateFormAdd(req);
        const isValid: boolean = !errors;

        // 検証
        if (isValid) {
            // 券種グループDB登録プロセス
            const ticketType = await processAddTicketTypeGroups(ticketTypeGroupsModel);
            if (ticketType) {
                //ticketTypeModel.ticketNameJa = '';
            }
            // 券種グループマスタ画面遷移
            ticketTypeGroupsModel.message = Message.Common.add;
            renderDisplayAdd(res, ticketTypeGroupsModel, errors);
        } else {
            // 券種グループマスタ画面遷移
            renderDisplayAdd(res, ticketTypeGroupsModel, errors);
        }
    } catch (err) {
        next(err);
        return;
    }
}

/**
 * 一覧データ取得API
 * @function getList
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getList(req: Request, res: Response): Promise<void> {
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
    const limit: number = (req.query.limit) ? parseInt(req.query.limit, DEFAULT_RADIX) : DEFAULT_LINES;
    const page: number = (req.query.page) ? parseInt(req.query.page, DEFAULT_RADIX) : 1;
    // 券種グループコード
    const ticketGroupCode: string = (req.query.ticketGroupCode) ? req.query.ticketGroupCode : null;
    // 管理用券種グループ名
    const ticketGroupNameJa: string = (req.query.ticketGroupNameJa) ? req.query.ticketGroupNameJa : null;

    // 検索条件を作成
    const conditions: any = {};
    // 券種グループコード
    if (ticketGroupCode) {
        const key: string = '_id';
        conditions[key] = ticketGroupCode;
    }
    // 管理用券種グループ名
    if (ticketGroupNameJa) {
        conditions['name.ja'] = new RegExp('^' + ticketGroupNameJa);
    }

    try {
        const count = await Models.TicketTypeGroup.count(
            conditions
        ).exec();
        if (count === 0) {
            result.success = true;
            res.json(result);
            return;
        } else {
            const data = await findData(conditions, limit, page, count);
            res.json(data);
        }
    } catch (err) {
        res.json(result);
        return;
    }
}
/**
 * 一覧データ取得
 * @function findData
 * @param {any} conditions
 * @param {number} limit
 * @param {number} page
 * @param {number} count
 * @returns {Promise<{}>}
 */
export async function findData(conditions: any, limit: number, page: number, count: number): Promise<{}> {
    const result = {
        success: false,
        results: [],
        count: 0
    };
    try {
        const tickets = await Models.TicketTypeGroup.find(conditions)
            .skip(limit * (page - 1))
            .limit(limit)
            .lean(true)
            .exec();
        //検索結果編集
        const results = (<any[]>tickets).map((ticket: any) => {
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
    } catch (err) {
        return result;
    }
}

/**
 * 券種グループDB登録プロセス
 * @function processAddTicketTypeGroups
 * @param {Response} res
 * @param {TicketTypeModel} ticketTypeModel
 * @returns {Promise<mongoose.Document>}
 */
async function processAddTicketTypeGroups(ticketTypeGroupsModel: TicketTypeGroupsModel): Promise<mongoose.Document> {
    // 券種グループDB登録
    return await Models.Film.create(
        {
            // _id:,
            name: {
                ja: ticketTypeGroupsModel.ticketGroupNameJa,
                en: ''
            }
        }
    );
}

/**
 * 券種グループマスタ新規登録画面遷移
 * @function renderDisplayAdd
 * @param {TicketTypeGroupsModel} ticketTypeGroupsModel
 */
function renderDisplayAdd(res: Response, ticketTypeGroupsModel: TicketTypeGroupsModel, errors: any): void {
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
function validateFormAdd(req: Request): ExpressValidator.Dictionary<ExpressValidator.MappedError> | ExpressValidator.MappedError[] {
    // 券種グループコード
    let colName: string = '券種グループコード';
    req.assert('ticketCode', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.assert('ticketCode', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_CODE });
    // サイト表示用券種グループ名
    colName = 'サイト表示用券種グループ名';
    req.assert('ticketNameJa', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.assert('ticketNameJa', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_NAME_JA });
    // 検証実行
    return req.validationErrors(true);
}
