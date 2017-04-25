"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chevre_domain_1 = require("@motionpicture/chevre-domain");
const Message = require("../../../../common/Const/Message");
const FilmModel_1 = require("../../../models/Master/FilmModel");
const MasterBaseController_1 = require("../MasterBaseController");
// 基数
const DEFAULT_RADIX = 10;
// 1ページに表示するデータ数
const DEFAULT_LINES = 10;
// 作品コード 半角64
const NAME_MAX_LENGTH_CODE = 64;
// 作品名・日本語 全角64
const NAME_MAX_LENGTH_NAME_JA = 64;
// 作品名・英語 半角128
const NAME_MAX_LENGTH_NAME_EN = 128;
// 上映時間・数字10
const NAME_MAX_LENGTH_NAME_MINUTES = 10;
/**
 * 作品マスタコントローラー
 *
 * @export
 * @class FilmController
 * @extends {MasterBaseController}
 */
class FilmController extends MasterBaseController_1.default {
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
        let filmModel = new FilmModel_1.default();
        if (this.req.method === 'POST') {
            // モデルに画面入力値をセット
            filmModel = this.parseModel(filmModel);
            // 検証
            const errors = this.validateFormAdd;
            const isValid = !errors;
            // 検証
            // const form = filmAddForm(this.req);
            // form(this.req, this.res, (err) => {
            //     if (err) return this.next(new Error(Message.Common.expired));
            //     if (!this.req.form) return this.next(new Error(Message.Common.unexpectedError));
            //     if (this.req.form.isValid) {
            //         // 作品DB登録プロセス
            //         this.processAddFilm((addFilmErr: Error | null, film: mongoose.Document | null) => {
            //             if (film) {
            //                 //filmModel.filmNameJa = '';
            //                 //filmModel = MasterBaseController.copyModel<FilmModel>(filmModel, film);
            //             }
            //             if (addFilmErr) {
            //                 // エラー画面遷移
            //                 this.next(addFilmErr);
            //             } else {
            //                 // 作品マスタ画面遷移
            //                 filmModel.message = Message.Common.add;
            //                 this.renderDisplayAdd(filmModel);
            //             }
            //         });
            //     } else {
            //         // 作品マスタ画面遷移
            //         this.renderDisplayAdd(filmModel);
            //     }
            // });
        }
        else {
            // 作品マスタ画面遷移
            this.renderDisplayAdd(filmModel);
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
        // 作品コード
        const filmCode = (this.req.query.filmCode) ? this.req.query.filmCode : null;
        // 登録日
        const createDateFrom = (this.req.query.dateFrom) ? this.req.query.dateFrom : null;
        const createDateTo = (this.req.query.dateTo) ? this.req.query.dateTo : null;
        // 作品名・カナ・英
        const filmNameJa = (this.req.query.filmNameJa) ? this.req.query.filmNameJa : null;
        const filmNameKana = (this.req.query.filmNameKana) ? this.req.query.filmNameKana : null;
        const filmNameEn = (this.req.query.filmNameEn) ? this.req.query.filmNameEn : null;
        // 検索条件を作成
        const conditions = {};
        // 作品コード
        if (filmCode) {
            const key = '_id';
            conditions[key] = filmCode;
        }
        if (createDateFrom || createDateTo) {
            const conditionsDate = {};
            const key = 'created_at';
            // 登録日From
            if (createDateFrom) {
                const keyFrom = '$gte';
                conditionsDate[keyFrom] = MasterBaseController_1.default.toISOStringJapan(createDateFrom);
            }
            // 登録日To
            if (createDateTo) {
                const keyFrom = '$lt';
                conditionsDate[keyFrom] = MasterBaseController_1.default.toISOStringJapan(createDateTo, 1);
            }
            conditions[key] = conditionsDate;
        }
        // 作品名
        if (filmNameJa) {
            conditions['name.ja'] = MasterBaseController_1.default.getRegxForwardMatching(filmNameJa);
        }
        // 作品名カナ
        if (filmNameKana) {
            conditions['name.kana'] = filmNameKana;
        }
        // 作品名英
        if (filmNameEn) {
            conditions['name.en'] = MasterBaseController_1.default.getRegxForwardMatching(filmNameEn);
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
        chevre_domain_1.Models.Film.find(conditions)
            .skip(limit * (page - 1))
            .limit(limit)
            .lean(true)
            .exec((findFilmErr, films) => {
            if (findFilmErr) {
                this.res.json(result);
            }
            else {
                //検索結果編集
                const results = films.map((film) => {
                    return {
                        _id: film._id,
                        filmCode: film._id,
                        filmNameJa: film.name.ja,
                        filmNameKana: film.name.ja,
                        filmNameEn: film.name.en,
                        filmMinutes: film.minutes,
                        subtitleDub: '字幕',
                        screeningForm: '通常'
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
        const filmModel = new FilmModel_1.default();
        if (this.req.method === 'POST') {
            // // モデルに画面入力値をセット
            // filmModel = this.parseModel<FilmModel>(filmModel);
            // // 検証
            // const form = filmAddForm(this.req);
            // form(this.req, this.res, (err) => {
            //     if (err) return this.next(new Error(this.req.__('Message.Expired')));
            //     if (!this.req.form) return this.next(new Error(this.req.__('Message.UnexpectedError')));
            //     if (this.req.form.isValid) {
            //         // 作品DB登録プロセス
            //         this.processAddFilm((addFilmErr: Error | null, film: mongoose.Document | null) => {
            //             if (addFilmErr) {
            //                 // エラー画面遷移
            //                 this.next(addFilmErr);
            //             } else {
            //                 // 作品マスタ画面遷移
            //                 filmModel.message = this.req.__('Master.Message.Add');
            //                 this.renderDisplay(filmModel);
            //             }
            //         });
            //     } else {
            //         // 作品マスタ画面遷移
            //         this.renderDisplay(filmModel);
            //     }
            // });
        }
        else {
            // 作品マスタ画面遷移
            this.renderDisplayList(filmModel);
        }
    }
    /**
     * 作品DB登録プロセス
     *
     * @param {FilmModel} filmModel
     */
    processAddFilm(cb) {
        const digits = 6;
        MasterBaseController_1.default.getId('filmId', digits, (err, id) => {
            if (err || !id)
                return this.next(new Error(Message.Common.unexpectedError));
            // 作品DB登録
            chevre_domain_1.Models.Film.create({
                _id: id,
                name: {
                    ja: this.req.form.filmNameJa,
                    en: this.req.form.filmNameEn
                },
                ticket_type_group: '29',
                minutes: this.req.form.filmMinutes,
                is_mx4d: true
            }, (errDb, film) => {
                if (errDb) {
                    cb(errDb, film);
                }
                else {
                    cb(null, film);
                }
            });
        });
    }
    /**
     * 作品マスタ新規登録画面遷移
     *
     * @param {FilmModel} filmModel
     */
    renderDisplayAdd(filmModel) {
        this.res.locals.displayId = 'Aa-2';
        this.res.locals.title = '作品マスタ新規登録';
        this.res.render('master/film/add', {
            filmModel: filmModel,
            layout: 'layouts/master/layout'
        });
    }
    /**
     * 作品マスタ一覧画面遷移
     *
     * @param {FilmModel} filmModel
     */
    renderDisplayList(filmModel) {
        this.res.locals.displayId = 'Aa-3';
        this.res.locals.title = '作品マスタ一覧';
        this.res.render('master/film/list', {
            filmModel: filmModel,
            layout: 'layouts/master/layout'
        });
    }
    /**
     * 作品マスタ新規登録画面検証
     *
     * @param {FilmModel} filmModel
     */
    validateFormAdd() {
        // 作品コード
        let colName = '作品コード';
        this.req.assert('filmCode', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        this.req.assert('filmCode', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_CODE });
        //.regex(/^[ -\~]+$/, req.__('Message.invalid{{fieldName}}', { fieldName: '%s' })),
        // 作品名
        colName = '作品名';
        this.req.assert('filmNameJa', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        this.req.assert('filmNameJa', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_CODE)).len({ max: NAME_MAX_LENGTH_NAME_JA });
        // 作品名カナ
        colName = '作品名カナ';
        this.req.assert('filmNameKana', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        this.req.assert('filmNameKana', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_JA)).len({ max: NAME_MAX_LENGTH_NAME_JA });
        // .regex(/^[ァ-ロワヲンーa-zA-Z]*$/, req.__('Message.invalid{{fieldName}}', { fieldName: '%s' })),
        // 作品名英
        colName = '作品名英';
        this.req.assert('filmNameKana', Message.Common.required.replace('$fieldName$', colName)).notEmpty();
        this.req.assert('filmNameKana', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_EN)).len({ max: NAME_MAX_LENGTH_NAME_EN });
        // 上映時間
        colName = '上映時間';
        this.req.assert('filmMinutes', Message.Common.getMaxLength(colName, NAME_MAX_LENGTH_NAME_MINUTES))
            .len({ max: NAME_MAX_LENGTH_NAME_EN });
        return this.req.validationErrors(true);
    }
}
exports.default = FilmController;
