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
        res.render('master/performance/', {
            theaters: theaters,
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
 * @function search
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
        }).populate('film', 'name').exec();
        res.json({
            performances: performances,
            screens: screens
        });
        return;
    } catch (err) {
        debug('search error', err);
        res.json(null);
        return;
    }
}

/**
 * 作品検索
 * @function filmSearch
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function filmSearch(req: Request, res: Response): Promise<void> {
    try {
        const id = req.body.id;
        const film = await Models.Film.findById(id).exec();
        res.json({
            film: film
        });
        return;
    } catch (err) {
        debug('filmSearch error', err);
        res.json(null);
        return;
    }
}

/**
 * 新規登録
 * @function regist
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function regist(req: Request, res: Response): Promise<void> {
    try {
        const theater = await Models.Theater.findById(req.body.theater).exec();
        const screen = await Models.Screen.findById(req.body.screen).exec();
        await Models.Performance.create({
            theater: req.body.theater,
            screen: req.body.screen,
            film: req.body.film,
            day: req.body.day,
            open_time: req.body.openTime,
            start_time: req.body.startTime,
            end_time: req.body.endTime,
            theater_name: theater.get('name'),
            screen_name: screen.get('name')
        });
        res.json({
            error: null
        });
        return;
    } catch (err) {
        debug('regist error', err);
        res.json({
            error: err.message
        });
        return;
    }
}

/**
 * 更新
 * @function update
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function update(req: Request, res: Response): Promise<void> {
    try {
        const id = req.body.performance;
        await Models.Performance.findByIdAndUpdate(id, {
            screen: req.body.screen,
            open_time: req.body.openTime,
            start_time: req.body.startTime,
            end_time: req.body.endTime
        }).exec();
        res.json({
            error: null
        });
        return;
    } catch (err) {
        debug('update error', err);
        res.json({
            error: err.message
        });
        return;
    }
}
