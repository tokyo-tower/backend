/**
 * 券種グループマスタ管理ルーター
 *
 * @desc TicketTypeGroupsRouter
 * @ignore
 */
import { Router } from 'express';
import * as ticketTypeGroupsController from '../../controllers/master/ticketTypeGroup';

const router = Router();

router.all('/add', ticketTypeGroupsController.add);
router.get('', ticketTypeGroupsController.index);
router.get('/getlist', ticketTypeGroupsController.getList);

export default router;
