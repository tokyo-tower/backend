"use strict";
/**
 * ユーザー認証ルーター
 *
 * @function authRouter
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const masterAuthController = require("../controllers/master/auth");
const router = express_1.Router();
// ログイン・ログアウト
router.all('/master/login', masterAuthController.login);
//'master.logout
router.all('/master/logout', masterAuthController.logout);
exports.default = router;
