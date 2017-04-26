import { Models } from '@motionpicture/chevre-domain';
import * as mongoose from 'mongoose';
import * as Message from '../../../common/Const/Message';
import TicketTypeModel from '../../models/Master/TicketTypeModel';
import MasterBaseController from './MasterBaseController';

// // 基数
// const DEFAULT_RADIX: number = 10;
// // 1ページに表示するデータ数
// const DEFAULT_LINES: number = 10;
// 券種コード 半角64
const NAME_MAX_LENGTH_CODE: number = 64;
// 券種名・日本語 全角64
const NAME_MAX_LENGTH_NAME_JA: number = 64;
// 券種名・英語 半角128
const NAME_MAX_LENGTH_NAME_EN: number = 128;
// 上映時間・数字10
const NAME_MAX_LENGTH_NAME_MINUTES: number = 10;

/**
 * 券種マスタコントローラー
 *
 * @export
 * @class ticketTypeController
 * @extends {MasterBaseController}
 */
export default class TicketTypeController extends MasterBaseController {
    public layout: string = 'layouts/master/layout';
    /**
     * 新規登録
     */
    public add(): void {
        if (!this.req.staffUser) return this.next(new Error(Message.Common.unexpectedError));
        let ticketTypeModel: TicketTypeModel = new TicketTypeModel();
        if (this.req.method === 'POST') {
            // モデルに画面入力値をセット
            ticketTypeModel = this.parseModel<TicketTypeModel>(ticketTypeModel);
            // 検証
            const errors = this.validateFormAdd();
            const isValid: boolean = !errors;
            // 検証
            if (isValid) {
                // 券種DB登録プロセス
                this.processAddFilm(ticketTypeModel, (addFilmErr: Error | null, film: mongoose.Document | null) => {
                    if (film) {
                        //ticketTypeModel.filmNameJa = '';
                        //ticketTypeModel = MasterBaseController.copyModel<TicketTypeModel>(ticketTypeModel, film);
                    }
                    if (addFilmErr) {
                        // エラー画面遷移
                        this.next(addFilmErr);
                    } else {
                        // 券種マスタ画面遷移
                        ticketTypeModel.message = Message.Common.add;
                        this.renderDisplayAdd(ticketTypeModel, errors);
                    }
                });
            } else {
                // 券種マスタ画面遷移
                this.renderDisplayAdd(ticketTypeModel, errors);
            }
        } else {
            // 券種マスタ画面遷移
            this.renderDisplayAdd(ticketTypeModel, null);
        }
    }
    /**
     * 一覧データ取得API
     */
    // public getList(): void {
    //     if (!this.req.staffUser) return this.next(new Error(Message.Common.unexpectedError));
    //     // 表示件数・表示ページ
    //     const limit: number = (this.req.query.limit) ? parseInt(this.req.query.limit, DEFAULT_RADIX) : DEFAULT_LINES;
    //     const page: number = (this.req.query.page) ? parseInt(this.req.query.page, DEFAULT_RADIX) : 1;
    //     // 券種コード
    //     const filmCode: string = (this.req.query.filmCode) ? this.req.query.filmCode : null;
    //     // 登録日
    //     const createDateFrom: string = (this.req.query.dateFrom) ? this.req.query.dateFrom : null;
    //     const createDateTo: string = (this.req.query.dateTo) ? this.req.query.dateTo : null;
    //     // 券種名・カナ・英
    //     const filmNameJa: string = (this.req.query.filmNameJa) ? this.req.query.filmNameJa : null;
    //     const filmNameKana: string = (this.req.query.filmNameKana) ? this.req.query.filmNameKana : null;
    //     const filmNameEn: string = (this.req.query.filmNameEn) ? this.req.query.filmNameEn : null;

