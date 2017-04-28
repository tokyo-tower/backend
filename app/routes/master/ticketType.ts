/**
 * 券種マスタ管理ルーター
 *
 * @desc TicketTypeRouter
 * @ignore
 */

import { Router } from 'express';
import * as ticketTypeController from '../../controllers/master/ticketType';

const router = Router();

// 券種登録
router.all('/add', ticketTypeController.add);
// 券種一覧
router.get('', ticketTypeController.index);
router.get('/getlist', ticketTypeController.getList);

export default router;
