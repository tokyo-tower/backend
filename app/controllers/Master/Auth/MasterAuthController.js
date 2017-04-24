"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chevre_domain_1 = require("@motionpicture/chevre-domain");
const Util = require("../../../../common/Util/Util");
const masterLoginForm_1 = require("../../../forms/master/masterLoginForm");
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
        this.masterHome = 'master.film.add';
    }
    /**
     * マスタ管理ログイン
     */
    login() {
        // 画面ID・タイトルセット
        this.res.locals.displayId = this.req.__('Master.Title.Login.Id');
        this.res.locals.title = this.req.__('Master.Title.Login.Name');
        this.res.locals.isValid = false;
        if (this.req.staffUser && this.req.staffUser.isAuthenticated()) {
            return this.res.redirect(this.router.build(this.masterHome));
        }
        if (this.req.method === 'POST') {
            masterLoginForm_1.default(this.req)(this.req, this.res, () => {
                const form = this.req.form;
                if (form && form.isValid) {
                    this.res.locals.isValid = true;
                    // ユーザー認証
                    this.logger.debug('finding master admin... user_id:', form.userId);
                    chevre_domain_1.Models.Staff.findOne({
                        user_id: form.userId,
                        is_admin: true
                    }, (findStaffErr, staff) => {
                        if (findStaffErr)
                            return this.next(new Error(this.req.__('Message.UnexpectedError')));
                        if (!staff) {
                            form.errors.push(this.req.__('Message.invalid{{fieldName}}', { fieldName: this.req.__('Form.FieldName.password') }));
                            this.res.render('master/auth/login');
                        }
                        else {
                            // パスワードチェック
                            if (staff.get('password_hash') !== Util.createHash(form.password, staff.get('password_salt'))) {
                                form.errors.push(this.req.__('Master.Message.invalidUserOrPassward'));
                                this.res.render('master/auth/login');
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
                                        return this.next(new Error(this.req.__('Message.UnexpectedError')));
                                    if (processRememberErr)
                                        return this.next(new Error(this.req.__('Message.UnexpectedError')));
                                    this.req.session[MasterAdminUser_1.default.AUTH_SESSION_NAME] = staff.toObject();
                                    this.req.session[MasterAdminUser_1.default.AUTH_SESSION_NAME].signature = form.signature;
                                    this.req.session[MasterAdminUser_1.default.AUTH_SESSION_NAME].locale = form.language;
                                    // if exist parameter cb, redirect to cb.
                                    // 作品マスタ登録へ＜とりあえず@@@@@
                                    const cb = (this.req.query.cb) ? this.req.query.cb : this.router.build(this.masterHome);
                                    this.res.redirect(cb);
                                });
                            }
                        }
                    });
                }
                else {
                    this.res.render('master/auth/login');
                }
            });
        }
        else {
            this.res.locals.userId = '';
            this.res.locals.password = '';
            this.res.locals.signature = '';
            this.res.render('master/auth/login');
        }
    }
    logout() {
        if (!this.req.session)
            return this.next(new Error(this.req.__('Message.UnexpectedError')));
        delete this.req.session[MasterAdminUser_1.default.AUTH_SESSION_NAME];
        chevre_domain_1.Models.Authentication.remove({ token: this.req.cookies.remember_master_admin }, (err) => {
            if (err)
                return this.next(err);
            this.res.clearCookie('remember_master_admin');
            this.res.redirect(this.router.build('master.login'));
        });
    }
}
exports.default = MasterAuthController;
//# sourceMappingURL=MasterAuthController.js.map