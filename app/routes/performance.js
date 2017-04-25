"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * パフォーマンス管理ルーター
 *
 * @desc performanceRouter
 * @ignore
 */
const express_1 = require("express");
const performanceController = require("../controllers/Master/performance");
const router = express_1.Router();
router.get('', performanceController.index);
exports.default = router;
//# sourceMappingURL=performance.js.map