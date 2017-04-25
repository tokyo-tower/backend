/**
 * expressアプリケーション
 *
 * @ignore
 */

// 依存パッケージ
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as createDebug from 'debug';
import * as express from 'express';
import * as helmet from 'helmet';
import * as i18n from 'i18n';
import * as mongoose from 'mongoose';
import * as multer from 'multer';
import * as favicon from 'serve-favicon';
// tslint:disable-next-line:no-require-imports
import expressValidator = require('express-validator');
// tslint:disable-next-line:no-var-requires no-require-imports
const expressLayouts = require('express-ejs-layouts');

import mongooseConnectionOptions from '../mongooseConnectionOptions';

// ミドルウェア
import basicAuth from './middlewares/basicAuth';
import benchmarks from './middlewares/benchmarks';
import errorHandler from './middlewares/errorHandler';
import logger from './middlewares/logger';
import notFoundHandler from './middlewares/notFoundHandler';
import session from './middlewares/session';

// ルーター
import devRouter from './routes/dev';
import router from './routes/router';

const debug = createDebug('chevre-backend:app');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(logger); // ロガー
}

app.use(basicAuth); // ベーシック認証
app.use(cors()); // enable All CORS Requests
app.use(helmet());
app.use(benchmarks); // ベンチマーク的な
app.use(session); // セッション

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
    if ((<any>req.session).locale) {
        req.setLocale((<any>req.session).locale);
    }
    if (req.query.locale) {
        req.setLocale(req.query.locale);
        (<any>req.session).locale = req.query.locale;
    }
    next();
});

// Use native promises
(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions);

// ルーティング登録の順序に注意！
router(app);


if (process.env.NODE_ENV !== 'production') {
    app.use('/dev', devRouter);
}

// 404
app.use(notFoundHandler);

// error handlers
app.use(errorHandler);

export = app;
