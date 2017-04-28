"use strict";
/**
 * 券種マスタ管理ルーター
 *
 * @desc TicketTypeRouter
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketTypeController = require("../../controllers/master/ticketType");
const router = express_1.Router();
// 券種登録
router.all('/add', ticketTypeController.add);
// 券種一覧
router.get('', ticketTypeController.index);
router.get('/getlist', ticketTypeController.getList);
exports.default = router;
