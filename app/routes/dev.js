/**
 * devルーター
 *
 * @ignore
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const createDebug = require("debug");
const http_status_1 = require("http-status");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
const debug = createDebug('chevre-backend:routers:dev');
router.get('/400', () => {
    throw new Error('400 manually');
});
router.get('/environmentVariables', (__, res) => {
    res.json({
        data: {
            type: 'envs',
            attributes: process.env
        }
    });
});
router.get('/mongoose/connect', (__, res, next) => {
    debug('connecting...');
    mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default, (err) => {
        if (err instanceof Error) {
            next(err);
            return;
        }
        res.status(http_status_1.NO_CONTENT).end();
    });
});
router.get('/mongoose/disconnect', (__, res, next) => {
    debug('disconnecting...');
    mongoose.disconnect((err) => {
        if (err instanceof Error) {
            next(err);
            return;
        }
        res.status(http_status_1.NO_CONTENT).end();
    });
});
exports.default = router;
//# sourceMappingURL=dev.js.map