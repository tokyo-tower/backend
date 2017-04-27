/**
 * デフォルトルーター
 *
 * @ignore
 */

import * as express from 'express';
const router = express.Router();

import * as IndexController from '../controllers/index';

router.get('/', IndexController.index);

export default router;
