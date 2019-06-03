"use strict";
/**
 * expressアプリケーション
 * @ignore
 */
const middlewares = require("@motionpicture/express-middleware");
const ttts = require("@motionpicture/ttts-domain");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const createDebug = require("debug");
const express = require("express");
const expressValidator = require("express-validator");
const helmet = require("helmet");
const multer = require("multer");
const favicon = require("serve-favicon");
// tslint:disable-next-line:no-var-requires no-require-imports
const expressLayouts = require('express-ejs-layouts');
const mongooseConnectionOptions_1 = require("../mongooseConnectionOptions");
// ミドルウェア
const authentication_1 = require("./middlewares/authentication");
const errorHandler_1 = require("./middlewares/errorHandler");
const locals_1 = require("./middlewares/locals");
const notFoundHandler_1 = require("./middlewares/notFoundHandler");
const session_1 = require("./middlewares/session");
// ルーター
const auth_1 = require("./routes/auth");
const dev_1 = require("./routes/dev");
const reports_1 = require("./routes/reports");
const router_1 = require("./routes/router");
const debug = createDebug('ttts-backend:app');
const app = express();
app.use(middlewares.basicAuth({
    name: process.env.BASIC_AUTH_NAME,
    pass: process.env.BASIC_AUTH_PASS
}));
app.use(cors()); // enable All CORS Requests
app.use(helmet());
app.use(session_1.default); // セッション
app.use(locals_1.default); // テンプレート変数
if (process.env.NODE_ENV !== 'production') {
    // サーバーエラーテスト
    app.get('/dev/uncaughtexception', (req) => {
        req.on('data', (chunk) => {
            debug(chunk);
        });
        req.on('end', () => {
            throw new Error('uncaughtexception manually');
        });
    });
}
// view engine setup
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(expressLayouts);
// tslint:disable-next-line:no-backbone-get-set-outside-model
app.set('layout', 'layouts/layout');
// uncomment after placing your favicon in /public
app.use(favicon(`${__dirname}/../public/favicon.ico`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// for parsing multipart/form-data
const storage = multer.memoryStorage();
app.use(multer({ storage: storage }).any());
app.use(cookieParser());
app.use(express.static(`${__dirname}/../public`));
app.use(expressValidator()); // バリデーション
// ルーティング登録の順序に注意！
if (process.env.NODE_ENV !== 'production') {
    app.use('/dev', dev_1.default);
}
app.use(auth_1.default); // ログイン・ログアウト
app.use(authentication_1.default); // ユーザー認証
app.use(router_1.default);
app.use('/reports', reports_1.default); //レポート出力
// 404
app.use(notFoundHandler_1.default);
// error handlers
app.use(errorHandler_1.default);
ttts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default)
    .then()
    // tslint:disable-next-line:no-console
    .catch(console.error);
module.exports = app;
