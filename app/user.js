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
exports.User = void 0;
const cinerinoapi = require("@cinerino/sdk");
/**
 * 管理ユーザー
 */
class User {
    static PARSE(session, host) {
        const user = new User();
        user.session = session;
        // セッション値からオブジェクトにセット
        if (session !== undefined && session.user !== undefined) {
            user.familyName = session.user.familyName;
            user.givenName = session.user.givenName;
            user.email = session.user.email;
            user.telephone = session.user.telephone;
            user.username = session.user.username;
        }
        user.authClient = new cinerinoapi.auth.OAuth2({
            domain: process.env.API_AUTHORIZE_SERVER_DOMAIN,
            clientId: process.env.API_CLIENT_ID,
            clientSecret: process.env.API_CLIENT_SECRET,
            redirectUri: `https://${host}/signIn`,
            logoutUri: `https://${host}/logout`
        });
        user.authClient.setCredentials({ refresh_token: user.getRefreshToken() });
        return user;
    }
    /**
     * サインイン中かどうか
     */
    isAuthenticated() {
        return (this.username !== undefined);
    }
    generateAuthUrl() {
        return this.authClient.generateAuthUrl({
            scopes: [],
            state: this.state,
            codeVerifier: process.env.API_CODE_VERIFIER
        });
    }
    generateLogoutUrl() {
        return this.authClient.generateLogoutUrl();
    }
    getRefreshToken() {
        return (this.session !== undefined && this.session !== null
            && this.session.cognitoCredentials !== undefined && this.session.cognitoCredentials !== null)
            ? this.session.cognitoCredentials.refreshToken
            : undefined;
    }
    signIn(code) {
        return __awaiter(this, void 0, void 0, function* () {
            // 認証情報を取得できればログイン成功
            const credentials = yield this.authClient.getToken(code, process.env.API_CODE_VERIFIER);
            if (credentials.access_token === undefined) {
                throw new Error('Access token is required for credentials.');
            }
            if (credentials.refresh_token === undefined) {
                throw new Error('Refresh token is required for credentials.');
            }
            // リフレッシュトークンを保管
            // this.session.refreshToken = credentials.refresh_token;
            this.session.cognitoCredentials = {
                accessToken: credentials.access_token,
                expiresIn: credentials.expiry_date,
                idToken: credentials.id_token,
                refreshToken: credentials.refresh_token,
                tokenType: credentials.token_type
            };
            return this;
        });
    }
    logout() {
        // delete this.session.refreshToken;
        delete this.session.user;
        delete this.session.cognitoCredentials;
    }
}
exports.User = User;
