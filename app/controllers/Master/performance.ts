/**
 * @namespace performance
 * @desc パフォーマンスマスタコントローラー
 */
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';

const debug = createDebug('chevre-backend:controllers:performance');

/**
 * パフォーマンスマスタ管理表示
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 * @returns {void}
 */
export function index(_req: Request, res: Response, _next: NextFunction): void {
    debug('パフォーマンスマスタ管理表示');
    res.render('master/performance/', { layout: 'layouts/master/layout' });
}