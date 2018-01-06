"use strict";
/**
 * マスタ管理者認証コントローラー
 * @namespace controllers.auth
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
const ttts = require("@motionpicture/ttts-domain");
const createDebug = require("debug");
const _ = require("underscore");
const Message = require("../../common/Const/Message");
const debug = createDebug('ttts-backend:controllers:master:auth');
const cookieName = 'remember_master_admin';
/**
 * マスタ管理ログイン
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.masterAdminUser !== undefined && req.masterAdminUser.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        let errors = {};
        if (req.method === 'POST') {
            // 検証
            validate(req);
            const validatorResult = yield req.getValidationResult();
            errors = validatorResult.mapped;
            if (validatorResult.isEmpty()) {
                try {
                    // ログイン情報が有効であれば、Cognitoでもログイン
                    req.session.cognitoCredentials =
                        yield ttts.service.admin.login(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY, process.env.API_CLIENT_ID, process.env.API_CLIENT_SECRET, process.env.COGNITO_USER_POOL_ID, req.body.username, req.body.password)();
                    debug('cognito credentials published.', req.session.cognitoCredentials);
                }
                catch (error) {
                    errors = { username: { msg: 'IDもしくはパスワードの入力に誤りがあります' } };
                }
                const cognitoCredentials = req.session.cognitoCredentials;
                if (cognitoCredentials !== undefined) {
                    const cognitoUser = yield ttts.service.admin.getUserByAccessToken(cognitoCredentials.accessToken)();
                    // ログイン
                    req.session.user = cognitoUser;
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
        try {
            if (req.session !== undefined) {
                delete req.session.user;
                delete req.session.cognitoCredentials;
            }
            // await ttts.Models.Authentication.remove({ token: req.cookies[cookieName] }).exec();
            res.clearCookie(cookieName);
            res.redirect('/login');
        }
        catch (error) {
            next(error);
        }
    });
}
exports.logout = logout;
