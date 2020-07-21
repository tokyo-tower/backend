/**
 * 認証ルーター
 */
import { Router } from 'express';
// import * as authController from '../controllers/auth';

import { User } from '../user';

const authRouter = Router();

// authRouter.all('/login', authController.login);
// authRouter.all('/logout', authController.logout);

/**
 * サインイン
 * Cognitoからリダイレクトしてくる
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
authRouter.get(
    '/signIn',
    async (req, res, next) => {
        try {
            // stateにはイベントオブジェクトとして受け取ったリクエストボディが入っている
            const user = User.PARSE(req.session, req.hostname);

            await user.signIn(req.query.code);

            user.authClient.setCredentials({
                refresh_token: user.getRefreshToken()
            });
            await user.authClient.refreshAccessToken();

            const loginTicket = user.authClient.verifyIdToken({});
            const profile = (<any>loginTicket).payload;
            if (profile === undefined) {
                throw new Error('cannot get profile from id_token');
            }

            // ログイン
            (<Express.Session>req.session).user = {
                username: profile['cognito:username'],
                familyName: profile.family_name,
                givenName: profile.given_name,
                email: profile.email,
                telephone: profile.phone_number
            };

            const cb = (typeof req.query.cb === 'string' && req.query.cb.length > 0) ? req.query.cb : '/';
            res.redirect(cb);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ログアウト
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
authRouter.get(
    '/logout',
    async (req, res, next) => {
        try {
            const user = User.PARSE(req.session, req.hostname);

            user.logout();
            res.redirect('/');
        } catch (error) {
            next(error);
        }
    }
);

export default authRouter;
