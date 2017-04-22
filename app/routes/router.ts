/**
 * デフォルトルーター
 *
 * @ignore
 */

import * as express from 'express';
import * as IndexController from '../controllers/index';

const router = express.Router();

router.get('/', IndexController.index);

export default router;
