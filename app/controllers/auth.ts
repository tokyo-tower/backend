/**
 * マスタ管理者認証コントローラー
 * @namespace controllers.auth
 */

import * as ttts from '@motionpicture/ttts-domain';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as _ from 'underscore';

import * as Message from '../../common/Const/Message';

const debug = createDebug('ttts-backend:controllers:master:auth');

const cookieName = 'remember_master_admin';

/**
 * マスタ管理ログイン
 */
export async function login(req: Request, res: Response): Promise<void> {
    if (req.masterAdminUser !== undefined && req.masterAdminUser.isAuthenticated()) {
        res.redirect('/');

        return;
    }

    let errors: any = {};

    if (req.method === 'POST') {
        // 検証
        validate(req);
        const validatorResult = await req.getValidationResult();
        errors = validatorResult.mapped;

        if (validatorResult.isEmpty()) {
            try {
                // ログイン情報が有効であれば、Cognitoでもログイン
                (<Express.Session>req.session).cognitoCredentials =
                    await ttts.service.admin.login(
                        <string>process.env.AWS_ACCESS_KEY_ID,
                        <string>process.env.AWS_SECRET_ACCESS_KEY,
                        <string>process.env.API_CLIENT_ID,
                        <string>process.env.API_CLIENT_SECRET,
                        <string>process.env.COGNITO_USER_POOL_ID,
                        req.body.username,
                        req.body.password
                    )();
                debug('cognito credentials published.', (<Express.Session>req.session).cognitoCredentials);
            } catch (error) {
                errors = { username: { msg: 'IDもしくはパスワードの入力に誤りがあります' } };
            }

            const cognitoCredentials = (<Express.Session>req.session).cognitoCredentials;
            if (cognitoCredentials !== undefined) {
                const cognitoUser = await ttts.service.admin.getUserByAccessToken(cognitoCredentials.accessToken)();

                // ログイン
                (<Express.Session>req.session).user = cognitoUser;

                const cb = (!_.isEmpty(req.query.cb)) ? req.query.cb : '/';
                res.redirect(cb);

                return;
            }
        }
    }

    // ログイン画面遷移
    res.render('master/auth/login', {
        displayId: 'Aa-1',
        title: 'マスタ管理ログイン',
        errors: errors,
        routeName: 'master.login',
        layout: 'layouts/master/layoutLogin'
    });
}

function validate(req: Request): void {
    req.checkBody('username', Message.Common.required.replace('$fieldName$', 'ID')).notEmpty();
    req.checkBody('password', Message.Common.required.replace('$fieldName$', 'パスワード')).notEmpty();
}

/**
 * マスタ管理ログアウト
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session !== undefined) {
            delete req.session.user;
            delete req.session.cognitoCredentials;
        }

        // await ttts.Models.Authentication.remove({ token: req.cookies[cookieName] }).exec();

        res.clearCookie(cookieName);
        res.redirect('/login');
    } catch (error) {
        next(error);
    }
}
