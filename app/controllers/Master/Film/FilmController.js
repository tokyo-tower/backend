"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chevre_domain_1 = require("@motionpicture/chevre-domain");
const filmAddForm_1 = require("../../../forms/master/filmAddForm");
const FilmModel_1 = require("../../../models/Master/FilmModel");
const MasterBaseController_1 = require("../MasterBaseController");
// 基数
const DEFAULT_RADIX = 10;
// 1ページに表示するデータ数
const DEFAULT_LINES = 10;
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
            return this.next(new Error(this.req.__('Message.UnexpectedError')));
        let filmModel = new FilmModel_1.default();
        // filmModel.displayId = this.req.__('Master.Title.Film.Add.Id');
        // filmModel.title = this.req.__('Master.Title.Film.Name') +
        //                   this.req.__('Master.Title.Film.Add.Name');
        // エラー時の描画のためlayout使用部分はlocals使用
        this.res.locals.displayId = this.req.__('Master.Title.Film.Add.Id');
        this.res.locals.title = this.req.__('Master.Title.Film.Name') +
            this.req.__('Master.Title.Film.Add.Name');
        if (this.req.method === 'POST') {
            // モデルに画面入力値をセット
            filmModel = this.parseModel(filmModel);
            // 検証
            const form = filmAddForm_1.default(this.req);
            form(this.req, this.res, (err) => {
                if (err)
                    return this.next(new Error(this.req.__('Message.Expired')));
                if (!this.req.form)
                    return this.next(new Error(this.req.__('Message.UnexpectedError')));
                if (this.req.form.isValid) {
                    // 作品DB登録プロセス
                    this.processAddFilm((addFilmErr, film) => {
                        if (film) {
                            //filmModel.filmNameJa = '';
                            //filmModel = MasterBaseController.copyModel<FilmModel>(filmModel, film);
                        }
                        if (addFilmErr) {
                            // エラー画面遷移
                            this.next(addFilmErr);
                        }
                        else {
                            // 作品マスタ画面遷移
                            filmModel.message = this.req.__('Master.Message.Add');
                            this.renderDisplayAdd(filmModel);
                        }
                    });
                }
                else {
                    // 作品マスタ画面遷移
                    this.renderDisplayAdd(filmModel);
                }
            });
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
            return this.next(new Error(this.req.__('Message.UnexpectedError')));
        const limit = (this.req.query.limit) ? parseInt(this.req.query.limit, DEFAULT_RADIX) : DEFAULT_LINES;
        const page = (this.req.query.page) ? parseInt(this.req.query.page, DEFAULT_RADIX) : 1;
        // 作品コード
        const filmNameCode = (this.req.query.filmNameCode) ? this.req.query.filmNameCode : null;
        // 登録日
        // 作品名・カナ・英
        const filmNameJa = (this.req.query.filmNameJa) ? this.req.query.filmNameJa : null;
        const filmNameKana = (this.req.query.filmNameKana) ? this.req.query.filmNameKana : null;
        const filmNameEn = (this.req.query.filmNameEn) ? this.req.query.filmNameEn : null;
        // 検索条件を作成
        const conditions = {};
        if (filmNameCode) {
            const keyId = '_id';
            const exp = new RegExp('^マ');
            conditions[keyId] = filmNameCode;
            conditions[keyId] = exp;
        }
        if (filmNameJa) {
            conditions['name.ja'] = filmNameJa;
        }
        if (filmNameKana) {
            conditions['name.kana'] = filmNameKana;
        }
        if (filmNameEn) {
            conditions['name.en'] = filmNameEn;
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
            return this.next(new Error(this.req.__('Message.UnexpectedError')));
        const filmModel = new FilmModel_1.default();
        // エラー時の描画のためlayout使用部分はlocals使用
        this.res.locals.displayId = this.req.__('Master.Title.Film.List.Id');
        this.res.locals.title = this.req.__('Master.Title.Film.Name') +
            this.req.__('Master.Title.Film.List.Name');
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
                return this.next(new Error(this.req.__('Message.UnexpectedError')));
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
        this.res.render('master/film/add', {
            filmModel: filmModel
        });
    }
    /**
     * 作品マスタ一覧画面遷移
     *
     * @param {FilmModel} filmModel
     */
    renderDisplayList(filmModel) {
        this.res.render('master/film/list', {
            filmModel: filmModel
        });
    }
}
exports.default = FilmController;
//# sourceMappingURL=FilmController.js.map