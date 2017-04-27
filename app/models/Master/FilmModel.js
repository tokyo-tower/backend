"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MasterBaseModel_1 = require("./MasterBaseModel");
/**
 * 作品マスタモデル
 *
 * 作品マスタの管理するためのモデルです
 *
 * @export
 * @class FilmModel
 */
class FilmModel extends MasterBaseModel_1.default {
    constructor() {
        super(...arguments);
        /**
         * 作品コード
         */
        this.filmCode = '';
        /**
         * 作品名
         */
        this.filmNameJa = '';
        /**
         * 作品名カナ
         */
        this.filmNameKana = '';
        /**
         * 作品名英
         */
        this.filmNameEn = '';
    }
    /**
     * 作品マスタ登録ドキュメントを作成する
     */
    getFilmDocument() {
        return {
            name: {
                ja: this.filmNameJa,
                en: this.filmNameEn
            },
            minutes: this.filmMinutes,
            is_mx4d: this.screeningForm === 'MX4D'
        };
    }
}
exports.default = FilmModel;
