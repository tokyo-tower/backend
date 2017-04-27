import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import MasterAdminUser from '../models/user/masterAdmin';

const debug = createDebug('chevre-backend:middlewares:userAuthentication');

/**
 * ユーザー認証ミドルウェア
 */
export default (req: Request, res: Response, next: NextFunction) => {
    res.locals.req = req;
    req.staffUser = MasterAdminUser.PARSE(req.session);
    debug('req.staffUser:', req.staffUser);

    next();
};
