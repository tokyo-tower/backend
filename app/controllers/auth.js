"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = void 0;
/**
 * 認証コントローラー
 */
const tttsapi = require("@motionpicture/ttts-api-nodejs-client");
const createDebug = require("debug");
const request = require("request-promise-native");
const _ = require("underscore");
const debug = createDebug('ttts-backend:controllers:master:auth');
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
                    req.session.cognitoCredentials = yield request.post(`${process.env.TTTS_AUTHORIZE_SERVER}/oauth/token`, {
                        auth: {
                            user: process.env.API_CLIENT_ID,
                            pass: process.env.API_CLIENT_SECRET
                        },
                        json: true,
                        body: {
                            username: req.body.username,
                            password: req.body.password
                        }
                    }).then((body) => body);
                    debug('cognito credentials published.', req.session.cognitoCredentials);
                }
                catch (error) {
                    errors = { username: { msg: 'IDもしくはパスワードの入力に誤りがあります' } };
                }
                const cognitoCredentials = req.session.cognitoCredentials;
                if (cognitoCredentials !== undefined) {
                    // ログイン
                    const authClient = new tttsapi.auth.OAuth2({
                        domain: process.env.API_AUTHORIZE_SERVER_DOMAIN,
                        clientId: process.env.API_CLIENT_ID,
                        clientSecret: process.env.API_CLIENT_SECRET
                    });
                    authClient.setCredentials({
                        refresh_token: cognitoCredentials.refreshToken,
                        // expiry_date: number;
                        access_token: cognitoCredentials.accessToken,
                        token_type: cognitoCredentials.tokenType
                    });
                    yield authClient.refreshAccessToken();
                    const loginTicket = authClient.verifyIdToken({});
                    const profile = loginTicket.payload;
                    if (profile === undefined) {
                        throw new Error('cannot get profile from id_token');
                    }
                    // ログイン
                    req.session.user = {
                        username: profile['cognito:username'],
                        familyName: profile.family_name,
                        givenName: profile.given_name,
                        email: profile.email,
                        telephone: profile.phone_number
                    };
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
    req.checkBody('username', 'IDが未入力です').notEmpty();
    req.checkBody('password', 'パスワードが未入力です').notEmpty();
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
            res.redirect('/login');
        }
        catch (error) {
            next(error);
        }
    });
}
exports.logout = logout;
