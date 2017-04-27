import { CommonUtil, Models } from '@motionpicture/chevre-domain';
import { NextFunction, Request, Response } from 'express';
import * as Message from '../../../common/Const/Message';
import MasterAdminUser from '../../models/user/masterAdmin';

/**
 * マスタ管理者認証コントローラー
 *
 * @export
 * @class MasterAuthController
 * @extends {MasterBaseController}
 */

const masterHome: string = '/master/films';

/**
 * マスタ管理ログイン
 */
export async function login(req: Request, res: Response): Promise<void> {
    res.locals.isValid = false;
    if (req.staffUser && req.staffUser.isAuthenticated()) {
        res.redirect(masterHome);
        return;
    }

    if (req.method !== 'POST') {
        res.locals.userId = '';
        res.locals.password = '';
        res.locals.signature = '';
        // ログイン画面遷移
        renderLogin(res, null, null);
        return;
    }

    const form = {
        userId: req.body.userId,
        password: req.body.password
    };
    const customErrors: string[] = [];

    // 検証
    req.assert('userId', Message.Common.required.replace('$fieldName$', 'ID')).notEmpty();
    req.assert('password', Message.Common.required.replace('$fieldName$', 'パスワード')).notEmpty();
    const validatorResult = await req.getValidationResult();
    const errors = req.validationErrors(true);
    if (!validatorResult.isEmpty()) {
        // ログイン画面遷移
        renderLogin(res, form, errors);
        return;
    }

    // ユーザー認証
    const staff = await Models.Staff.findOne(
        {
            user_id: req.body.userId,
            is_admin: true
        }
    );
    if (staff === null) {
        customErrors.push(Message.Common.invalidUserOrPassward);
        // ログイン画面遷移
        renderLogin(res, form, errors, customErrors);
        return;
    }

    // パスワードチェック
    if (staff.get('password_hash') !== CommonUtil.createHash((<any>form).password, staff.get('password_salt'))) {
        customErrors.push(Message.Common.invalidUserOrPassward);
        // ログイン画面遷移
        renderLogin(res, form, errors, customErrors);
        return;
    }

    // ログイン記憶
    if ((<any>form).remember) {
        // トークン生成
        const authentication = await Models.Authentication.create(
            {
                token: CommonUtil.createToken(),
                staff: staff.get('_id'),
                signature: (<any>form).signature,
                locale: (<any>form).language
            }
        );

        res.cookie(
            'remember_master_admin',
            authentication.get('token'),
            { path: '/', httpOnly: true, maxAge: 604800000 }
        );
    }

    (<Express.Session>req.session)[MasterAdminUser.AUTH_SESSION_NAME] = staff.toObject();
    (<Express.Session>req.session)[MasterAdminUser.AUTH_SESSION_NAME].signature = (<any>form).signature;
    (<Express.Session>req.session)[MasterAdminUser.AUTH_SESSION_NAME].locale = (<any>form).language;
    // if exist parameter cb, redirect to cb.
    // 作品マスタ登録へ＜とりあえず@@@@@
    const cb = (req.query.cb) ? req.query.cb : masterHome;
    res.redirect(cb);
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
    await Models.Authentication.remove({ token: req.cookies.remember_master_admin }).exec();

    res.clearCookie('remember_master_admin');
    res.redirect('/master/login');
}

/**
 * ログイン画面遷移
 *
 * @param {any} errors
 */
function renderLogin(res: Response, form: any, errors: any, customErrors: string[] = []): void {
    // 画面ID・タイトルセット
    res.locals.displayId = 'Aa-1';
    res.locals.title = 'マスタ管理ログイン';
    if (!form) {
        form = { userId: '', password: '' };
    }
    res.render('master/auth/login', {
        form: form,
        errors: errors,
        customErrors: customErrors,
        layout: 'layouts/master/layoutLogin'
    });
}
