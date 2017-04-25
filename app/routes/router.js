/**
 * デフォルトルーター
 *
 * @ignore
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IndexController = require("../controllers/index");
const MasterAdminUser_1 = require("../models/User/MasterAdminUser");
const master_1 = require("./master");
const film_1 = require("./film");
const performance_1 = require("./performance");
exports.default = (app) => {
    app.get('/', IndexController.index);
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
    const baseMiddleware = (req, res, next) => {
        res.locals.req = req;
        req.staffUser = MasterAdminUser_1.default.PARSE(req.session);
        next();
    };
    // ログイン・ログアウト
    app.use('/master', baseMiddleware, master_1.default);
    //作品
    app.use('/master/film', baseMiddleware, film_1.default);
    //パフォーマンス
    app.use('/master/performance', baseMiddleware, performance_1.default);
};
//# sourceMappingURL=router.js.map