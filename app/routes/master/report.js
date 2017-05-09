"use strict";
/**
 * レポート出力管理ルーター
 *
 * @desc reportRouter
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController = require("../../controllers/master/report");
const router = express_1.Router();
// 売り上げレポート出力
router.get('', reportController.index);
router.get('/getSales', reportController.getSales);
// アカウント別レポート出力
exports.default = router;
