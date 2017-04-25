"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 作品マスタ管理ルーター
 *
 * @desc FilmRouter
 * @ignore
 */
const express_1 = require("express");
const FilmController_1 = require("../controllers/Master/Film/FilmController");
const router = express_1.Router();
// 作品登録・一覧 'master.film.add' 'master.film.list' 'master.film.getlist'
router.all('/add', (req, res, next) => { (new FilmController_1.default(req, res, next)).add(); });
router.all('/list', (req, res, next) => { (new FilmController_1.default(req, res, next)).list(); });
router.all('/getlist', (req, res, next) => { (new FilmController_1.default(req, res, next)).getList(); });
exports.default = router;
