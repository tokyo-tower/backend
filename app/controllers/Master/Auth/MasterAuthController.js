"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chevre_domain_1 = require("@motionpicture/chevre-domain");
const Message = require("../../../../common/Const/Message");
const Util = require("../../../../common/Util/Util");
const MasterAdminUser_1 = require("../../../models/User/MasterAdminUser");
const MasterBaseController_1 = require("../MasterBaseController");
/**
 * マスタ管理者認証コントローラー
 *
 * @export
 * @class MasterAuthController
 * @extends {MasterBaseController}
 */
class MasterAuthController extends MasterBaseController_1.default {
    constructor() {
        super(...arguments);
        this.layout = 'layouts/master/layoutLogin';
        this.masterHome = '/master/film/add';
    }
    /**
     * マスタ管理ログイン
     */
    // tslint:disable-next-line:max-func-body-length
    login() {
        this.res.locals.isValid = false;
        if (this.req.staffUser && this.req.staffUser.isAuthenticated()) {
            return this.res.redirect(this.masterHome);
        }
        if (this.req.method === 'POST') {
            // 検証
            this.req.assert('userId', Message.Common.required.replace('$fieldName$', 'ID')).notEmpty();
            this.req.assert('password', Message.Common.required.replace('$fieldName$', 'パスワード')).notEmpty();
            const errors = this.req.validationErrors(true);
            const isValid = !errors;
            this.res.locals.isValid = isValid;
            const form = {
                userId: this.req.body.userId,
                password: this.req.body.password
            };
            const customErrors = [];
            if (isValid) {
                this.res.locals.isValid = true;
                // ユーザー認証
                //this.logger.debug('finding master admin... user_id:', (<any>form).userId);
                chevre_domain_1.Models.Staff.findOne({
                    user_id: this.req.body.userId,
                    is_admin: true
                }, (findStaffErr, staff) => {
                    if (findStaffErr)
                        return this.next(new Error(Message.Common.unexpectedError));
                    if (!staff) {
                        customErrors.push(Message.Common.invalidUserOrPassward);
                        // ログイン画面遷移
                        this.renderLogin(form, errors, customErrors);
                    }
                    else {
                        // パスワードチェック
                        if (staff.get('password_hash') !== Util.createHash(form.password, staff.get('password_salt'))) {
                            customErrors.push(Message.Common.invalidUserOrPassward);
                            // ログイン画面遷移
                            this.renderLogin(form, errors, customErrors);
                        }
                        else {
                            // ログイン記憶
                            const processRemember = (cb) => {
                                if (form.remember) {
                                    // トークン生成
                                    chevre_domain_1.Models.Authentication.create({
                                        token: Util.createToken(),
                                        staff: staff.get('_id'),
                                        signature: form.signature,
                                        locale: form.language
                                    }, (createAuthenticationErr, authentication) => {
                                        this.res.cookie('remember_master_admin', authentication.get('token'), { path: '/', httpOnly: true, maxAge: 604800000 });
                                        cb(createAuthenticationErr, authentication.get('token'));
                                    });
                                }
                                else {
                                    cb(null, null);
                                }
                            };
                            processRemember((processRememberErr) => {
                                if (!this.req.session)
                                    return this.next(new Error(Message.Common.unexpectedError));
                                if (processRememberErr)
                                    return this.next(new Error(Message.Common.unexpectedError));
                                this.req.session[MasterAdminUser_1.default.AUTH_SESSION_NAME] = staff.toObject();
                                this.req.session[MasterAdminUser_1.default.AUTH_SESSION_NAME].signature = form.signature;
                                this.req.session[MasterAdminUser_1.default.AUTH_SESSION_NAME].locale = form.language;
                                // if exist parameter cb, redirect to cb.
                                // 作品マスタ登録へ＜とりあえず@@@@@
                                const cb = (this.req.query.cb) ? this.req.query.cb : this.masterHome;
                                this.res.redirect(cb);
                            });
                        }
                    }
                });
            }
            else {
                // ログイン画面遷移
                this.renderLogin(form, errors);
            }
        }
        else {
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
    logout() {
        if (!this.req.session)
            return this.next(new Error(Message.Common.unexpectedError));
        delete this.req.session[MasterAdminUser_1.default.AUTH_SESSION_NAME];
        chevre_domain_1.Models.Authentication.remove({ token: this.req.cookies.remember_master_admin }, (err) => {
            if (err)
                return this.next(err);
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
    renderLogin(form, errors, customErrors = []) {
        // 画面ID・タイトルセット
        this.res.locals.displayId = 'Aa-1';
        this.res.locals.title = 'マスタ管理ログイン';
        if (!form) {
            form = { userId: '', password: '' };
        }
        this.res.render('master/auth/login', {
<<<<<<< HEAD
            form: form,
            errors: errors,
            customErrors: customErrors
=======
            errors: errors,
            layout: 'layouts/master/layoutLogin'
>>>>>>> CHEVRE-32
        });
    }
}
exports.default = MasterAuthController;
