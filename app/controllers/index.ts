/**
 * インデックスコントローラー
 *
 * @namespace controller/index
 */

import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';

const debug = createDebug('chevre-backend:controllers:index');

export function index(req: Request, res: Response, next: NextFunction) {
    debug('query:', req.query);
    if (req.query.next !== undefined) {
        next(new Error(req.param('next')));
        return;
    }

    res.render('index');
}
