"use strict";
/**
 * ユーザー認証ミドルウェア
 *
 * @module middlewares/userAuthentication
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chevre_domain_1 = require("@motionpicture/chevre-domain");
const createDebug = require("debug");
const Message = require("../../common/Const/Message");
const masterAdmin_1 = require("../models/user/masterAdmin");
const debug = createDebug('chevre-backend:middlewares:userAuthentication');
const cookieName = 'remember_master_admin';
exports.default = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    res.locals.req = req;
    req.staffUser = masterAdmin_1.default.PARSE(req.session);
    debug('req.staffUser:', req.staffUser);
    if (req.staffUser === undefined) {
        next(new Error(Message.Common.unexpectedError));
        return;
    }
    // 既ログインの場合
    if (req.staffUser.isAuthenticated()) {
        next();
        return;
    }
    // 自動ログインチェック
    const userSession = yield checkRemember(req, res);
    if (userSession !== null && req.session !== undefined) {
        // ログインしてリダイレクト
        req.session[masterAdmin_1.default.AUTH_SESSION_NAME] = userSession.staff.toObject();
        res.redirect(req.originalUrl);
    }
    else {
        if (req.xhr) {
            res.json({
                success: false,
                message: 'login required'
            });
        }
        else {
            res.redirect(`/master/login?cb=${req.originalUrl}`);
        }
    }
});
/**
 * ログイン記憶しているかどうか確認する
 *
 * @param {Request} req リクエスト
 * @param {Response} res レスポンス
 * @returns {Document|null}
 */
function checkRemember(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.cookies[cookieName] === undefined) {
            return null;
        }
        try {
            const authenticationDoc = yield chevre_domain_1.Models.Authentication.findOne({
                token: req.cookies[cookieName],
                staff: { $ne: null }
            }).exec();
            if (authenticationDoc === null) {
                res.clearCookie(cookieName);
                return null;
            }
            // トークン再生成
            const token = chevre_domain_1.CommonUtil.createToken();
            yield authenticationDoc.update({ token: token }).exec();
            // tslint:disable-next-line:no-cookies
            res.cookie(cookieName, token, { path: '/', httpOnly: true, maxAge: 604800000 });
            const staff = yield chevre_domain_1.Models.Staff.findOne({ _id: authenticationDoc.get('staff') }).exec();
            return {
                staff: staff
            };
        }
        catch (error) {
            return null;
        }
    });
}
