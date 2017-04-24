import { Models } from '@motionpicture/chevre-domain';
import * as mongoose from 'mongoose';
import filmAddForm from '../../../forms/master/filmAddForm';
import FilmModel from '../../../models/Master/FilmModel';
import MasterBaseController from '../MasterBaseController';

// 基数
const DEFAULT_RADIX: number = 10;
// 1ページに表示するデータ数
const DEFAULT_LINES: number = 10;
/**
 * 作品マスタコントローラー
 *
 * @export
 * @class FilmController
 * @extends {MasterBaseController}
 */
export default class FilmController extends MasterBaseController {
    public layout: string = 'layouts/master/layout';
    /**
     * 新規登録
     */
    public add(): void {
        if (!this.req.staffUser) return this.next(new Error(this.req.__('Message.UnexpectedError')));
        let filmModel: FilmModel = new FilmModel();
        // filmModel.displayId = this.req.__('Master.Title.Film.Add.Id');
        // filmModel.title = this.req.__('Master.Title.Film.Name') +
        //                   this.req.__('Master.Title.Film.Add.Name');
        // エラー時の描画のためlayout使用部分はlocals使用
        this.res.locals.displayId = this.req.__('Master.Title.Film.Add.Id');
        this.res.locals.title = this.req.__('Master.Title.Film.Name') +
                                this.req.__('Master.Title.Film.Add.Name');
        if (this.req.method === 'POST') {
            // モデルに画面入力値をセット
            filmModel = this.parseModel<FilmModel>(filmModel);
            // 検証
            const form = filmAddForm(this.req);
            form(this.req, this.res, (err) => {
                if (err) return this.next(new Error(this.req.__('Message.Expired')));
                if (!this.req.form) return this.next(new Error(this.req.__('Message.UnexpectedError')));
                if (this.req.form.isValid) {
                    // 作品DB登録プロセス
                    this.processAddFilm((addFilmErr: Error | null, film: mongoose.Document | null) => {
                        if (film) {
                            //filmModel.filmNameJa = '';
                            //filmModel = MasterBaseController.copyModel<FilmModel>(filmModel, film);
                        }
                        if (addFilmErr) {
                            // エラー画面遷移
                            this.next(addFilmErr);
                        } else {
                            // 作品マスタ画面遷移
                            filmModel.message = this.req.__('Master.Message.Add');
                            this.renderDisplayAdd(filmModel);
                        }
                    });
                } else {
                    // 作品マスタ画面遷移
                    this.renderDisplayAdd(filmModel);
                }
            });
        } else {
            // 作品マスタ画面遷移
            this.renderDisplayAdd(filmModel);
        }
    }
    /**
     * 一覧データ取得API
     */
    public getList(): void {
        if (!this.req.staffUser) return this.next(new Error(this.req.__('Message.UnexpectedError')));
        const limit: number = (this.req.query.limit) ? parseInt(this.req.query.limit, DEFAULT_RADIX) : DEFAULT_LINES;
        const page: number = (this.req.query.page) ? parseInt(this.req.query.page, DEFAULT_RADIX) : 1;
        // 作品コード
        const filmNameCode: string = (this.req.query.filmNameCode) ? this.req.query.filmNameCode : null;
        // 登録日
        // 作品名・カナ・英
        const filmNameJa: string = (this.req.query.filmNameJa) ? this.req.query.filmNameJa : null;
        const filmNameKana: string = (this.req.query.filmNameKana) ? this.req.query.filmNameKana : null;
        const filmNameEn: string = (this.req.query.filmNameEn) ? this.req.query.filmNameEn : null;

        // 検索条件を作成
        const conditions: any = {};
        if (filmNameCode) {
            const keyId: string = '_id';
            const exp: RegExp = new RegExp('^マ');
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
        Models.Film.count(
            conditions,
            (err, count) => {
                if (err) {
                    this.res.json(result);
                } else {
                    if (count === 0) {
                        result.success = true;
                        this.res.json(result);
                    } else {
                        this.findData(conditions, limit, page, count);
                    }
                }
            }
        );
    }
    /**
     * 一覧データ取得
     *
     * @param {any} conditions
     * @param {number} limit
     * @param {number} page
     * @param {number} count
     */
    public findData(conditions: any, limit: number, page: number, count: number): void {
        const result = {
            success: false,
            results: [],
            count: 0
        };
        Models.Film.find( conditions )
            .skip(limit * (page - 1))
            .limit(limit)
            .lean(true)
            .exec((findFilmErr, films: any[]) => {
                if (findFilmErr) {
                    this.res.json(result);
                } else {
                    //検索結果編集
                    const results = films.map((film: any) => {
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
            }
        );
    }
    /**
     * 一覧
     */
    public list(): void {
        if (!this.req.staffUser) return this.next(new Error(this.req.__('Message.UnexpectedError')));
        const filmModel: FilmModel = new FilmModel();
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
        } else {
            // 作品マスタ画面遷移
            this.renderDisplayList(filmModel);
        }
    }

    /**
     * 作品DB登録プロセス
     *
     * @param {FilmModel} filmModel
     */
    private processAddFilm(cb: (err: Error | null, film: mongoose.Document) => void): void {
        const digits: number = 6;
        MasterBaseController.getId('filmId', digits, (err, id) => {
            if (err || !id) return this.next(new Error(this.req.__('Message.UnexpectedError')));
            // 作品DB登録
            Models.Film.create(
                {
                    _id: id,
                    name: {
                        ja: (<any>this.req.form).filmNameJa,
                        en: (<any>this.req.form).filmNameEn
                    },
                    ticket_type_group: '29',
                    minutes: (<any>this.req.form).filmMinutes,
                    is_mx4d: true
                },
                (errDb: any, film: any) => {
                    if (errDb) {
                        cb(errDb, film);
                    } else {
                        cb(null, film);
                    }
                }
            );
        });
    }
    /**
     * 作品マスタ新規登録画面遷移
     *
     * @param {FilmModel} filmModel
     */
    private renderDisplayAdd (filmModel: FilmModel): void {
        this.res.render('master/film/add', {
            filmModel: filmModel
        });
    }
    /**
     * 作品マスタ一覧画面遷移
     *
     * @param {FilmModel} filmModel
     */
    private renderDisplayList (filmModel: FilmModel): void {
        this.res.render('master/film/list', {
            filmModel: filmModel
        });
    }
}
