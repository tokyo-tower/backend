"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chevre_domain_1 = require("@motionpicture/chevre-domain");
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