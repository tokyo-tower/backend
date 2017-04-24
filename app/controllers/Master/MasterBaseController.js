"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chevre_domain_1 = require("@motionpicture/chevre-domain");
const moment = require("moment");
//import * as mongoose from 'mongoose';
const BaseController_1 = require("../BaseController");
/**
 * マスタ共通コントローラー基底クラス
 *
 * @export
 * @class MasterBaseController
 * @extends {BaseController}
 */
class MasterBaseController extends BaseController_1.default {
    /**
     * 前方一致正規表現取得
     *
     * @param {string} value
     * @returns {RegExp}
     */
    static getRegxForwardMatching(value) {
        return new RegExp('^' + value);
    }
    static toISOStringJapan(dateStr, addDay = 0) {
        const m = moment(dateStr, 'YYYY/MM/DD');
        const m2 = m.add(addDay, 'days');
        const dateWk = m2.format('YYYYMMDD');
        //const dateWk: string = dateStr.replace(/'\/'/g, '');
        const year = dateWk.substr(0, 4);
        const month = dateWk.substr(4, 2);
        const day = dateWk.substr(6, 2);
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
    static getId(target, digits, cb) {
        chevre_domain_1.Models.Sequence.findOneAndUpdate({ target: target }, {
            $inc: { no: 1 }
        }, {
            upsert: true,
            new: true
        }, (err, sequence) => {
            if (err !== null) {
                cb(err, null);
                return;
            }
            const no = sequence.get('no');
            // 指定桁数になるように0で埋める
            let source = no.toString();
            while (source.length < digits) {
                source = '0' + source;
            }
            cb(err, source);
        });
    }
    /**
     * 画面入力値のモデルセット処理
     *
     * @param {T} model
     * @returns {T}
     */
    parseModel(model) {
        // 画面入力値をモデルにセット
        if (this.req) {
            Object.getOwnPropertyNames(this.req.body).forEach((propertyName) => {
                model[propertyName] = this.req.body[propertyName];
            });
        }
        return model;
    }
}
exports.default = MasterBaseController;
//# sourceMappingURL=MasterBaseController.js.map