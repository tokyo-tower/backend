/**
 * マスタ管理ルーター
 *
 * @function memberRouter
 * @ignore
 */
//import { Models } from '@motionpicture/chevre-domain';
import { NextFunction, Request, Response } from 'express';
//import { Document } from 'mongoose';
//import * as Util from '../../common/Util/Util';
import MasterAuthController from '../controllers/Master/Auth/MasterAuthController';
import FilmController from '../controllers/Master/Film/FilmController';
import MasterAdminUser from '../models/User/MasterAdminUser';

export default (app: any) => {
    /*
    const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
        if (!req.staffUser) return next(new Error(req.__('Message.UnexpectedError')));
        if (!req.staffUser.isAuthenticated()) {
            // 自動ログインチェック
            const checkRemember = (cb: (user: Document | null, signature: string | null, locale: string | null) => void) => {
                if (req.cookies.remember_master_admin) {
                    Models.Authentication.findOne(
                        {
                            token: req.cookies.remember_master_admin,
                            staff: { $ne: null }
                        },
                        (err, authentication) => {
                            if (err) return cb(null, null, null);

                            if (authentication) {
                                // トークン再生成
                                const token = Util.createToken();
                                authentication.update(
                                    {
                                        token: token
                                    },
                                    (updateErr) => {
                                        if (updateErr) return cb(null, null, null);

                                        res.cookie('remember_master_admin', token, { path: '/', httpOnly: true, maxAge: 604800000 });
                                        Models.Staff.findOne({ _id: authentication.get('staff') }, (findErr, staff) => {
                                            (findErr) ? cb(null, null, null) : cb(staff, authentication.get('signature'),
                                            authentication.get('locale'));
                                        });
                                    }
                                );
                            } else {
                                res.clearCookie('remember_master_admin');
                                cb(null, null, null);
                            }
                        }
                    );
                } else {
                    cb(null, null, null);
                }
            };

            checkRemember((user, signature, locale) => {
                if (user && req.session) {
                    // ログインしてリダイレクト
                    req.session[MasterAdminUser.AUTH_SESSION_NAME] = user.toObject();
                    req.session[MasterAdminUser.AUTH_SESSION_NAME].signature = signature;
                    req.session[MasterAdminUser.AUTH_SESSION_NAME].locale = locale;
                    // if exist parameter cb, redirect to cb.
                    res.redirect(req.originalUrl);
                } else {
                    if (req.xhr) {
                        res.json({
                            success: false,
                            message: 'login required.'
                        });
                    } else {
                        res.redirect(`/master/login?cb=${req.originalUrl}`);
                    }
                }
            });
        } else {
            // 言語設定
            req.setLocale((req.staffUser.get('locale')) ? req.staffUser.get('locale') : 'en');
            next();
        }
    };
*/
    const baseMiddleware = (req: Request, _res: Response, next: NextFunction) => {
        req.staffUser = MasterAdminUser.PARSE(req.session);
        next();
    };

    // ログイン・ログアウト
    app.all('/master/login', 'master.login', baseMiddleware,
            (req: Request, res: Response, next: NextFunction) => {
                 (new MasterAuthController(req, res, next)).login(); });
    app.all('/master/logout', 'master.logout', baseMiddleware,
            (req: Request, res: Response, next: NextFunction) => { (new MasterAuthController(req, res, next)).logout(); });
    // 作品登録・一覧
    app.all('/master/film/add', 'master.film.add', baseMiddleware,
            (req: Request, res: Response, next: NextFunction) => { (new FilmController(req, res, next)).add(); });
    app.all('/master/film/list', 'master.film.list', baseMiddleware,
            (req: Request, res: Response, next: NextFunction) => { (new FilmController(req, res, next)).list(); });
    app.all('/master/film/getlist', 'master.film.getlist', baseMiddleware,
            (req: Request, res: Response, next: NextFunction) => { (new FilmController(req, res, next)).getList(); });
};
