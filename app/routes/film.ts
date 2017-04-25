/**
 * 作品マスタ管理ルーター
 *
 * @desc FilmRouter
 * @ignore
 */
import { Router, NextFunction, Request, Response } from 'express';
import FilmController from '../controllers/Master/Film/FilmController';

const router = Router();

// 作品登録・一覧 'master.film.add' 'master.film.list' 'master.film.getlist'
router.all('/add',
    (req: Request, res: Response, next: NextFunction) => { (new FilmController(req, res, next)).add(); });
router.all('/list',
    (req: Request, res: Response, next: NextFunction) => { (new FilmController(req, res, next)).list(); });
router.all('/getlist',
    (req: Request, res: Response, next: NextFunction) => { (new FilmController(req, res, next)).getList(); });

export default router;
