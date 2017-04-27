/**
 * ユーザー認証ルーター
 *
 * @function authRouter
 * @ignore
 */

import { Router } from 'express';
import * as masterAuthController from '../../controllers/master/auth';

const router = Router();

// ログイン・ログアウト
router.all('/master/login', masterAuthController.login);
//'master.logout
router.all('/master/logout', masterAuthController.logout);

export default router;
