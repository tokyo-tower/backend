"use strict";
/**
 * マスタ管理者認証コントローラー
 *
 * @namespace controller/master/auth
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TTTS = require("@motionpicture/ttts-domain");
const _ = require("underscore");
const Message = require("../../../common/Const/Message");
const masterAdmin_1 = require("../../models/user/masterAdmin");
const masterHome = '/master/films';
// todo 別の場所で定義
const cookieName = 'remember_master_admin';
/**
 * マスタ管理ログイン
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.staffUser !== undefined && req.staffUser.isAuthenticated()) {
            res.redirect(masterHome);
            return;
        }
        let errors = {};
        if (req.method === 'POST') {
            // 検証
            validate(req);
            const validatorResult = yield req.getValidationResult();
            errors = req.validationErrors(true);
            if (validatorResult.isEmpty()) {
                // ユーザー認証
                const owner = yield TTTS.Models.Owner.findOne({
                    username: req.body.username,
                    group: TTTS.OwnerUtil.GROUP_STAFF
                }).exec();
                if (owner === null) {
                    errors = { username: { msg: 'IDもしくはパスワードの入力に誤りがあります' } };
                }
                else {
                    // パスワードチェック
                    if (owner.get('password_hash') !== TTTS.CommonUtil.createHash(req.body.password, owner.get('password_salt'))) {
                        errors = { username: { msg: 'IDもしくはパスワードの入力に誤りがあります' } };
                    }
                    else {
                        // ログイン記憶
                        if (req.body.remember === 'on') {
                            // トークン生成
                            const authentication = yield TTTS.Models.Authentication.create({
                                token: TTTS.CommonUtil.createToken(),
                                owner: owner.get('_id'),
                                signature: req.body.signature
                            });
                            // tslint:disable-next-line:no-cookies
                            res.cookie(cookieName, authentication.get('token'), { path: '/', httpOnly: true, maxAge: 604800000 });
                        }
                        req.session[masterAdmin_1.default.AUTH_SESSION_NAME] = owner.toObject();
                        req.session[masterAdmin_1.default.AUTH_SESSION_NAME].signature = req.body.signature;
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
    });
}
exports.login = login;
function validate(req) {
    req.checkBody('username', Message.Common.required.replace('$fieldName$', 'ID')).notEmpty();
    req.checkBody('password', Message.Common.required.replace('$fieldName$', 'パスワード')).notEmpty();
}
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
        yield TTTS.Models.Authentication.remove({ token: req.cookies[cookieName] }).exec();
        res.clearCookie(cookieName);
        res.redirect('/master/login');
    });
}
exports.logout = logout;
