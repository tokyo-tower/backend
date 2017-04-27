/**
 * ユーザー認証ミドルウェア
 *
 * @module middlewares/userAuthentication
 */

import { CommonUtil, Models } from '@motionpicture/chevre-domain';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';

import * as Message from '../../common/Const/Message';
import MasterAdminUser from '../models/user/masterAdmin';

const debug = createDebug('chevre-backend:middlewares:userAuthentication');
const cookieName = 'remember_master_admin';

export default async (req: Request, res: Response, next: NextFunction) => {
    res.locals.req = req;
    req.staffUser = MasterAdminUser.PARSE(req.session);
    debug('req.staffUser:', req.staffUser);

    if (req.staffUser === undefined) {
        next(new Error(Message.Common.unexpectedError));
        return;
    }

    // 既ログインの場合
    if (req.staffUser.isAuthenticated()) {
        next();
        return;
    }

    // 自動ログインチェック
    const userSession = await checkRemember(req, res);
    if (userSession !== null && req.session !== undefined) {
        // ログインしてリダイレクト
        req.session[MasterAdminUser.AUTH_SESSION_NAME] = userSession.staff.toObject();
        res.redirect(req.originalUrl);
    } else {
        if (req.xhr) {
            res.json({
                success: false,
                message: 'login required'
            });
        } else {
            res.redirect(`/master/login?cb=${req.originalUrl}`);
        }
    }
};

/**
 * ログイン記憶しているかどうか確認する
 *
 * @param {Request} req リクエスト
 * @param {Response} res レスポンス
 * @returns {Document|null}
 */
async function checkRemember(req: Request, res: Response) {
    if (req.cookies[cookieName] === undefined) {
        return null;
    }

    try {
        const authenticationDoc = await Models.Authentication.findOne(
            {
                token: req.cookies[cookieName],
                staff: { $ne: null }
            }
        ).exec();

        if (authenticationDoc === null) {
            res.clearCookie(cookieName);
            return null;
        }

        // トークン再生成
        const token = CommonUtil.createToken();
        await authenticationDoc.update({ token: token }).exec();

        // tslint:disable-next-line:no-cookies
        res.cookie(cookieName, token, { path: '/', httpOnly: true, maxAge: 604800000 });
        const staff = await Models.Staff.findOne({ _id: authenticationDoc.get('staff') }).exec();
        return {
            staff: staff
        };
    } catch (error) {
        return null;
    }
}
