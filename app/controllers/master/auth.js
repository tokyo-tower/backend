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
const chevre_domain_1 = require("@motionpicture/chevre-domain");
const Message = require("../../../common/Const/Message");
const masterAdmin_1 = require("../../models/user/masterAdmin");
/**
 * マスタ管理者認証コントローラー
 *
 * @export
 * @class MasterAuthController
 * @extends {MasterBaseController}
 */
const masterHome = '/master/films';
/**
 * マスタ管理ログイン
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const customErrors = [];
        // 検証
        req.assert('userId', Message.Common.required.replace('$fieldName$', 'ID')).notEmpty();
        req.assert('password', Message.Common.required.replace('$fieldName$', 'パスワード')).notEmpty();
        const validatorResult = yield req.getValidationResult();
        const errors = req.validationErrors(true);
        if (!validatorResult.isEmpty()) {
            // ログイン画面遷移
            renderLogin(res, form, errors);
            return;
        }
        // ユーザー認証
        const staff = yield chevre_domain_1.Models.Staff.findOne({
            user_id: req.body.userId,
            is_admin: true
        });
        if (staff === null) {
            customErrors.push(Message.Common.invalidUserOrPassward);
            // ログイン画面遷移
            renderLogin(res, form, errors, customErrors);
            return;
        }
        // パスワードチェック
        if (staff.get('password_hash') !== chevre_domain_1.CommonUtil.createHash(form.password, staff.get('password_salt'))) {
            customErrors.push(Message.Common.invalidUserOrPassward);
            // ログイン画面遷移
            renderLogin(res, form, errors, customErrors);
            return;
        }
        // ログイン記憶
        if (form.remember) {
            // トークン生成
            const authentication = yield chevre_domain_1.Models.Authentication.create({
                token: chevre_domain_1.CommonUtil.createToken(),
                staff: staff.get('_id'),
                signature: form.signature,
                locale: form.language
            });
            res.cookie('remember_master_admin', authentication.get('token'), { path: '/', httpOnly: true, maxAge: 604800000 });
        }
        req.session[masterAdmin_1.default.AUTH_SESSION_NAME] = staff.toObject();
        req.session[masterAdmin_1.default.AUTH_SESSION_NAME].signature = form.signature;
        req.session[masterAdmin_1.default.AUTH_SESSION_NAME].locale = form.language;
        // if exist parameter cb, redirect to cb.
        // 作品マスタ登録へ＜とりあえず@@@@@
        const cb = (req.query.cb) ? req.query.cb : masterHome;
        res.redirect(cb);
    });
}
exports.login = login;
/**
 * マスタ管理ログアウト
 */
function logout(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session === undefined) {
            next(new Error(Message.Common.unexpectedError));
            return;
        }
        delete req.session[masterAdmin_1.default.AUTH_SESSION_NAME];
        yield chevre_domain_1.Models.Authentication.remove({ token: req.cookies.remember_master_admin }).exec();
        res.clearCookie('remember_master_admin');
        res.redirect('/master/login');
    });
}
exports.logout = logout;
/**
 * ログイン画面遷移
 *
 * @param {any} errors
 */
function renderLogin(res, form, errors, customErrors = []) {
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
