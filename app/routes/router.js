"use strict";
/**
 * デフォルトルーター
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const IndexController = require("../controllers/index");
router.get('/', IndexController.index);
exports.default = router;
