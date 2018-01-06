"use strict";
/**
 * レポート出力管理ルーター
 * @namespace routes.reports
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportsController = require("../controllers/reports");
const reportsRouter = express_1.Router();
// 売り上げレポート出力
reportsRouter.get('', reportsController.index);
reportsRouter.get('/sales', reportsController.sales);
// アカウント別レポート出力
reportsRouter.get('/account', reportsController.account);
reportsRouter.get('/getSales', reportsController.getSales);
exports.default = reportsRouter;
