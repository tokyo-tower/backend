import { Models } from '@motionpicture/chevre-domain';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as Message from '../../../common/Const/Message';
import FilmModel from '../../models/Master/FilmModel';

// 基数
const DEFAULT_RADIX: number = 10;
// 1ページに表示するデータ数
const DEFAULT_LINES: number = 10;
// 作品コード 半角64
const NAME_MAX_LENGTH_CODE: number = 64;
// 作品名・日本語 全角64
const NAME_MAX_LENGTH_NAME_JA: number = 64;
// 作品名・英語 半角128
const NAME_MAX_LENGTH_NAME_EN: number = 128;
// 上映時間・数字10
const NAME_MAX_LENGTH_NAME_MINUTES: number = 10;

/**
 * 作品マスタコントローラー
 *
 * @namespace controller/film
 */

/**
 * 新規登録
 */
export async function add(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.staffUser === undefined) {
        next(new Error(Message.Common.unexpectedError));
        return;
    }

    const filmModel = req.body;

    if (req.method !== 'POST') {
        // 作品マスタ画面遷移
        renderDisplayAdd(res, filmModel, null);
        return;
    }

    // 検証
    validateFormAdd(req);
    const validatorResult = await req.getValidationResult();
    const errors = req.validationErrors(true);
    if (!validatorResult.isEmpty()) {
        renderDisplayAdd(res, filmModel, errors);
        return;
    }

    // 作品DB登録プロセス
    await Models.Film.create(
        {
            _id: filmModel.filmCode,
            name: {
                ja: filmModel.filmNameJa,
                en: filmModel.filmNameEn
            },
            ticket_type_group: '29',
            minutes: filmModel.filmMinutes,
            is_mx4d: true
        }
    );

    // 作品マスタ画面遷移
    filmModel.message = Message.Common.add;
    renderDisplayAdd(res, filmModel, errors);
}

/**
 * 一覧データ取得API
 */
export async function getList(req: Request, res: Response): Promise<void> {
    // 表示件数・表示ページ
    const limit: number = (req.query.limit) ? parseInt(req.query.limit, DEFAULT_RADIX) : DEFAULT_LINES;
    const page: number = (req.query.page) ? parseInt(req.query.page, DEFAULT_RADIX) : 1;
    // 作品コード
    const filmCode: string = (req.query.filmCode) ? req.query.filmCode : null;
    // 登録日
    const createDateFrom: string = (req.query.dateFrom) ? req.query.dateFrom : null;
    const createDateTo: string = (req.query.dateTo) ? req.query.dateTo : null;
    // 作品名・カナ・英
    const filmNameJa: string = (req.query.filmNameJa) ? req.query.filmNameJa : null;
    const filmNameKana: string = (req.query.filmNameKana) ? req.query.filmNameKana : null;
    const filmNameEn: string = (req.query.filmNameEn) ? req.query.filmNameEn : null;

    // 検索条件を作成
    const conditions: any = {};
    // 作品コード
    if (filmCode) {
        const key: string = '_id';
        conditions[key] = filmCode;
    }
    if (createDateFrom || createDateTo) {
        const conditionsDate: any = {};
        const key: string = 'created_at';
        // 登録日From
        if (createDateFrom) {
            const keyFrom = '$gte';
            conditionsDate[keyFrom] = toISOStringJapan(createDateFrom);
        }
        // 登録日To
        if (createDateTo) {
            const keyFrom = '$lt';
            conditionsDate[keyFrom] = toISOStringJapan(createDateTo, 1);
        }
        conditions[key] = conditionsDate;
    }
    // 作品名
    if (filmNameJa) {
        conditions['name.ja'] = { $regex: filmNameJa };
    }
    // 作品名カナ
    if (filmNameKana) {
        conditions['name.kana'] = { $regex: filmNameKana };
    }
    // 作品名英
    if (filmNameEn) {
        conditions['name.en'] = { $regex: filmNameEn };
    }

    try {
        const filmsCount = await Models.Film.count(conditions);
        if (filmsCount === 0) {
            res.json({
                success: true,
                results: [],
                count: 0
            });
            return;
        }

        const films = await Models.Film.find(conditions)
            .skip(limit * (page - 1))
            .limit(limit).exec();

        //検索結果編集
        const results = films.map((film) => {
            return {
                _id: film._id,
                filmCode: film._id,
                filmNameJa: film.get('name').ja,
                filmNameKana: film.get('name').ja,
                filmNameEn: film.get('name').en,
                filmMinutes: film.get('minutes'),
                subtitleDub: '字幕',
                screeningForm: '通常'
            };
        });

        res.json({
            success: true,
            count: filmsCount,
            results: results
        });
    } catch (error) {
        res.json({
            success: false,
            results: [],
            count: 0
        });
    }
}

/**
 * DB検索用ISO日付取得
 *
 * @param {string} dateStr
 * @param {number} addDay
 * @returns {string}
 */
function toISOStringJapan(dateStr: string, addDay: number = 0): string {
    const dateWk: string = moment(dateStr, 'YYYY/MM/DD').add(addDay, 'days').format('YYYYMMDD');
    // tslint:disable-next-line:no-magic-numbers
    return dateWk.substr(0, 4) + '-' + dateWk.substr(4, 2) + '-' + dateWk.substr(6, 2) + 'T00:00:00+09:00';
}

/**
 * 一覧
 */
export async function list(__: Request, res: Response): Promise<void> {
    res.render('master/film/index', {
        displayId: 'Aa-3',
        title: '作品マスタ一覧',
        filmModel: {},
        layout: 'layouts/master/layout'
    });
}

/**
 * 作品マスタ新規登録画面遷移
 *
 * @param {FilmModel} filmModel
 */
function renderDisplayAdd(res: Response, filmModel: FilmModel, errors: any): void {
    res.locals.displayId = 'Aa-2';
    res.locals.title = '作品マスタ新規登録';
    res.render('master/film/add', {
        filmModel: filmModel,
        errors: errors,
        layout: 'layouts/master/layout'
    });
}

/**
 * 作品マスタ新規登録画面検証
 *
 * @param {FilmModel} filmModel
 */
function validateFormAdd(req: Request): void {
    // 作品コード
    let colName: string = '作品コード';
    req.assert('filmCode', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.assert('filmCode', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_CODE });
    //.regex(/^[ -\~]+$/, req.__('Message.invalid{{fieldName}}', { fieldName: '%s' })),
    // 作品名
    colName = '作品名';
    req.assert('filmNameJa', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.assert('filmNameJa', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_NAME_JA });
    // 作品名カナ
    colName = '作品名カナ';
    req.assert('filmNameKana', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.assert('filmNameKana', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_JA)).len({ max: NAME_MAX_LENGTH_NAME_JA });
    // .regex(/^[ァ-ロワヲンーa-zA-Z]*$/, req.__('Message.invalid{{fieldName}}', { fieldName: '%s' })),
    // 作品名英
    colName = '作品名英';
    req.assert('filmNameEn', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    req.assert('filmNameEn', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_EN)).len({ max: NAME_MAX_LENGTH_NAME_EN });
    // 上映時間
    colName = '上映時間';
    req.assert('filmMinutes', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_MINUTES))
        .len({ max: NAME_MAX_LENGTH_NAME_EN });
    // レイティング
    colName = 'レイティング';
    req.assert('filmRatings', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    // 字幕/吹き替え
    colName = '字幕/吹き替え';
    req.assert('subtitleDub', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
    // 上映形態
    colName = '上映形態';
    req.assert('screeningForm', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
}
