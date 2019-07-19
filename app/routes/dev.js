"use strict";
/**
 * devルーター
 * @namespace routes.dev
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ttts = require("@tokyotower/domain");
const createDebug = require("debug");
const express = require("express");
const http_status_1 = require("http-status");
const devRouter = express.Router();
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
const debug = createDebug('ttts-backend:devRouters:dev');
devRouter.get('/400', () => {
    throw new Error('400 manually');
});
devRouter.get('/environmentVariables', (__, res) => {
    res.json({
        data: {
            type: 'envs',
            attributes: process.env
        }
    });
});
devRouter.get('/mongoose/connect', (__, res, next) => {
    debug('connecting...');
    ttts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default, (err) => {
        if (err instanceof Error) {
            next(err);
            return;
        }
        res.status(http_status_1.NO_CONTENT).end();
    });
});
devRouter.get('/mongoose/disconnect', (__, res, next) => {
    debug('disconnecting...');
    ttts.mongoose.disconnect((err) => {
        if (err instanceof Error) {
            next(err);
            return;
        }
        res.status(http_status_1.NO_CONTENT).end();
    });
});
exports.default = devRouter;
