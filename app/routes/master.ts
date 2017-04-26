/**
 * マスタ管理ルーター
 *
 * @function memberRouter
 * @ignore
 */
import { NextFunction, Request, Response, Router } from 'express';
import MasterAuthController from '../controllers/Master/Auth/MasterAuthController';

const router = Router();

// ログイン・ログアウト
router.all('/login',
           (req: Request, res: Response, next: NextFunction) => { (new MasterAuthController(req, res, next)).login(); });
//'master.logout
router.all('/logout',
           (req: Request, res: Response, next: NextFunction) => { (new MasterAuthController(req, res, next)).logout(); });

export default router;
