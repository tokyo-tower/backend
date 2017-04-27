/**
 * 券種グループマスタ管理ルーター
 *
 * @desc TicketTypeGroupsRouter
 * @ignore
 */
import { NextFunction, Request, Response, Router } from 'express';
import TicketTypeGroupsController from '../controllers/master/ticketTypeGroup';

const router = Router();

// 券種登録
router.all('/add',
           (req: Request, res: Response, next: NextFunction) => { (new TicketTypeGroupsController(req, res, next)).add(); });
// 券種一覧
router.all('',
           (req: Request, res: Response, next: NextFunction) => { (new TicketTypeGroupsController(req, res, next)).list(); });
router.all('/getlist',
           (req: Request, res: Response, next: NextFunction) => { (new TicketTypeGroupsController(req, res, next)).getList(); });

export default router;
