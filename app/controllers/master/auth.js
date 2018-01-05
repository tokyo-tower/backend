"use strict";
/**
 * マスタ管理者認証コントローラー
 * @namespace controllers.master.auth
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
const AWS = require("aws-sdk");
const crypto = require("crypto");
const createDebug = require("debug");
const _ = require("underscore");
const Message = require("../../../common/Const/Message");
const debug = createDebug('ttts-backend:controllers:master:auth');
const masterHome = '/master/report';
const cookieName = 'remember_master_admin';
/**
 * マスタ管理ログイン
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.masterAdminUser !== undefined && req.masterAdminUser.isAuthenticated()) {
            res.redirect(masterHome);
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
                        yield getCognitoCredentials(req.body.username, req.body.password);
                    debug('cognito credentials published.', req.session.cognitoCredentials);
                }
                catch (error) {
                    errors = { username: { msg: 'IDもしくはパスワードの入力に誤りがあります' } };
                }
                const cognitoCredentials = req.session.cognitoCredentials;
                if (cognitoCredentials !== undefined) {
                    const cognitoUser = yield getCognitoUser(cognitoCredentials.AccessToken);
                    // ログイン
                    req.session.masterAdminUser = cognitoUser;
                    const cb = (!_.isEmpty(req.query.cb)) ? req.query.cb : masterHome;
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
                delete req.session.masterAdminUser;
            }
            yield ttts.Models.Authentication.remove({ token: req.cookies[cookieName] }).exec();
            res.clearCookie(cookieName);
            res.redirect('/master/login');
        }
        catch (error) {
            next(error);
        }
    });
}
exports.logout = logout;
function getCognitoUser(accesssToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                apiVersion: 'latest',
                region: 'ap-northeast-1'
            });
            cognitoIdentityServiceProvider.getUser({
                AccessToken: accesssToken
            }, (err, data) => {
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    resolve({
                        username: data.Username,
                        // id: <string>(<CognitoUserAttributeType>data.UserAttributes.find((a) => a.Name === 'sub')).Value,
                        familyName: data.UserAttributes.find((a) => a.Name === 'family_name').Value,
                        givenName: data.UserAttributes.find((a) => a.Name === 'given_name').Value,
                        email: data.UserAttributes.find((a) => a.Name === 'email').Value,
                        telephone: data.UserAttributes.find((a) => a.Name === 'phone_number').Value
                    });
                }
            });
        });
    });
}
/**
 * Cognito認証情報を取得する
 * @param {string} username ユーザーネーム
 * @param {string} password パスワード
 */
function getCognitoCredentials(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
                region: 'ap-northeast-1',
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });
            const hash = crypto.createHmac('sha256', process.env.API_CLIENT_SECRET)
                .update(`${username}${process.env.API_CLIENT_ID}`)
                .digest('base64');
            const params = {
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                ClientId: process.env.API_CLIENT_ID,
                AuthFlow: 'ADMIN_NO_SRP_AUTH',
                AuthParameters: {
                    USERNAME: username,
                    SECRET_HASH: hash,
                    PASSWORD: password
                }
                // ClientMetadata?: ClientMetadataType;
                // AnalyticsMetadata?: AnalyticsMetadataType;
                // ContextData?: ContextDataType;
            };
            cognitoidentityserviceprovider.adminInitiateAuth(params, (err, data) => {
                debug('adminInitiateAuth result:', err, data);
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    if (data.AuthenticationResult === undefined) {
                        reject(new Error('Unexpected.'));
                    }
                    else {
                        resolve(data.AuthenticationResult);
                    }
                }
            });
        });
    });
}
