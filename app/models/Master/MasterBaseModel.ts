/**
 * マスタ共通基底モデル
 *
 * マスタの管理するための基底モデルです
 *
 * @export
 * @class MasterBaseModel
 */
export default class MasterBaseModel {
    /**
     * 画面ID
     */
    public displayId: string;
    /**
     * タイトル
     */
    public title: string;
    /**
     * メッセージ
     */
    public message: string;
}
