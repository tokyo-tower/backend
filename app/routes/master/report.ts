/**
 * レポート出力管理ルーター
 *
 * @desc reportRouter
 * @ignore
 */

import { Router } from 'express';
import * as reportController from '../../controllers/master/report';

const router = Router();

// 売り上げレポート出力
router.get('', reportController.index);
router.get('/getSales', reportController.getSales);
// アカウント別レポート出力

export default router;
