import { Models } from '@motionpicture/chevre-domain';
import * as mongoose from 'mongoose';
import * as Message from '../../../../common/Const/Message';
import * as Util from '../../../../common/Util/Util';
import MasterAdminUser from '../../../models/User/MasterAdminUser';
import MasterBaseController from '../MasterBaseController';

/**
 * マスタ管理者認証コントローラー
 *
 * @export
 * @class MasterAuthController
 * @extends {MasterBaseController}
 */
export default class MasterAuthController extends MasterBaseController {
    public layout: string = 'layouts/master/layoutLogin';
    private masterHome: string = '/master/film/add';
    /**
     * マスタ管理ログイン
     */
    // tslint:disable-next-line:max-func-body-length
    public login(): void {
        this.res.locals.isValid = false;
        if (this.req.staffUser && this.req.staffUser.isAuthenticated()) {
            return this.res.redirect(this.masterHome);
        }
        if (this.req.method === 'POST') {
            // 検証
            this.req.assert('userId', Message.Common.required.replace('$fieldName$', 'ID')).notEmpty();
            this.req.assert('password', Message.Common.required.replace('$fieldName$', 'パスワード')).notEmpty();
            const errors = this.req.validationErrors(true);
            const isValid: boolean = !errors;
            this.res.locals.isValid = isValid;
            const form = {
                userId: this.req.body.userId,
                password: this.req.body.password
            };
            const customErrors: string[] = [];
            if (isValid) {
                this.res.locals.isValid = true;
                // ユーザー認証
                //this.logger.debug('finding master admin... user_id:', (<any>form).userId);
                Models.Staff.findOne(
                    {
                        user_id: this.req.body.userId,
                        is_admin: true
                    },
                    (findStaffErr, staff) => {
                        if (findStaffErr) return this.next(new Error(Message.Common.unexpectedError));
                        if (!staff) {
                            customErrors.push(Message.Common.invalidUserOrPassward);
                            // ログイン画面遷移
                            this.renderLogin(form, errors, customErrors);
                        } else {
                            // パスワードチェック
                            if (staff.get('password_hash') !== Util.createHash((<any>form).password, staff.get('password_salt'))) {
                                customErrors.push(Message.Common.invalidUserOrPassward);
                                // ログイン画面遷移
                                this.renderLogin(form, errors, customErrors);
                            } else {
                                // ログイン記憶
                                const processRemember = (cb: (err: Error | null, token: string | null) => void) => {
                                    if ((<any>form).remember) {
                                        // トークン生成
                                        Models.Authentication.create(
                                            {
                                                token: Util.createToken(),
                                                staff: staff.get('_id'),
                                                signature: (<any>form).signature,
                                                locale: (<any>form).language
                                            },
                                            (createAuthenticationErr: any, authentication: mongoose.Document) => {
                                                this.res.cookie(
                                                    'remember_master_admin',
                                                    authentication.get('token'),
                                                    { path: '/', httpOnly: true, maxAge: 604800000 }
                                                );
                                                cb(createAuthenticationErr, authentication.get('token'));
                                            }
                                        );
                                    } else {
                                        cb(null, null);
                                    }
                                };
                                processRemember((processRememberErr) => {
                                    if (!this.req.session) return this.next(new Error(Message.Common.unexpectedError));
                                    if (processRememberErr) return this.next(new Error(Message.Common.unexpectedError));
                                    this.req.session[MasterAdminUser.AUTH_SESSION_NAME] = staff.toObject();
                                    this.req.session[MasterAdminUser.AUTH_SESSION_NAME].signature = (<any>form).signature;
                                    this.req.session[MasterAdminUser.AUTH_SESSION_NAME].locale = (<any>form).language;
                                    // if exist parameter cb, redirect to cb.
                                    // 作品マスタ登録へ＜とりあえず@@@@@
                                    const cb = (this.req.query.cb) ? this.req.query.cb : this.masterHome;
                                    this.res.redirect(cb);
                                });
                            }
                        }
                    }
                );
            } else {
                // ログイン画面遷移
                this.renderLogin(form, errors);
            }
        } else {
            this.res.locals.userId = '';
            this.res.locals.password = '';
            this.res.locals.signature = '';
            // ログイン画面遷移
            this.renderLogin(null, null);
        }
    }
    /**
     * マスタ管理ログアウト
     */
    public logout(): void {
        if (!this.req.session) return this.next(new Error(Message.Common.unexpectedError));
        delete this.req.session[MasterAdminUser.AUTH_SESSION_NAME];
        Models.Authentication.remove({ token: this.req.cookies.remember_master_admin }, (err) => {
            if (err) return this.next(err);
            this.res.clearCookie('remember_master_admin');
            // ログイン画面遷移
            this.renderLogin(null, null);
        });
    }
    /**
     * ログイン画面遷移
     *
     * @param {any} errors
     */
    private renderLogin (form: any, errors: any, customErrors: string[] = []): void {
        // 画面ID・タイトルセット
        this.res.locals.displayId = 'Aa-1';
        this.res.locals.title = 'マスタ管理ログイン';
        if (!form) {
            form = {userId: '', password: ''};
        }
        this.res.render('master/auth/login', {
            form: form,
            errors: errors,
            customErrors: customErrors
        });
    }
}
