"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 券種グループマスタ管理ルーター
 *
 * @desc TicketTypeGroupsRouter
 * @ignore
 */
const express_1 = require("express");
const ticketTypeGroup_1 = require("../controllers/master/ticketTypeGroup");
const router = express_1.Router();
// 券種登録
router.all('/add', (req, res, next) => { (new ticketTypeGroup_1.default(req, res, next)).add(); });
// 券種一覧
router.all('', (req, res, next) => { (new ticketTypeGroup_1.default(req, res, next)).list(); });
router.all('/getlist', (req, res, next) => { (new ticketTypeGroup_1.default(req, res, next)).getList(); });
exports.default = router;
