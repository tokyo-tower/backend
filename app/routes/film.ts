/**
 * 作品マスタ管理ルーター
 *
 * @desc FilmRouter
 * @ignore
 */

import { Router } from 'express';
import * as filmController from '../controllers/master/film';

const router = Router();

router.all('/add', filmController.add);
router.all('', filmController.index);
router.all('/getlist', filmController.getList);

export default router;
