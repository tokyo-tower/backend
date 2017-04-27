/**
 * 券種グループマスタ管理ルーター
 *
 * @desc TicketTypeGroupsRouter
 * @ignore
 */
import { Router } from 'express';
import * as ticketTypeGroupsController from '../../controllers/master/ticketTypeGroup';

const router = Router();

// 券種登録
router.all('/add', ticketTypeGroupsController.add);
// 券種一覧
router.get('', ticketTypeGroupsController.list);
router.get('/getlist', ticketTypeGroupsController.getList);

export default router;
