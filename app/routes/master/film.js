"use strict";
/**
 * 作品マスタ管理ルーター
 *
 * @desc FilmRouter
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filmController = require("../../controllers/master/film");
const router = express_1.Router();
router.all('/add', filmController.add);
router.all('', filmController.index);
router.all('/getlist', filmController.getList);
exports.default = router;
