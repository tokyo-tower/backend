"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * マスタ管理ルーター
 *
 * @function memberRouter
 * @ignore
 */
const express_1 = require("express");
const MasterAuthController_1 = require("../controllers/Master/Auth/MasterAuthController");
const router = express_1.Router();
// ログイン・ログアウト
router.all('/login', (req, res, next) => { (new MasterAuthController_1.default(req, res, next)).login(); });
//'master.logout
router.all('/logout', (req, res, next) => { (new MasterAuthController_1.default(req, res, next)).logout(); });
exports.default = router;
//# sourceMappingURL=master.js.map