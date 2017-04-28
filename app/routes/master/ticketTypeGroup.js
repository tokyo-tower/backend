"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 券種グループマスタ管理ルーター
 *
 * @desc TicketTypeGroupsRouter
 * @ignore
 */
const express_1 = require("express");
const ticketTypeGroupsController = require("../../controllers/master/ticketTypeGroup");
const router = express_1.Router();
router.all('/add', ticketTypeGroupsController.add);
router.get('', ticketTypeGroupsController.index);
router.get('/getlist', ticketTypeGroupsController.getList);
exports.default = router;
