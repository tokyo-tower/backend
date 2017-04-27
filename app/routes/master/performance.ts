/**
 * パフォーマンス管理ルーター
 *
 * @desc performanceRouter
 * @ignore
 */
import { Router } from 'express';
import * as performanceController from '../../controllers/master/performance';

const router = Router();

router.get('', performanceController.index);
router.post('/search', performanceController.search);
router.post('/film/search', performanceController.filmSearch);
router.post('/regist', performanceController.regist);
router.post('/update', performanceController.update);
export default router;
