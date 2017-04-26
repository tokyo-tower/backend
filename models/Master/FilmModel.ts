/**
 * 作品マスタモデル
 *
 * 作品マスタの管理するためのモデルです
 *
 * @export
 * @class FilmModel
 */
import MasterBaseModel from './MasterBaseModel';
export default class FilmModel extends MasterBaseModel {
    /**
     * 作品コード
     */
    public filmCode: string = '';
    /**
     * 作品名
     */
    public filmNameJa: string = '';
    /**
     * 作品名カナ
     */
    public filmNameKana: string = '';
    /**
     * 作品名英
     */
    public filmNameEn: string = '';
    /**
     * 上映時間
     */
    public filmMinutes: number;
    /**
     * レイティング
     */
    public filmRatings: string;
    /**
     * 字幕/吹き替え
     */
    public subtitleDub: string;
    /**
     * 上映形態
     */
    public screeningForm: string;

    /**
     * 作品マスタ登録ドキュメントを作成する
     */
    public getFilmDocument() {
        return{
            name: {
                ja: this.filmNameJa,
                en: this.filmNameEn
            },
            minutes: this.filmMinutes,
            is_mx4d: this.screeningForm === 'MX4D'
        };
    }
}
