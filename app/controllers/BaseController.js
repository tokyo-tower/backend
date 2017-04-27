"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const numeral = require("numeral");
/**
 * ベースコントローラー
 *
 * 基本的にコントローラークラスはルーティングクラスより呼ばれる
 * あらゆるルーティングで実行されるメソッドは、このクラスがベースとなるので、メソッド共通の処理はここで実装するとよい
 *
 * @export
 * @class BaseController
 */
class BaseController {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
        this.res.locals.req = this.req;
        this.res.locals.moment = moment;
        this.res.locals.numeral = numeral;
    }
}
exports.default = BaseController;
