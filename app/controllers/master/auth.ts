/**
 * マスタ管理者認証コントローラー
 *
 * @namespace controller/master/auth
 */

import { CommonUtil, Models } from '@motionpicture/chevre-domain';
import { NextFunction, Request, Response } from 'express';
import * as _ from 'underscore';

import * as Message from '../../../common/Const/Message';
import MasterAdminUser from '../../models/user/masterAdmin';

const masterHome: string = '/master/films';
// todo 別の場所で定義
const cookieName = 'remember_master_admin';

/**
 * マスタ管理ログイン
 */
export async function login(req: Request, res: Response): Promise<void> {
    if (req.staffUser !== undefined && req.staffUser.isAuthenticated()) {
        res.redirect(masterHome);
        return;
    }

    let errors: any = {};

    if (req.method === 'POST') {
        // 検証
        validate(req);
        const validatorResult = await req.getValidationResult();
        errors = req.validationErrors(true);
        if (validatorResult.isEmpty()) {
            // ユーザー認証
            const staff = await Models.Staff.findOne(
                {
                    user_id: req.body.userId,
                    is_admin: true
                }
            ).exec();

            if (staff === null) {
                errors = { userId: { msg: 'IDもしくはパスワードの入力に誤りがあります' } };
            } else {
                // パスワードチェック
                if (staff.get('password_hash') !== CommonUtil.createHash(req.body.password, staff.get('password_salt'))) {
                    errors = { userId: { msg: 'IDもしくはパスワードの入力に誤りがあります' } };
                } else {
                    // ログイン記憶
                    if (req.body.remember === 'on') {
                        // トークン生成
                        const authentication = await Models.Authentication.create(
                            {
                                token: CommonUtil.createToken(),
                                staff: staff.get('_id'),
                                signature: req.body.signature
                            }
                        );

                        // tslint:disable-next-line:no-cookies
                        res.cookie(
                            cookieName,
                            authentication.get('token'),
                            { path: '/', httpOnly: true, maxAge: 604800000 }
                        );
                    }

                    (<Express.Session>req.session)[MasterAdminUser.AUTH_SESSION_NAME] = staff.toObject();
                    (<Express.Session>req.session)[MasterAdminUser.AUTH_SESSION_NAME].signature = req.body.signature;
                    // if exist parameter cb, redirect to cb.
                    // 作品マスタ登録へ＜とりあえず@@@@@
                    const cb = (!_.isEmpty(req.query.cb)) ? req.query.cb : masterHome;
                    res.redirect(cb);
                    return;
                }
            }
        }
    }

    // ログイン画面遷移
    res.render('master/auth/login', {
        displayId: 'Aa-1',
        title: 'マスタ管理ログイン',
        errors: errors,
        layout: 'layouts/master/layoutLogin'
    });
}

function validate(req: Request): void {
    req.checkBody('userId', Message.Common.required.replace('$fieldName$', 'ID')).notEmpty();
    req.checkBody('password', Message.Common.required.replace('$fieldName$', 'パスワード')).notEmpty();
}

/**
 * マスタ管理ログアウト
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.session === undefined) {
        next(new Error(Message.Common.unexpectedError));
        return;
    }

    delete req.session[MasterAdminUser.AUTH_SESSION_NAME];
    await Models.Authentication.remove({ token: req.cookies[cookieName] }).exec();

    res.clearCookie(cookieName);
    res.redirect('/master/login');
}
