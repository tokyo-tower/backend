"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * マスタ共通コントローラー基底クラス
 * @namespace masterBaseController
 */
const chevre_domain_1 = require("@motionpicture/chevre-domain");
//import * as mongoose from 'mongoose';
/**
 * 前方一致正規表現取得
 *
 * @param {string} value
 * @returns {RegExp}
 */
function getRegxForwardMatching(value) {
    return new RegExp('^' + value);
}
exports.getRegxForwardMatching = getRegxForwardMatching;
/**
 * Id自動採番
 *
 * @param {string} target
 * @param {number} digits
 * @returns {Promise<string | null>}
 */
function getId(target, digits) {
    return __awaiter(this, void 0, void 0, function* () {
        const sequence = yield chevre_domain_1.Models.Sequence.findOneAndUpdate({ target: target }, {
            $inc: { no: 1 }
        }, {
            upsert: true,
            new: true
        }).exec();
        const no = sequence.get('no');
        // 指定桁数になるように0で埋める
        let source = no.toString();
        while (source.length < digits) {
            source = '0' + source;
        }
        return source;
    });
}
exports.getId = getId;
