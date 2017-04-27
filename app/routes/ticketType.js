"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 券種マスタ管理ルーター
 *
 * @desc TicketTypeRouter
 * @ignore
 */
const express_1 = require("express");
const TicketTypeController_1 = require("../controllers/Master/TicketTypeController");
const router = express_1.Router();
// 券種登録
router.all('/add', (req, res, next) => { (new TicketTypeController_1.default(req, res, next)).add(); });
// 券種一覧
router.all('/list', (req, res, next) => { (new TicketTypeController_1.default(req, res, next)).list(); });
router.all('/getlist', (req, res, next) => { (new TicketTypeController_1.default(req, res, next)).getList(); });
exports.default = router;
