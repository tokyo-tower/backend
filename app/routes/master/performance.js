"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * パフォーマンス管理ルーター
 *
 * @desc performanceRouter
 * @ignore
 */
const express_1 = require("express");
const performanceController = require("../../controllers/master/performance");
const router = express_1.Router();
router.get('', performanceController.index);
router.post('/search', performanceController.search);
router.post('/film/search', performanceController.filmSearch);
router.post('/regist', performanceController.regist);
router.post('/update', performanceController.update);
exports.default = router;
