/**
 * レポート出力管理ルーター
 * @namespace routes.reports
 */

import { Router } from 'express';
import * as reportsController from '../controllers/reports';

const reportsRouter = Router();

// 売り上げレポート出力
reportsRouter.get('', reportsController.index);
reportsRouter.get('/sales', reportsController.sales);
// アカウント別レポート出力
reportsRouter.get('/account', reportsController.account);
reportsRouter.get('/getSales', reportsController.getSales);

export default reportsRouter;
