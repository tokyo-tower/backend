"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import { Document } from 'mongoose';
//import * as Util from '../../common/Util/Util';
const MasterAuthController_1 = require("../controllers/Master/Auth/MasterAuthController");
const FilmController_1 = require("../controllers/Master/Film/FilmController");
const MasterAdminUser_1 = require("../models/User/MasterAdminUser");
exports.default = (app) => {
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
    const baseMiddleware = (req, _res, next) => {
        req.staffUser = MasterAdminUser_1.default.PARSE(req.session);
        next();
    };
    // ログイン・ログアウト
    app.all('/master/login', baseMiddleware, (req, res, next) => { (new MasterAuthController_1.default(req, res, next)).login(); });
    //'master.logout
    app.all('/master/logout', baseMiddleware, (req, res, next) => { (new MasterAuthController_1.default(req, res, next)).logout(); });
    // 作品登録・一覧 'master.film.add' 'master.film.list' 'master.film.getlist'
    app.all('/master/film/add', baseMiddleware, (req, res, next) => { (new FilmController_1.default(req, res, next)).add(); });
    app.all('/master/film/list', baseMiddleware, (req, res, next) => { (new FilmController_1.default(req, res, next)).list(); });
    app.all('/master/film/getlist', baseMiddleware, (req, res, next) => { (new FilmController_1.default(req, res, next)).getList(); });
};
//# sourceMappingURL=master.js.map