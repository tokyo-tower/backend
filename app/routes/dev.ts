/**
 * devルーター
 * @namespace routes.dev
 */

import * as ttts from '@tokyotower/domain';
import * as createDebug from 'debug';
import * as express from 'express';
import { NO_CONTENT } from 'http-status';

const devRouter = express.Router();

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

const debug = createDebug('ttts-backend:devRouters:dev');

devRouter.get(
    '/400',
    () => {
        throw new Error('400 manually');
    }
);

devRouter.get(
    '/environmentVariables',
    (__, res) => {
        res.json({
            data: {
                type: 'envs',
                attributes: process.env
            }
        });
    }
);

devRouter.get(
    '/mongoose/connect',
    (__, res, next) => {
        debug('connecting...');
        ttts.mongoose.connect((<any>process.env).MONGOLAB_URI, mongooseConnectionOptions, (err) => {
            if (err instanceof Error) {
                next(err);

                return;
            }

            res.status(NO_CONTENT).end();
        });
    }
);

devRouter.get(
    '/mongoose/disconnect',
    (__, res, next) => {
        debug('disconnecting...');
        ttts.mongoose.disconnect((err) => {
            if (err instanceof Error) {
                next(err);

                return;
            }

            res.status(NO_CONTENT).end();
        });
    }
);

export default devRouter;
