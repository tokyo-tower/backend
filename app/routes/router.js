/**
 * デフォルトルーター
 *
 * @ignore
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const IndexController = require("../controllers/index");
const router = express.Router();
router.get('/', IndexController.index);
exports.default = router;
//# sourceMappingURL=router.js.map