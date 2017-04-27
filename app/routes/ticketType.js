"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 券種マスタ管理ルーター
 *
 * @desc TicketTypeRouter
 * @ignore
 */
const express_1 = require("express");
const ticketType_1 = require("../controllers/master/ticketType");
const router = express_1.Router();
// 券種登録
router.all('/add', (req, res, next) => { (new ticketType_1.default(req, res, next)).add(); });
// 券種一覧
router.all('', (req, res, next) => { (new ticketType_1.default(req, res, next)).list(); });
router.all('/getlist', (req, res, next) => { (new ticketType_1.default(req, res, next)).getList(); });
exports.default = router;
