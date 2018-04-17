"use strict";
/**
 * レポート出力管理ルーター
 * @namespace routes.reports
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
const tttsapi = require("@motionpicture/ttts-api-nodejs-client");
const createDebug = require("debug");
const express_1 = require("express");
const reportsController = require("../controllers/reports");
const debug = createDebug('ttts-backend:routes:report');
const reportsRouter = express_1.Router();
const authClient = new tttsapi.auth.OAuth2({
    domain: process.env.API_AUTHORIZE_SERVER_DOMAIN,
    clientId: process.env.API_CLIENT_ID,
    clientSecret: process.env.API_CLIENT_SECRET
});
// 売り上げレポート出力
reportsRouter.get('', (__, res) => {
    res.render('reports/index', {
        title: 'レポート',
        routeName: 'master.report.index',
        layout: 'layouts/master/layout'
    });
});
reportsRouter.get('/sales', (__, res) => {
    res.render('reports/sales', {
        title: '売り上げレポート出力',
        routeName: 'master.report.sales',
        layout: 'layouts/master/layout'
    });
});
// アカウント別レポート出力
reportsRouter.get('/account', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const cognitoCredentials = req.session.cognitoCredentials;
        authClient.setCredentials({
            refresh_token: cognitoCredentials.refreshToken,
            // expiry_date: number;
            access_token: cognitoCredentials.accessToken,
            token_type: cognitoCredentials.tokenType
        });
        const adminService = new tttsapi.service.Admin({
            endpoint: process.env.API_ENDPOINT,
            auth: authClient
        });
        const cognitoUsers = yield adminService.search({ group: 'Staff' });
        debug('cognitoUsers:', cognitoUsers);
        if (cognitoUsers.length <= 0) {
            throw new Error('Staff admin users not found.');
        }
        const hours = [];
        // tslint:disable-next-line:no-magic-numbers
        for (let hour = 0; hour < 24; hour += 1) {
            // tslint:disable-next-line:no-magic-numbers
            hours.push((`00${hour}`).slice(-2));
        }
        //const minutes: string[] = ['00', '15', '30', '45'];
        const minutes = [];
        // tslint:disable-next-line:no-magic-numbers
        for (let minute = 0; minute < 60; minute += 1) {
            // tslint:disable-next-line:no-magic-numbers
            minutes.push((`00${minute}`).slice(-2));
        }
        // 画面描画
        res.render('reports/account', {
            cognitoUsers: cognitoUsers,
            hours: hours,
            minutes: minutes,
            title: 'アカウント別レポート出力',
            routeName: 'master.report.account',
            layout: 'layouts/master/layout'
        });
    }
    catch (error) {
        next(error);
    }
}));
reportsRouter.get('/getSales', reportsController.getSales);
exports.default = reportsRouter;
