/**
 * @namespace performance
 * @desc パフォーマンスマスタコントローラー
 */
import { Models } from '@motionpicture/chevre-domain';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';

const debug = createDebug('chevre-backend:controllers:performance');

/**
 * パフォーマンスマスタ管理表示
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
export async function index(_: Request, res: Response, next: NextFunction): Promise<void> {
    debug('パフォーマンスマスタ管理表示');
    try {
        const theaters = await Models.Theater.find().exec();
        if (theaters.length === 0) {
            throw new Error('not theaters');
        }
        const films = await Models.Film.find().exec();
        if (theaters.length === 0) {
            throw new Error('not theaters');
        }
        if (films.length === 0) {
            throw new Error('not theaters');
        }
        res.render('master/performance/', {
            theaters: theaters,
            films: JSON.stringify(films),
            moment: moment,
            layout: 'layouts/master/layout'
        });
        return;
    } catch (err) {
        next(err);
        return;
    }
}

/**
 * パフォーマンス検索
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function search(req: Request, res: Response): Promise<void> {
    try {
        const theater = req.body.theater;
        const day = req.body.day;
        const screens = await Models.Screen.find({
            theater: theater
        }).exec();
        const performances = await Models.Performance.find({
            theater: theater,
            day: day
        }).exec();
        res.json({
            performances: performances,
            screens: screens
        });
        return;
    } catch(err) {
        res.json(null);
        return;
    }
}
