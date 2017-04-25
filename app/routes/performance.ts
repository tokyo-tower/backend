/**
 * パフォーマンス管理ルーター
 *
 * @desc performanceRouter
 * @ignore
 */
import { Router } from 'express';
import * as performanceController from '../controllers/Master/performance';

const router = Router();

router.get('',　performanceController.index);

export default router;
