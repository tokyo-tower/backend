"use strict";
/**
 * expressアプリケーション
 *
 * @ignore
 */
// 依存パッケージ
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const createDebug = require("debug");
const express = require("express");
const helmet = require("helmet");
const i18n = require("i18n");
const mongoose = require("mongoose");
const multer = require("multer");
const favicon = require("serve-favicon");
// tslint:disable-next-line:no-require-imports
const expressValidator = require("express-validator");
// tslint:disable-next-line:no-var-requires no-require-imports
const expressLayouts = require('express-ejs-layouts');
const mongooseConnectionOptions_1 = require("../mongooseConnectionOptions");
// ミドルウェア
const basicAuth_1 = require("./middlewares/basicAuth");
const benchmarks_1 = require("./middlewares/benchmarks");
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = require("./middlewares/logger");
const notFoundHandler_1 = require("./middlewares/notFoundHandler");
const session_1 = require("./middlewares/session");
// ルーター
const dev_1 = require("./routes/dev");
const router_1 = require("./routes/router");
const debug = createDebug('chevre-backend:app');
const app = express();
if (process.env.NODE_ENV === 'development') {
    app.use(logger_1.default); // ロガー
}
app.use(basicAuth_1.default); // ベーシック認証
app.use(cors()); // enable All CORS Requests
app.use(helmet());
app.use(benchmarks_1.default); // ベンチマーク的な
app.use(session_1.default); // セッション
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
app.use(favicon(__dirname + '/../public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// for parsing multipart/form-data
const storage = multer.memoryStorage();
app.use(multer({ storage: storage }).any());
app.use(cookieParser());
app.use(express.static(__dirname + '/../public'));
app.use(expressValidator()); // バリデーション
// i18n を利用する設定
i18n.configure({
    locales: ['en', 'ja'],
    defaultLocale: 'ja',
    directory: __dirname + '/../locales',
    objectNotation: true,
    updateFiles: false // ページのビューで自動的に言語ファイルを更新しない
});
// i18n の設定を有効化
app.use(i18n.init);
// セッションで言語管理
app.use((req, _res, next) => {
    if (req.session.locale) {
        req.setLocale(req.session.locale);
    }
    if (req.query.locale) {
        req.setLocale(req.query.locale);
        req.session.locale = req.query.locale;
    }
    next();
});
// Use native promises
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
// ルーティング登録の順序に注意！
router_1.default(app);
if (process.env.NODE_ENV !== 'production') {
    app.use('/dev', dev_1.default);
}
// 404
app.use(notFoundHandler_1.default);
// error handlers
app.use(errorHandler_1.default);
module.exports = app;