    //     // 検索条件を作成
    //     const conditions: any = {};
    //     // 券種コード
    //     if (filmCode) {
    //         const key: string = '_id';
    //         conditions[key] = filmCode;
    //     }
    //     if (createDateFrom || createDateTo) {
    //         const conditionsDate: any = {};
    //         const key: string = 'created_at';
    //         // 登録日From
    //         if (createDateFrom) {
    //             const keyFrom = '$gte';
    //             conditionsDate[keyFrom] = MasterBaseController.toISOStringJapan(createDateFrom);
    //         }
    //         // 登録日To
    //         if (createDateTo) {
    //             const keyFrom = '$lt';
    //             conditionsDate[keyFrom] = MasterBaseController.toISOStringJapan(createDateTo, 1);
    //         }
    //         conditions[key] = conditionsDate;
    //     }
    //     // 券種名
    //     if (filmNameJa) {
    //         conditions['name.ja'] = MasterBaseController.getRegxForwardMatching(filmNameJa);
    //     }
    //     // 券種名カナ
    //     if (filmNameKana) {
    //         conditions['name.kana'] = filmNameKana;
    //     }
    //     // 券種名英
    //     if (filmNameEn) {
    //         conditions['name.en'] = MasterBaseController.getRegxForwardMatching(filmNameEn);
    //     }
    //     const result = {
    //         success: false,
    //         results: [],
    //         count: 0
    //     };
    //     Models.Film.count(
    //         conditions,
    //         (err, count) => {
    //             if (err) {
    //                 this.res.json(result);
    //             } else {
    //                 if (count === 0) {
    //                     result.success = true;
    //                     this.res.json(result);
    //                 } else {
    //                     this.findData(conditions, limit, page, count);
    //                 }
    //             }
    //         }
    //     );
    // }
    /**
     * 一覧データ取得
     *
     * @param {any} conditions
     * @param {number} limit
     * @param {number} page
     * @param {number} count
     */
    // public findData(conditions: any, limit: number, page: number, count: number): void {
    //     const result = {
    //         success: false,
    //         results: [],
    //         count: 0
    //     };
    //     Models.Film.find( conditions )
    //         .skip(limit * (page - 1))
    //         .limit(limit)
    //         .lean(true)
    //         .exec((findFilmErr, films: any[]) => {
    //             if (findFilmErr) {
    //                 this.res.json(result);
    //             } else {
    //                 //検索結果編集
    //                 const results = films.map((film: any) => {
    //                     return {
    //                         _id: film._id,
    //                         filmCode: film._id,
    //                         filmNameJa: film.name.ja,
    //                         filmNameKana: film.name.ja,
    //                         filmNameEn: film.name.en,
    //                         filmMinutes: film.minutes,
    //                         subtitleDub: '字幕',
    //                         screeningForm: '通常'
    //                     };
    //                 });
    //                 this.res.json({
    //                     success: true,
    //                     count: count,
    //                     results: results
    //                 });
    //             }
    //         }
    //     );
    // }
    /**
     * 一覧
     */
    public list(): void {
        if (!this.req.staffUser) return this.next(new Error(Message.Common.unexpectedError));
        const ticketTypeModel: TicketTypeModel = new TicketTypeModel();
        if (this.req.method !== 'POST') {
            // 券種マスタ画面遷移
            this.renderDisplayList(ticketTypeModel);
        }
    }

    /**
     * 券種DB登録プロセス
     *
     * @param {TicketTypeModel} ticketTypeModel
     */
    private processAddFilm(ticketTypeModel: TicketTypeModel, cb: (err: Error | null, film: mongoose.Document) => void): void {
        const digits: number = 6;
        MasterBaseController.getId('filmId', digits, (err, id) => {
            if (err || !id) return this.next(new Error(Message.Common.unexpectedError));
            // 券種DB登録
            Models.Film.create(
                {
                    _id: id,
                    name: {
                        ja: ticketTypeModel.ticketNameJa,
                        en: ticketTypeModel.ticketNameEn
                    },
                    //ticket_type_group: '29',
                    //minutes: ticketTypeModel.filmMinutes,
                    is_mx4d: true
                },
                (errDb: any, ticketType: any) => {
                    if (errDb) {
                        cb(errDb, ticketType);
                    } else {
                        cb(null, ticketType);
                    }
                }
            );
        });
    }
    /**
     * 券種マスタ新規登録画面遷移
     *
     * @param {TicketTypeModel} ticketTypeModel
     */
    private renderDisplayAdd (ticketTypeModel: TicketTypeModel, errors: any): void {
        this.res.locals.displayId = 'Aa-5';
        this.res.locals.title = '券種マスタ新規登録';
        this.res.render('master/ticketType/add', {
            ticketTypeModel: ticketTypeModel,
            errors: errors,
            layout: 'layouts/master/layout'
        });
    }
    /**
     * 券種マスタ一覧画面遷移
     *
     * @param {TicketTypeModel} ticketTypeModel
     */
    private renderDisplayList (ticketTypeModel: TicketTypeModel): void {
        this.res.locals.displayId = 'Aa-6';
        this.res.locals.title = '券種マスタ一覧';
        this.res.render('master/ticketType/list', {
            ticketTypeModel: ticketTypeModel,
            layout: 'layouts/master/layout'
        });
    }
    /**
     * 券種マスタ新規登録画面検証
     *
     * @param {TicketTypeModel} ticketTypeModel
     */
    private validateFormAdd(): ExpressValidator.Dictionary<ExpressValidator.MappedError> | ExpressValidator.MappedError[] {
        // 券種コード
        let colName: string = '券種コード';
        this.req.assert('ticketTypeCode', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        this.req.assert('ticketTypeCode', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({max: NAME_MAX_LENGTH_CODE});
        // 券種名
        colName = '券種名';
        this.req.assert('filmNameJa', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        this.req.assert('filmNameJa', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({max: NAME_MAX_LENGTH_NAME_JA});
        // 券種名カナ
        colName = '券種名カナ';
        this.req.assert('filmNameKana', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        this.req.assert('filmNameKana', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_JA)).len({max: NAME_MAX_LENGTH_NAME_JA});
        // .regex(/^[ァ-ロワヲンーa-zA-Z]*$/, req.__('Message.invalid{{fieldName}}', { fieldName: '%s' })),
        // 券種名英
        colName = '券種名英';
        this.req.assert('filmNameEn', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        this.req.assert('filmNameEn', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_EN)).len({max: NAME_MAX_LENGTH_NAME_EN});
        // 上映時間
        colName = '上映時間';
        this.req.assert('filmMinutes', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_MINUTES))
                .len({max: NAME_MAX_LENGTH_NAME_EN});
        // レイティング
        colName = 'レイティング';
        this.req.assert('filmRatings', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        // 字幕/吹き替え
        colName = '字幕/吹き替え';
        this.req.assert('subtitleDub', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        // 上映形態
        colName = '上映形態';
        this.req.assert('screeningForm', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        // 検証実行
        return this.req.validationErrors(true);
    }
}
