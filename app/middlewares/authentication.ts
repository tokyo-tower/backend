/**
 * ユーザー認証ミドルウェア
 */
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';

import { User } from '../user';

const debug = createDebug('ttts-backend:middlewares:authentication');

export default async (req: Request, res: Response, next: NextFunction) => {
    res.locals.req = req;
    req.masterAdminUser = User.PARSE(req.session, req.hostname);
    debug('req.masterAdminUser is authenticated?', req.masterAdminUser.isAuthenticated());

    res.locals.loginName = (req.masterAdminUser.isAuthenticated())
        ? `${req.masterAdminUser.familyName} ${req.masterAdminUser.givenName}`
        : '';

    // 既ログインの場合
    if (req.masterAdminUser.isAuthenticated()) {
        next();

        return;
    }

    if (req.xhr) {
        res.json({
            success: false,
            message: 'login required'
        });
    } else {
        debug('req.originalUrl', req.originalUrl);
        res.redirect(req.masterAdminUser.generateAuthUrl());
        // res.redirect(`/login?cb=${req.originalUrl}`);
    }
};
