import * as express from 'express';
import * as moment from 'moment';
import * as numeral from 'numeral';

/**
 * ベースコントローラー
 *
 * 基本的にコントローラークラスはルーティングクラスより呼ばれる
 * あらゆるルーティングで実行されるメソッドは、このクラスがベースとなるので、メソッド共通の処理はここで実装するとよい
 *
 * @export
 * @class BaseController
 */
export default class BaseController {
    /**
     * httpリクエストオブジェクト
     */
    public req: express.Request;
    /**
     * httpレスポンスオブジェクト
     */
    public res: express.Response;
    /**
     * 次に一致するルートメソッド
     */
    public next: express.NextFunction;

    /**
     * ルーティング
     */
    //public router: Express.NamedRoutes;

    /**
     * レイアウトファイル
     */
    public layout: string;

    constructor(req: express.Request, res: express.Response, next: express.NextFunction) {
        this.req = req;
        this.res = res;
        this.next = next;

        this.res.locals.req = this.req;
        this.res.locals.moment = moment;
        this.res.locals.numeral = numeral;
    }
}
