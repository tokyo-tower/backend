/**
 * 券種マスタ管理ルーター
 *
 * @desc TicketTypeRouter
 * @ignore
 */
import { NextFunction, Request, Response, Router } from 'express';
import TicketTypeController from '../controllers/Master/TicketTypeController';

const router = Router();

// 作品登録・一覧 'master.film.add' 'master.film.list' 'master.film.getlist'
router.all('/add',
           (req: Request, res: Response, next: NextFunction) => { (new TicketTypeController(req, res, next)).add(); });
router.all('/list',
           (req: Request, res: Response, next: NextFunction) => { (new TicketTypeController(req, res, next)).list(); });
// router.all('/getlist',
//     (req: Request, res: Response, next: NextFunction) => { (new TicketTypeController(req, res, next)).getList(); });

export default router;
