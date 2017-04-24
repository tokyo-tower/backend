import { Models } from '@motionpicture/chevre-domain';
import * as moment from 'moment';
//import * as mongoose from 'mongoose';
import BaseController from '../BaseController';
/**
 * マスタ共通コントローラー基底クラス
 *
 * @export
 * @class MasterBaseController
 * @extends {BaseController}
 */
export default class MasterBaseController extends BaseController {
    /**
     * 前方一致正規表現取得
     *
     * @param {string} value
     * @returns {RegExp}
     */
    protected static getRegxForwardMatching(value: string): RegExp {
        return new RegExp('^' + value);
    }
    protected static toISOStringJapan(dateStr: string, addDay: number = 0): string {
        const m = moment(dateStr, 'YYYY/MM/DD');
        const m2 = m.add(addDay, 'days');
        const dateWk: string = m2.format('YYYYMMDD');
        //const dateWk: string = dateStr.replace(/'\/'/g, '');
        const year: string =  dateWk.substr(0, 4);
        const month: string =  dateWk.substr(4, 2);
        const day: string =  dateWk.substr(6, 2);
        // tslint:disable-next-line:no-magic-numbers
        return year + '-' + month + '-' + day + 'T00:00:00+09:00';
    }
    /**
     * 画面入力値のモデルセット処理
     *
     * @param {T} model
     * @param {mongoose.Document} fromDoc
     * @returns {T}
     */
    // protected static copyModel<T>(model: T, fromDoc: mongoose.Document): T {
    //     // 画面入力値をモデルにセット
    //     Object.getOwnPropertyNames(fromDoc).forEach((propertyName) => {
    //         (<any>model)[propertyName] = (<any>fromDoc)[propertyName];
    //     });
    //     return model;
    // }
    /**
     * Id自動採番
     *
     * @param {string} target
     * @param {number} digits
     * @param {function} cb
     */
    protected static getId(target: string, digits: number, cb: (err: Error, no: string | null) => void): void {
        Models.Sequence.findOneAndUpdate(
            { target: target },
            {
                $inc: { no: 1 }
            },
            {
                upsert: true,
                new: true
            },
            (err, sequence) => {
                if (err !== null) {
                    cb(err, null);
                    return;
                }
                const no: number = sequence.get('no');
                // 指定桁数になるように0で埋める
                let source = no.toString();
                while (source.length < digits) {
                    source = '0' + source;
                }
                cb(err, source);
            }
        );
    }
    /**
     * 画面入力値のモデルセット処理
     *
     * @param {T} model
     * @returns {T}
     */
    protected parseModel<T>(model: T): T {
        // 画面入力値をモデルにセット
        if (this.req) {
            Object.getOwnPropertyNames(this.req.body).forEach((propertyName) => {
                (<any>model)[propertyName] = this.req.body[propertyName];
            });
        }
        return model;
    }
}
